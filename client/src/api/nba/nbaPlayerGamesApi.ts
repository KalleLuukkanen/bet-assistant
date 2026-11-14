import { get, post } from "../apiClient";
import type { NbaBoxScore, NbaHitRate, NbaSeasonAverages, NbaSide, NbaStat } from "../../types/nba";

// get player's all games from given season (defaults to current season), latest first
const getPlayersGames = (playerId: number, season?: string) =>
    post<NbaBoxScore[]>(`/api/nba/players/${playerId}/games`, { season });

// get player's last n games (default 10), latest first
const getPlayersLastGames = (playerId: number, limit?: number) =>
    post<NbaBoxScore[]>(`/api/nba/players/${playerId}/games/last`, { limit });

// get player's last n games against given team (default 10), latest first
const getPlayersLastGamesVsOpponent = (playerId: number, opponentId: number, limit?: number) =>
    post<NbaBoxScore[]>(`/api/nba/players/${playerId}/vs/${opponentId}/games`, { limit });

// get box score of one game
const getGameBoxScore = (gameId: string) =>
    get<NbaBoxScore[]>(`/api/nba/games/${gameId}/box-score`);

// get player's season averages (defaults to current season)
const getPlayersSeasonAverages = (playerId: number, season?: string) =>
    post<NbaSeasonAverages>(`/api/nba/players/${playerId}/averages`, { season });

// hit rate of a prop over player's last n games (default 10), optionally only against given team
// e.g. getHitRate(1630162, { stat: "fgm", line: 5.5 }) -> Anthony Edwards over 5.5 FG in last 10 games
const getHitRate = (
    playerId: number,
    bet: { stat: NbaStat; line: number; side?: NbaSide; limit?: number },
    opponentId?: number,
) => {
    const path = opponentId
        ? `/api/nba/players/${playerId}/vs/${opponentId}/hit-rate`
        : `/api/nba/players/${playerId}/hit-rate`;
    return post<NbaHitRate>(path, bet);
};

export {
    getPlayersGames,
    getPlayersLastGames,
    getPlayersLastGamesVsOpponent,
    getGameBoxScore,
    getPlayersSeasonAverages,
    getHitRate,
};
