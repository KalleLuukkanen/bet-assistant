import postgres from "postgres";

const sql = postgres();

// columns + join shared by every query: player info with current team's abbreviation and name
const playersWithTeam = () => sql`
    SELECT
        p.id, p.name,
        p.team_id, t.abbreviation AS team, t.name AS team_name
    FROM nba_player p
    LEFT JOIN nba_team t ON t.id = p.team_id
`;

// get one player based on id
const getOne = async (player_id: number) => {
    const result = await sql`
        ${playersWithTeam()}
        WHERE p.id = ${player_id};
    `;
    return result[0];
};

// get one player based on exact name, case insensitive ('anthony edwards')
// lower(p.name) matches the idx_nba_player_name index
const getByName = async (name: string) => {
    const result = await sql`
        ${playersWithTeam()}
        WHERE lower(p.name) = lower(${name.trim()});
    `;
    return result[0];
};

// search players by part of name ('edwa' -> Anthony Edwards), names starting with the search first
const searchPlayers = async (query: string, limit = 10) => {
    const search = query.trim();
    const result = await sql`
        ${playersWithTeam()}
        WHERE p.name ILIKE ${"%" + search + "%"}
        ORDER BY
            (lower(p.name) LIKE lower(${search + "%"})) DESC,
            p.name
        LIMIT ${limit};
    `;
    return result;
};

export {
    getOne,
    getByName,
    searchPlayers,
};
