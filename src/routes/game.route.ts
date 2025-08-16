import { Router } from "express";
import { GameController } from "../controllers/game.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Public routes (no authentication required)
router.get("/games", GameController.getAllGames);
router.get("/games/category/:category", GameController.getGamesByCategory);
router.get("/games/favorites", GameController.getFavoriteGames);
router.get("/games/:gameId/stats", GameController.getGameStats);


router.get("/verify/:token", GameController.verifyGameToken);
router.post("/bet-result", GameController.updateBetResult);

// Protected routes (authentication required)
router.use(verifyToken);

// Game session management
router.post("/play", GameController.playGame);

// User specific routes
router.get("/user/:userId/bet-history", GameController.getUserBetHistory);

export default router;
