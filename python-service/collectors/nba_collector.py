"""
Load NBA player box scores (and the upcoming schedule) from the Kaggle dataset
"eoinamoore/historical-nba-data-and-player-box-scores" (CC0, refreshed nightly) into Postgres.

Everything is upserted, so re-running is safe:
    python -m collectors.nba_collector                     # current + previous season
    python -m collectors.nba_collector --seasons 2026-27   # just the current season (daily refresh)

Env vars:
    KAGGLE_USERNAME, KAGGLE_KEY (or KAGGLE_API_TOKEN) - read by kagglehub
    PGHOST, PGUSER, PGPASSWORD, PGDATABASE, PGPORT     - DB connection (standard libpq vars)
"""

import argparse
import csv
import os
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import date

import kagglehub
import psycopg

from collectors.nba_teams import TEAMS

DATASET = "eoinamoore/historical-nba-data-and-player-box-scores"

# nba.com game ids look like 0022600226: [2] = game type, [3:5] = season start year
# 1 = preseason, 2 = regular season, 3 = All-Star, 4 = playoffs, 5 = play-in, 6 = NBA Cup final
INCLUDED_GAME_TYPES = {"2", "4", "5", "6"}


# ---------- seasons ----------

def season_string(start_year: int) -> str:
    return f"{start_year}-{(start_year + 1) % 100:02d}"


def current_season(today: date | None = None) -> str:
    """NBA seasons start in October: Nov 2026 -> '2026-27', Mar 2026 -> '2025-26'."""
    today = today or date.today()
    start_year = today.year if today.month >= 10 else today.year - 1
    return season_string(start_year)


def previous_season(season: str) -> str:
    return season_string(int(season[:4]) - 1)


def normalize_game_id(raw: str) -> str:
    return raw.strip().zfill(10)


def game_season(game_id: str) -> str:
    return season_string(2000 + int(game_id[3:5]))


def wanted(game_id: str, seasons: set[str]) -> bool:
    return game_id[2] in INCLUDED_GAME_TYPES and game_season(game_id) in seasons


# ---------- parsing ----------

@contextmanager
def download(name: str) -> Iterator[str]:
    """Download a dataset file, yield its path, then delete it.
    kagglehub caches every dataset version, which would add ~370 MB per day in a long-running container."""
    print(f"Downloading {name}...")
    path = kagglehub.dataset_download(DATASET, path=name)
    try:
        yield path
    finally:
        os.remove(path)


def parse_minutes(value: str) -> float:
    """'30.666666666666668' -> 30.67, '36:16' -> 36.27, '' -> 0."""
    value = value.strip()
    if not value:
        return 0.0
    if ":" in value:
        mins, secs = value.split(":", 1)
        return round(int(mins) + int(secs or 0) / 60, 2)
    return round(float(value), 2)


def to_int(value: str) -> int:
    return int(float(value)) if value.strip() else 0


def read_box_scores(seasons: set[str]) -> list[dict]:
    rows = []
    skipped_dnp = 0
    with download("PlayerStatistics.csv") as path, open(path, newline="", encoding="utf-8") as fh:
        for r in csv.DictReader(fh):
            game_id = normalize_game_id(r["gameId"])
            if not wanted(game_id, seasons):
                continue
            team_id, opp_id = to_int(r["playerteamId"]), to_int(r["opponentteamId"])
            if team_id not in TEAMS or opp_id not in TEAMS or not r["gameDateTimeEst"]:
                continue
            minutes = parse_minutes(r["numMinutes"])
            if minutes == 0:  # DNP / inactive: not a played game for hit rates
                skipped_dnp += 1
                continue
            is_home = r["home"] == "1"
            rows.append({
                "player_id": int(r["personId"]),
                "player_name": f"{r['firstName']} {r['lastName']}".strip(),
                "game_id": game_id,
                "game_date": date.fromisoformat(r["gameDateTimeEst"][:10]),
                "season": game_season(game_id),
                "team_id": team_id,
                "opponent_id": opp_id,
                "home_team_id": team_id if is_home else opp_id,
                "away_team_id": opp_id if is_home else team_id,
                "is_home": is_home,
                "minutes": minutes,
                "pts": to_int(r["points"]),
                "reb": to_int(r["reboundsTotal"]),
                "ast": to_int(r["assists"]),
                "stl": to_int(r["steals"]),
                "blk": to_int(r["blocks"]),
                "tov": to_int(r["turnovers"]),
                "fgm": to_int(r["fieldGoalsMade"]),
                "fga": to_int(r["fieldGoalsAttempted"]),
                "fg3m": to_int(r["threePointersMade"]),
                "fg3a": to_int(r["threePointersAttempted"]),
                "ftm": to_int(r["freeThrowsMade"]),
                "fta": to_int(r["freeThrowsAttempted"]),
            })
    print(f"  {len(rows)} box scores ({skipped_dnp} DNP rows skipped)")
    rows.sort(key=lambda r: r["game_date"])
    return rows


