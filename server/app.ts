import express from "express";
import cors from "cors";
import morgan from "morgan";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.js";
import * as nbaGamesController from "./controllers/nba/nbaGamesController.js";
import * as nbaTeamsController from "./controllers/nba/nbaTeamsController.js";
import * as nbaPlayersController from "./controllers/nba/nbaPlayersController.js";
import * as nbaPlayerGamesController from "./controllers/nba/nbaPlayerGamesController.js";

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(morgan("dev"));

// Auth route must come before express.json() — Better Auth reads the raw body itself
app.all("/api/auth/*", toNodeHandler(auth));

app.use(express.json());


// Attach userId to every request if a valid session exists
app.use(async (req, res, next) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session) {
        return next();
    }
    (req as any).userId = session.user.id;
    return next();
});

// routes not protected for now
/*
// Reject unauthenticated requests to protected routes
app.use("/api", (req, res, next) => {
    const userId = (req as any).userId;
    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    return next();
});
*/

// Example protected route — replace with your own controllers
app.get("/api/me", (req, res) => {
    res.json({ userId: (req as any).userId });
});

// NBA routes. Routes that read req.body are POST, because browsers can't send a body with GET.
// Specific paths (/upcoming, /date...) must come before /:gameId.

// games
app.get("/api/nba/games/upcoming", nbaGamesController.getUpcomingGames);
app.post("/api/nba/games/date", nbaGamesController.getGamesByDate);
app.post("/api/nba/games/season", nbaGamesController.getSeasonAllGames);
app.get("/api/nba/games/season/current/past", nbaGamesController.getCurrentSeasonPastGames);
app.get("/api/nba/games/season/current/upcoming", nbaGamesController.getCurrentSeasonUpcomingGames);
app.get("/api/nba/games/:gameId", nbaGamesController.getOne);
app.get("/api/nba/games/:gameId/box-score", nbaPlayerGamesController.getGameBoxScore);

// teams
app.get("/api/nba/teams", nbaTeamsController.getAll);
app.post("/api/nba/teams/abbreviation", nbaTeamsController.getByAbbreviation);
app.get("/api/nba/teams/:teamId", nbaTeamsController.getOne);
app.get("/api/nba/teams/:teamId/roster", nbaTeamsController.getRoster);
app.post("/api/nba/teams/:teamId/games", nbaGamesController.getTeamsGames);
app.get("/api/nba/teams/:teamId/games/past", nbaGamesController.getTeamsPastGames);
app.get("/api/nba/teams/:teamId/games/upcoming", nbaGamesController.getTeamsUpcomingGames);
app.get("/api/nba/teams/:teamId/games/next", nbaGamesController.getTeamsNextGame);
app.get("/api/nba/teams/:teamId/vs/:opponentId/games", nbaGamesController.getHeadToHeadGames);

// players
app.post("/api/nba/players/name", nbaPlayersController.getByName);
app.post("/api/nba/players/search", nbaPlayersController.searchPlayers);
app.get("/api/nba/players/:playerId", nbaPlayersController.getOne);
app.post("/api/nba/players/:playerId/games", nbaPlayerGamesController.getPlayersGames);
app.post("/api/nba/players/:playerId/games/last", nbaPlayerGamesController.getPlayersLastGames);
app.post("/api/nba/players/:playerId/averages", nbaPlayerGamesController.getPlayersSeasonAverages);
app.post("/api/nba/players/:playerId/hit-rate", nbaPlayerGamesController.getHitRate);
app.post("/api/nba/players/:playerId/vs/:opponentId/games", nbaPlayerGamesController.getPlayersLastGamesVsOpponent);
app.post("/api/nba/players/:playerId/vs/:opponentId/hit-rate", nbaPlayerGamesController.getHitRate);

export default app;