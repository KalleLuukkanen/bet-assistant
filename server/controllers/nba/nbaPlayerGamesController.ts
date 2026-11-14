import { Request, Response } from "express";
import * as nbaPlayerGamesRepository from "../../repositories/nba/nbaPlayerGamesRepository.js";
import { currentSeason } from "../../repositories/nba/nbaGamesRepository.js";

const SEASON_FORMAT = /^\d{4}-\d{2}$/;   // '2026-27'
const MAX_LIMIT = 100;

// get player's all games from given season, body: { season?: '2026-27' } (defaults to current season)
const getPlayersGames = async (req: Request, res: Response) => {
    const player_id = Number(req.params.playerId);
    if (!Number.isInteger(player_id)) {
        return res.status(400).json({ error: "Missing or invalid player id" });
    }
    const season = req.body?.season ?? currentSeason();
    if (typeof season !== "string" || !SEASON_FORMAT.test(season)) {
        return res.status(400).json({ error: "Invalid season, expected format '2026-27'" });
    }
    const games = await nbaPlayerGamesRepository.getPlayersGames(player_id, season);
    return res.status(200).json(games);
};

// get player's last n games, body: { limit?: 10 }
const getPlayersLastGames = async (req: Request, res: Response) => {
    const player_id = Number(req.params.playerId);
    if (!Number.isInteger(player_id)) {
        return res.status(400).json({ error: "Missing or invalid player id" });
    }
    const limit = req.body?.limit ?? 10;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
        return res.status(400).json({ error: `Invalid limit, expected 1-${MAX_LIMIT}` });
    }
    const games = await nbaPlayerGamesRepository.getPlayersLastGames(player_id, limit);
    return res.status(200).json(games);
};

// get player's last n games against given team, body: { limit?: 10 }
const getPlayersLastGamesVsOpponent = async (req: Request, res: Response) => {
    const player_id = Number(req.params.playerId);
    const opponent_id = Number(req.params.opponentId);
    if (!Number.isInteger(player_id) || !Number.isInteger(opponent_id)) {
        return res.status(400).json({ error: "Missing or invalid player or opponent id" });
    }
    const limit = req.body?.limit ?? 10;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
        return res.status(400).json({ error: `Invalid limit, expected 1-${MAX_LIMIT}` });
    }
    const games = await nbaPlayerGamesRepository.getPlayersLastGamesVsOpponent(player_id, opponent_id, limit);
    return res.status(200).json(games);
};

// get box score of one game
const getGameBoxScore = async (req: Request, res: Response) => {
    const game_id = req.params.gameId;
    if (!game_id) {
        return res.status(400).json({ error: "Missing game id" });
    }
    const boxScore = await nbaPlayerGamesRepository.getGameBoxScore(game_id);
    if (boxScore.length === 0) {
        return res.status(404).json({ error: "Box score not found" });
    }
    return res.status(200).json(boxScore);
};

// get player's season averages, body: { season?: '2026-27' } (defaults to current season)
const getPlayersSeasonAverages = async (req: Request, res: Response) => {
    const player_id = Number(req.params.playerId);
    if (!Number.isInteger(player_id)) {
        return res.status(400).json({ error: "Missing or invalid player id" });
    }
    const season = req.body?.season ?? currentSeason();
    if (typeof season !== "string" || !SEASON_FORMAT.test(season)) {
        return res.status(400).json({ error: "Invalid season, expected format '2026-27'" });
    }
    const averages = await nbaPlayerGamesRepository.getPlayersSeasonAverages(player_id, season);
    if (!averages) {
        return res.status(404).json({ error: "No games played in given season" });
    }
    return res.status(200).json(averages);
};

// hit rate of a prop, optionally only against given team (opponentId param)
// body: { stat: 'fgm', line: 5.5, side?: 'over' | 'under', limit?: 10 }
const getHitRate = async (req: Request, res: Response) => {
    const player_id = Number(req.params.playerId);
    const opponent_id = req.params.opponentId ? Number(req.params.opponentId) : undefined;
    if (!Number.isInteger(player_id) || (opponent_id !== undefined && !Number.isInteger(opponent_id))) {
        return res.status(400).json({ error: "Missing or invalid player or opponent id" });
    }
    const stat = req.body?.stat;
    if (typeof stat !== "string" || !nbaPlayerGamesRepository.isStat(stat)) {
        return res.status(400).json({
            error: `Invalid stat, expected one of: ${Object.keys(nbaPlayerGamesRepository.STATS).join(", ")}`,
        });
    }
    const line = req.body?.line;
    if (typeof line !== "number" || !Number.isFinite(line) || line < 0) {
        return res.status(400).json({ error: "Missing or invalid line" });
    }
    const side = req.body?.side ?? "over";
    if (side !== "over" && side !== "under") {
        return res.status(400).json({ error: "Invalid side, expected 'over' or 'under'" });
    }
    const limit = req.body?.limit ?? 10;
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
        return res.status(400).json({ error: `Invalid limit, expected 1-${MAX_LIMIT}` });
    }
    const hitRate = await nbaPlayerGamesRepository.getHitRate(player_id, stat, line, side, limit, opponent_id);
    return res.status(200).json(hitRate);
};

export {
    getPlayersGames,
    getPlayersLastGames,
    getPlayersLastGamesVsOpponent,
    getGameBoxScore,
    getPlayersSeasonAverages,
    getHitRate,
};
