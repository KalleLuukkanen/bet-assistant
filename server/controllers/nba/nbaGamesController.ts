import { Request, Response } from "express";
import * as nbaGamesRepository from "../../repositories/nba/nbaGamesRepository.js";

const DATE_FORMAT = /^\d{4}-\d{2}-\d{2}$/;   // '2026-11-14'
const SEASON_FORMAT = /^\d{4}-\d{2}$/;       // '2026-27'

// get one game based on id
const getOne = async (req: Request, res: Response) => {
    const game_id = req.params.gameId;
    if (!game_id) {
        return res.status(400).json({ error: "Missing game id" });
    }
    const game = await nbaGamesRepository.getOne(game_id);
    if (!game) {
        return res.status(404).json({ error: "Game not found" });
    }
    return res.status(200).json(game);
};

// all today's and tomorrow's games
const getUpcomingGames = async (req: Request, res: Response) => {
    const games = await nbaGamesRepository.getUpcomingGames();
    return res.status(200).json(games);
};

// all games on given date, body: { date: '2026-11-14' }
const getGamesByDate = async (req: Request, res: Response) => {
    const date = req.body?.date;
    if (typeof date !== "string" || !DATE_FORMAT.test(date)) {
        return res.status(400).json({ error: "Missing or invalid date, expected format 'YYYY-MM-DD'" });
    }
    const games = await nbaGamesRepository.getGamesByDate(date);
    return res.status(200).json(games);
};

// all games of given season, body: { season: '2026-27' }
const getSeasonAllGames = async (req: Request, res: Response) => {
    const season = req.body?.season;
    if (typeof season !== "string" || !SEASON_FORMAT.test(season)) {
        return res.status(400).json({ error: "Missing or invalid season, expected format '2026-27'" });
    }
    const games = await nbaGamesRepository.getSeasonAllGames(season);
    return res.status(200).json(games);
};

// current season's played games, latest first
const getCurrentSeasonPastGames = async (req: Request, res: Response) => {
    const games = await nbaGamesRepository.getCurrentSeasonPastGames();
    return res.status(200).json(games);
};

// current season's upcoming games, soonest first
const getCurrentSeasonUpcomingGames = async (req: Request, res: Response) => {
    const games = await nbaGamesRepository.getCurrentSeasonUpcomingGames();
    return res.status(200).json(games);
};

// team's all games from given season, body: { season?: '2026-27' } (defaults to current season)
const getTeamsGames = async (req: Request, res: Response) => {
    const team_id = Number(req.params.teamId);
    if (!Number.isInteger(team_id)) {
        return res.status(400).json({ error: "Missing or invalid team id" });
    }
    const season = req.body?.season ?? nbaGamesRepository.currentSeason();
    if (typeof season !== "string" || !SEASON_FORMAT.test(season)) {
        return res.status(400).json({ error: "Invalid season, expected format '2026-27'" });
    }
    const games = await nbaGamesRepository.getTeamsGames(team_id, season);
    return res.status(200).json(games);
};

// team's current season's played games, latest first
const getTeamsPastGames = async (req: Request, res: Response) => {
    const team_id = Number(req.params.teamId);
    if (!Number.isInteger(team_id)) {
        return res.status(400).json({ error: "Missing or invalid team id" });
    }
    const games = await nbaGamesRepository.getTeamsPastGames(team_id);
    return res.status(200).json(games);
};

// team's current season's upcoming games, soonest first
const getTeamsUpcomingGames = async (req: Request, res: Response) => {
    const team_id = Number(req.params.teamId);
    if (!Number.isInteger(team_id)) {
        return res.status(400).json({ error: "Missing or invalid team id" });
    }
    const games = await nbaGamesRepository.getTeamsUpcomingGames(team_id);
    return res.status(200).json(games);
};

// team's next game
const getTeamsNextGame = async (req: Request, res: Response) => {
    const team_id = Number(req.params.teamId);
    if (!Number.isInteger(team_id)) {
        return res.status(400).json({ error: "Missing or invalid team id" });
    }
    const game = await nbaGamesRepository.getTeamsNextGame(team_id);
    if (!game) {
        return res.status(404).json({ error: "No upcoming games found" });
    }
    return res.status(200).json(game);
};

// played games between two teams, latest first
const getHeadToHeadGames = async (req: Request, res: Response) => {
    const team_id = Number(req.params.teamId);
    const opponent_id = Number(req.params.opponentId);
    if (!Number.isInteger(team_id) || !Number.isInteger(opponent_id)) {
        return res.status(400).json({ error: "Missing or invalid team id" });
    }
    const games = await nbaGamesRepository.getHeadToHeadGames(team_id, opponent_id);
    return res.status(200).json(games);
};

export {
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
