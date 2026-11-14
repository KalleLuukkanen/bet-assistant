import postgres from "postgres";

const sql = postgres();

// stats that can be used in hit rates: name -> SQL expression
// only these fixed strings ever go into sql.unsafe, never user input
const STATS: Record<string, string> = {
    pts: "pg.pts",
    reb: "pg.reb",
    ast: "pg.ast",
    stl: "pg.stl",
    blk: "pg.blk",
    tov: "pg.tov",
    fgm: "pg.fgm",
    fga: "pg.fga",
    fg3m: "pg.fg3m",
    fg3a: "pg.fg3a",
    ftm: "pg.ftm",
    fta: "pg.fta",
    pra: "pg.pts + pg.reb + pg.ast",
    pr: "pg.pts + pg.reb",
    pa: "pg.pts + pg.ast",
    ra: "pg.reb + pg.ast",
    stocks: "pg.stl + pg.blk",
};

const isStat = (stat: string) => Object.hasOwn(STATS, stat);

// columns + joins shared by every query: box score line with game date, player name and team abbreviations
const boxScores = () => sql`
    SELECT
        pg.player_id, p.name AS player_name,
        pg.game_id, g.game_date, g.season,
        pg.team_id, t.abbreviation AS team,
        pg.opponent_id, o.abbreviation AS opponent,
        pg.is_home, pg.minutes::float8 AS minutes,
        pg.pts, pg.reb, pg.ast, pg.stl, pg.blk, pg.tov,
        pg.fgm, pg.fga, pg.fg3m, pg.fg3a, pg.ftm, pg.fta
    FROM nba_player_game pg
    JOIN nba_game g ON g.id = pg.game_id
    JOIN nba_player p ON p.id = pg.player_id
    JOIN nba_team t ON t.id = pg.team_id
    JOIN nba_team o ON o.id = pg.opponent_id
`;

// get player's all games from given season, latest first
const getPlayersGames = async (player_id: number, season: string) => {
    const result = await sql`
        ${boxScores()}
        WHERE pg.player_id = ${player_id} AND g.season = ${season}
        ORDER BY g.game_date DESC;
    `;
    return result;
};

// get player's last n games (all seasons in db), latest first
const getPlayersLastGames = async (player_id: number, limit: number) => {
    const result = await sql`
        ${boxScores()}
        WHERE pg.player_id = ${player_id}
        ORDER BY g.game_date DESC
        LIMIT ${limit};
    `;
    return result;
};

// get player's last n games against given team, latest first
const getPlayersLastGamesVsOpponent = async (player_id: number, opponent_id: number, limit: number) => {
    const result = await sql`
        ${boxScores()}
        WHERE pg.player_id = ${player_id} AND pg.opponent_id = ${opponent_id}
        ORDER BY g.game_date DESC
        LIMIT ${limit};
    `;
    return result;
};

// get box score of one game: every player who played, by team and most minutes first
const getGameBoxScore = async (game_id: string) => {
    const result = await sql`
        ${boxScores()}
        WHERE pg.game_id = ${game_id}
        ORDER BY t.abbreviation, pg.minutes DESC;
    `;
    return result;
};

// get player's averages from given season (undefined if no games played)
const getPlayersSeasonAverages = async (player_id: number, season: string) => {
    const result = await sql`
        SELECT
            pg.player_id, g.season,
            count(*)::int AS games,
            round(avg(pg.minutes), 1)::float8 AS minutes,
            round(avg(pg.pts), 1)::float8 AS pts,
            round(avg(pg.reb), 1)::float8 AS reb,
            round(avg(pg.ast), 1)::float8 AS ast,
            round(avg(pg.stl), 1)::float8 AS stl,
            round(avg(pg.blk), 1)::float8 AS blk,
            round(avg(pg.tov), 1)::float8 AS tov,
            round(avg(pg.fgm), 1)::float8 AS fgm,
            round(avg(pg.fga), 1)::float8 AS fga,
            round(avg(pg.fg3m), 1)::float8 AS fg3m,
            round(avg(pg.fg3a), 1)::float8 AS fg3a,
            round(avg(pg.ftm), 1)::float8 AS ftm,
            round(avg(pg.fta), 1)::float8 AS fta
        FROM nba_player_game pg
        JOIN nba_game g ON g.id = pg.game_id
        WHERE pg.player_id = ${player_id} AND g.season = ${season}
        GROUP BY pg.player_id, g.season;
    `;
    return result[0];
};

// hit rate of a prop over player's last n games, optionally only against given team
// e.g. stat 'fgm', line 5.5, side 'over' -> how many of the last 10 games had 6+ field goals made
// a value exactly on the line (push) counts as a miss
const getHitRate = async (
    player_id: number,
    stat: string,
    line: number,
    side: "over" | "under",
    limit: number,
    opponent_id?: number,
) => {
    const value = sql.unsafe(STATS[stat]);
    const result = await sql`
        SELECT
            pg.game_id, g.game_date, o.abbreviation AS opponent, pg.is_home,
            pg.minutes::float8 AS minutes,
            (${value})::int AS value
        FROM nba_player_game pg
        JOIN nba_game g ON g.id = pg.game_id
        JOIN nba_team o ON o.id = pg.opponent_id
        WHERE pg.player_id = ${player_id}
            ${opponent_id ? sql`AND pg.opponent_id = ${opponent_id}` : sql``}
        ORDER BY g.game_date DESC
        LIMIT ${limit};
    `;
    const games = result.map((game) => ({
        game_id: game.game_id as string,
        game_date: game.game_date as Date,
        opponent: game.opponent as string,
        is_home: game.is_home as boolean,
        minutes: game.minutes as number,
        value: game.value as number,
        hit: side === "over" ? game.value > line : game.value < line,
    }));
    const hits = games.filter((game) => game.hit).length;
    const total = games.reduce((sum, game) => sum + game.value, 0);
    return {
        stat,
        line,
        side,
        games: games.length,
        hits,
        hit_rate: games.length ? Math.round((hits / games.length) * 1000) / 10 : null,  // percent, 1 decimal
        average: games.length ? Math.round((total / games.length) * 10) / 10 : null,
        results: games,
    };
};

export {
    STATS,
    isStat,
    getPlayersGames,
    getPlayersLastGames,
    getPlayersLastGamesVsOpponent,
    getGameBoxScore,
    getPlayersSeasonAverages,
    getHitRate,
};
