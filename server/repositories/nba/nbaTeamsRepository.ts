import postgres from "postgres";
import { currentSeason } from "./nbaGamesRepository.js";

const sql = postgres();

// get all teams, alphabetically
const getAll = async () => {
    const result = await sql`
        SELECT id, abbreviation, name
        FROM nba_team
        ORDER BY name;
    `;
    return result;
};

// get one team based on id
const getOne = async (team_id: number) => {
    const result = await sql`
        SELECT id, abbreviation, name
        FROM nba_team
        WHERE id = ${team_id};
    `;
    return result[0];
};

// get one team based on abbreviation ('MIN', 'min')
const getByAbbreviation = async (abbreviation: string) => {
    const result = await sql`
        SELECT id, abbreviation, name
        FROM nba_team
        WHERE abbreviation = upper(${abbreviation});
    `;
    return result[0];
};

// get team's current players with their current season's games played and averages, most minutes first
// players who haven't played this season (injured, new signings) are last
const getRoster = async (team_id: number) => {
    const result = await sql`
        SELECT
            p.id, p.name,
            count(s.game_id)::int AS games,
            round(avg(s.minutes), 1)::float8 AS minutes,
            round(avg(s.pts), 1)::float8 AS pts,
            round(avg(s.reb), 1)::float8 AS reb,
            round(avg(s.ast), 1)::float8 AS ast
        FROM nba_player p
        LEFT JOIN (
            SELECT pg.*
            FROM nba_player_game pg
            JOIN nba_game g ON g.id = pg.game_id
            WHERE g.season = ${currentSeason()}
        ) s ON s.player_id = p.id
        WHERE p.team_id = ${team_id}
        GROUP BY p.id, p.name
        ORDER BY avg(s.minutes) DESC NULLS LAST, p.name;
    `;
    return result;
};

export {
    getAll,
    getOne,
    getByAbbreviation,
    getRoster,
};
