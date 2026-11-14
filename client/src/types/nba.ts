// response types of the /api/nba endpoints
// dates come as JSON strings at UTC midnight, e.g. "2026-11-14T00:00:00.000Z" -> use .slice(0, 10) for the date

export type NbaTeam = {
    id: number;
    abbreviation: string;
    name: string;
};

export type NbaGame = {
    id: string;
    game_date: string;
    season: string;
    home_team_id: number;
    home_team: string;
    home_team_name: string;
    away_team_id: number;
    away_team: string;
    away_team_name: string;
};

export type NbaPlayer = {
    id: number;
    name: string;
    team_id: number | null;
    team: string | null;
    team_name: string | null;
};

// player in team's roster, averages are null if no games played this season
export type NbaRosterPlayer = {
    id: number;
    name: string;
    games: number;
    minutes: number | null;
    pts: number | null;
    reb: number | null;
    ast: number | null;
};

export type NbaBoxScore = {
    player_id: number;
    player_name: string;
    game_id: string;
    game_date: string;
    season: string;
    team_id: number;
    team: string;
    opponent_id: number;
    opponent: string;
    is_home: boolean;
    minutes: number;
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    tov: number;
    fgm: number;
    fga: number;
    fg3m: number;
    fg3a: number;
    ftm: number;
    fta: number;
};

export type NbaSeasonAverages = {
    player_id: number;
    season: string;
    games: number;
    minutes: number;
    pts: number;
    reb: number;
    ast: number;
    stl: number;
    blk: number;
    tov: number;
    fgm: number;
    fga: number;
    fg3m: number;
    fg3a: number;
    ftm: number;
    fta: number;
};

export type NbaStat =
    | "pts" | "reb" | "ast" | "stl" | "blk" | "tov"
    | "fgm" | "fga" | "fg3m" | "fg3a" | "ftm" | "fta"
    | "pra" | "pr" | "pa" | "ra" | "stocks";

export type NbaSide = "over" | "under";

export type NbaHitRate = {
    stat: NbaStat;
    line: number;
    side: NbaSide;
    games: number;
    hits: number;
    hit_rate: number | null;   // percent, e.g. 80 or 42.9, null if no games
    average: number | null;
    results: {
        game_id: string;
        game_date: string;
        opponent: string;
        is_home: boolean;
        minutes: number;
        value: number;
        hit: boolean;
    }[];
};
