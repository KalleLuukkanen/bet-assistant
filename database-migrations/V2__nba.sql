-- IDs come straight from nba_api (stats.nba.com) so ingestion can upsert idempotently.

CREATE TABLE nba_team (
    id           INTEGER PRIMARY KEY,          -- e.g. 1610612750 (MIN)
    abbreviation TEXT NOT NULL UNIQUE,         -- e.g. 'MIN'
    name         TEXT NOT NULL                 -- e.g. 'Minnesota Timberwolves'
);

CREATE TABLE nba_player (
    id      INTEGER PRIMARY KEY,               -- e.g. 1630162 (Anthony Edwards)
    name    TEXT NOT NULL,
    team_id INTEGER REFERENCES nba_team(id)    -- current team, NULL if free agent
);

CREATE INDEX idx_nba_player_name ON nba_player (lower(name));

CREATE TABLE nba_game (
    id           TEXT PRIMARY KEY,             -- e.g. '0022500123'
    game_date    DATE NOT NULL,
    season       TEXT NOT NULL,                -- e.g. '2025-26'
    home_team_id INTEGER NOT NULL REFERENCES nba_team(id),
    away_team_id INTEGER NOT NULL REFERENCES nba_team(id),
    CHECK (home_team_id <> away_team_id)
);

CREATE INDEX idx_nba_game_date ON nba_game (game_date);

-- One row per player per game (box score line).
CREATE TABLE nba_player_game (
    player_id   INTEGER NOT NULL REFERENCES nba_player(id),
    game_id     TEXT    NOT NULL REFERENCES nba_game(id),
    team_id     INTEGER NOT NULL REFERENCES nba_team(id),  -- team they played for in this game
    opponent_id INTEGER NOT NULL REFERENCES nba_team(id),
    is_home     BOOLEAN NOT NULL,
    minutes     NUMERIC(5, 2),
    pts         SMALLINT NOT NULL DEFAULT 0,
    reb         SMALLINT NOT NULL DEFAULT 0,
    ast         SMALLINT NOT NULL DEFAULT 0,
    stl         SMALLINT NOT NULL DEFAULT 0,
    blk         SMALLINT NOT NULL DEFAULT 0,
    tov         SMALLINT NOT NULL DEFAULT 0,
    fgm         SMALLINT NOT NULL DEFAULT 0,
    fga         SMALLINT NOT NULL DEFAULT 0,
    fg3m        SMALLINT NOT NULL DEFAULT 0,
    fg3a        SMALLINT NOT NULL DEFAULT 0,
    ftm         SMALLINT NOT NULL DEFAULT 0,
    fta         SMALLINT NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, game_id)
);

-- "last N games for player X" and "last N games for player X vs team Y"
CREATE INDEX idx_npg_player ON nba_player_game (player_id);
CREATE INDEX idx_npg_player_opp ON nba_player_game (player_id, opponent_id);
