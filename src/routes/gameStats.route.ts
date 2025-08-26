import { Router } from "express";
import { getGameWiseStats, getGameStatsById } from "../controllers/gameStats.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// GET /api/game-stats - Get comprehensive game-wise statistics
router.get("/", verifyToken, getGameWiseStats);

// GET /api/game-stats/:gameId - Get statistics for a specific game
router.get("/:gameId", verifyToken, getGameStatsById);

export default router;
