import postgres from "postgres";

const sql = postgres();

// current season in format '2026-27' (NBA season starts in October)
const currentSeason = () => {
    const today = new Date();
    const startYear = today.getMonth() >= 9 ? today.getFullYear() : today.getFullYear() - 1;
    return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
};

// columns + joins shared by every query: game info with both teams' abbreviations and names
const gamesWithTeams = () => sql`
    SELECT
        g.id, g.game_date, g.season,
        g.home_team_id, home.abbreviation AS home_team, home.name AS home_team_name,
        g.away_team_id, away.abbreviation AS away_team, away.name AS away_team_name
    FROM nba_game g
    JOIN nba_team home ON home.id = g.home_team_id
    JOIN nba_team away ON away.id = g.away_team_id
`;

// get one game based on id
const getOne = async (game_id: string) => {
    const result = await sql`
        ${gamesWithTeams()}
        WHERE g.id = ${game_id};
    `;
    return result[0];
};

// all today's and tomorrow's games
// note: game_date is the US (Eastern) date, so a game on the 14th tips off on the night of the 14th/15th in Finland
const getUpcomingGames = async () => {
    const result = await sql`
        ${gamesWithTeams()}
        WHERE g.game_date BETWEEN current_date AND current_date + 1
        ORDER BY g.game_date;
    `;
    return result;
};

// all games on given date (format 'YYYY-MM-DD')
const getGamesByDate = async (date: string) => {
    const result = await sql`
        ${gamesWithTeams()}
        WHERE g.game_date = ${date};
    `;
    return result;
};

// get all games of given season (format '2026-27')
const getSeasonAllGames = async (season: string) => {
    const result = await sql`
        ${gamesWithTeams()}
        WHERE g.season = ${season}
        ORDER BY g.game_date;
    `;
    return result;
};

// get current season's games played, latest first
const getCurrentSeasonPastGames = async () => {
    const result = await sql`
        ${gamesWithTeams()}
        WHERE g.season = ${currentSeason()} AND g.game_date < current_date
        ORDER BY g.game_date DESC;
    `;
    return result;
};

// get current season's upcoming games, soonest first
const getCurrentSeasonUpcomingGames = async () => {
    const result = await sql`
        ${gamesWithTeams()}
        WHERE g.season = ${currentSeason()} AND g.game_date >= current_date
        ORDER BY g.game_date;
    `;
    return result;
};

// get team's all games from given season
const getTeamsGames = async (team_id: number, season: string) => {
    const result = await sql`
        ${gamesWithTeams()}
        WHERE g.season = ${season} AND ${team_id} IN (g.home_team_id, g.away_team_id)
        ORDER BY g.game_date;
    `;
    return result;
};

// get team's current season's played games, latest first
const getTeamsPastGames = async (team_id: number) => {
    const result = await sql`
        ${gamesWithTeams()}
        WHERE g.season = ${currentSeason()} AND g.game_date < current_date
            AND ${team_id} IN (g.home_team_id, g.away_team_id)
        ORDER BY g.game_date DESC;
    `;
    return result;
};

// get team's current season's upcoming games, soonest first
const getTeamsUpcomingGames = async (team_id: number) => {
    const result = await sql`
        ${gamesWithTeams()}
        WHERE g.season = ${currentSeason()} AND g.game_date >= current_date
            AND ${team_id} IN (g.home_team_id, g.away_team_id)
        ORDER BY g.game_date;
    `;
    return result;
};

// get team's next game (undefined if none scheduled)
const getTeamsNextGame = async (team_id: number) => {
    const result = await sql`
        ${gamesWithTeams()}
        WHERE g.game_date >= current_date AND ${team_id} IN (g.home_team_id, g.away_team_id)
        ORDER BY g.game_date
        LIMIT 1;
    `;
    return result[0];
};

// get played games between two teams (all seasons in db), latest first
const getHeadToHeadGames = async (team_id: number, opponent_id: number) => {
    const result = await sql`
        ${gamesWithTeams()}
        WHERE g.game_date < current_date
            AND ((g.home_team_id = ${team_id} AND g.away_team_id = ${opponent_id})
              OR (g.home_team_id = ${opponent_id} AND g.away_team_id = ${team_id}))
        ORDER BY g.game_date DESC;
    `;
    return result;
};

export {
    currentSeason,
    getOne,
    getUpcomingGames,
    getGamesByDate,
    getSeasonAllGames,
    getCurrentSeasonPastGames,
    getCurrentSeasonUpcomingGames,
    getTeamsGames,
    getTeamsPastGames,
    getTeamsUpcomingGames,
    getTeamsNextGame,
    getHeadToHeadGames,
};
