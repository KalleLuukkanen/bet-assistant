import express from "express";
import cors from "cors";
import morgan from "morgan";
import { toNodeHandler, fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.js";

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

export default app;