def read_schedule(season: str) -> list[dict]:
    """Upcoming + played games of a season. The dataset only publishes the current season's file."""
    start = int(season[:4]) % 100
    name = f"LeagueSchedule{start:02d}_{(start + 1) % 100:02d}.csv"
    try:
        with download(name) as path, open(path, newline="", encoding="utf-8") as fh:
            raw = list(csv.DictReader(fh))
    except Exception as e:
        print(f"  no schedule file {name} ({e.__class__.__name__}), skipping")
        return []
    games = []
    for r in raw:
        game_id = normalize_game_id(r["gameId"])
        home, away = to_int(r["homeTeamId"]), to_int(r["awayTeamId"])
        if not wanted(game_id, {season}) or home not in TEAMS or away not in TEAMS:
            continue
        games.append({
            "id": game_id,
            "game_date": date.fromisoformat(r["gameDateTimeEst"][:10]),
            "season": season,
            "home_team_id": home,
            "away_team_id": away,
        })
    print(f"  {len(games)} scheduled games in {season}")
    return games


# ---------- DB ----------

def upsert_teams(cur: psycopg.Cursor) -> None:
    cur.executemany(
        """
        INSERT INTO nba_team (id, abbreviation, name)
        VALUES (%s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET abbreviation = EXCLUDED.abbreviation, name = EXCLUDED.name
        """,
        [(tid, abbr, name) for tid, (abbr, name) in TEAMS.items()],
    )


def upsert_games(cur: psycopg.Cursor, games: list[dict]) -> None:
    # DO UPDATE so postponed/rescheduled games get their new date
    cur.executemany(
        """
        INSERT INTO nba_game (id, game_date, season, home_team_id, away_team_id)
        VALUES (%(id)s, %(game_date)s, %(season)s, %(home_team_id)s, %(away_team_id)s)
        ON CONFLICT (id) DO UPDATE SET
            game_date = EXCLUDED.game_date,
            home_team_id = EXCLUDED.home_team_id,
            away_team_id = EXCLUDED.away_team_id
        """,
        games,
    )


def upsert_box_scores(cur: psycopg.Cursor, rows: list[dict]) -> None:
    games = {
        r["game_id"]: {
            "id": r["game_id"],
            "game_date": r["game_date"],
            "season": r["season"],
            "home_team_id": r["home_team_id"],
            "away_team_id": r["away_team_id"],
        }
        for r in rows
    }
    upsert_games(cur, list(games.values()))

    # rows are sorted by date, so the last one wins = player's latest team
    players = {r["player_id"]: (r["player_id"], r["player_name"], r["team_id"]) for r in rows}
    cur.executemany(
        """
        INSERT INTO nba_player (id, name, team_id)
        VALUES (%s, %s, %s)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
        """,
        list(players.values()),
    )

    cur.executemany(
        """
        INSERT INTO nba_player_game (
            player_id, game_id, team_id, opponent_id, is_home, minutes,
            pts, reb, ast, stl, blk, tov, fgm, fga, fg3m, fg3a, ftm, fta
        ) VALUES (
            %(player_id)s, %(game_id)s, %(team_id)s, %(opponent_id)s, %(is_home)s, %(minutes)s,
            %(pts)s, %(reb)s, %(ast)s, %(stl)s, %(blk)s, %(tov)s,
            %(fgm)s, %(fga)s, %(fg3m)s, %(fg3a)s, %(ftm)s, %(fta)s
        )
        ON CONFLICT (player_id, game_id) DO UPDATE SET
            minutes = EXCLUDED.minutes,
            pts = EXCLUDED.pts, reb = EXCLUDED.reb, ast = EXCLUDED.ast,
            stl = EXCLUDED.stl, blk = EXCLUDED.blk, tov = EXCLUDED.tov,
            fgm = EXCLUDED.fgm, fga = EXCLUDED.fga, fg3m = EXCLUDED.fg3m,
            fg3a = EXCLUDED.fg3a, ftm = EXCLUDED.ftm, fta = EXCLUDED.fta
        """,
        rows,
    )
    print(f"  saved {len(games)} games, {len(players)} players, {len(rows)} box scores")


def sync(seasons: list[str]) -> None:
    season_set = set(seasons)
    box_scores = read_box_scores(season_set)
    schedule = [g for s in sorted(season_set) for g in read_schedule(s)]

    with psycopg.connect() as conn:  # connection params from PG* env vars
        with conn.cursor() as cur:
            upsert_teams(cur)
            upsert_games(cur, schedule)
            upsert_box_scores(cur, box_scores)
        conn.commit()


def main() -> None:
    cur_season = current_season()
    parser = argparse.ArgumentParser(description="Sync NBA player box scores into Postgres")
    parser.add_argument(
        "--seasons",
        nargs="+",
        default=[previous_season(cur_season), cur_season],
        help="e.g. 2025-26 2026-27 (default: previous + current season)",
    )
    args = parser.parse_args()
    print(f"Syncing seasons: {', '.join(args.seasons)}")
    sync(args.seasons)
    print("Done.")


if __name__ == "__main__":
    main()
