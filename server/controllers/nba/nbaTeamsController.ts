import { Request, Response } from "express";
import * as nbaTeamsRepository from "../../repositories/nba/nbaTeamsRepository.js";

// get all teams
const getAll = async (req: Request, res: Response) => {
    const teams = await nbaTeamsRepository.getAll();
    return res.status(200).json(teams);
};

// get one team based on id
const getOne = async (req: Request, res: Response) => {
    const team_id = Number(req.params.teamId);
    if (!Number.isInteger(team_id)) {
        return res.status(400).json({ error: "Missing or invalid team id" });
    }
    const team = await nbaTeamsRepository.getOne(team_id);
    if (!team) {
        return res.status(404).json({ error: "Team not found" });
    }
    return res.status(200).json(team);
};

// get one team based on abbreviation, body: { abbreviation: 'MIN' }
const getByAbbreviation = async (req: Request, res: Response) => {
    const abbreviation = req.body?.abbreviation;
    if (typeof abbreviation !== "string" || !abbreviation.trim()) {
        return res.status(400).json({ error: "Missing abbreviation" });
    }
    const team = await nbaTeamsRepository.getByAbbreviation(abbreviation.trim());
    if (!team) {
        return res.status(404).json({ error: "Team not found" });
    }
    return res.status(200).json(team);
};

// get team's current players with season averages
const getRoster = async (req: Request, res: Response) => {
    const team_id = Number(req.params.teamId);
    if (!Number.isInteger(team_id)) {
        return res.status(400).json({ error: "Missing or invalid team id" });
    }
    const players = await nbaTeamsRepository.getRoster(team_id);
    return res.status(200).json(players);
};

export {
    getAll,
    getOne,
    getByAbbreviation,
    getRoster,
};
