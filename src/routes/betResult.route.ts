import { Router } from "express";
import { BetResultController } from "../controllers/betResult.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Public routes (no authentication required)
router.get("/", BetResultController.getBetResults);
router.get("/stats", BetResultController.getBetResultStats);
// router.get("/recent", BetResultController.get);
router.get("/status/:status", BetResultController.getBetResultsByStatus);
router.get("/game/:gameId", BetResultController.getBetResultsByGame);
router.get("/:id", BetResultController.getBetResultById);

// NEW: Player rankings and leaderboards (public)
router.get("/rankings/players", BetResultController.getPlayerRankings);
router.get("/rankings/winners", BetResultController.getTopWinners);
router.get("/rankings/losers", BetResultController.getTopLosers);

// NEW: Performance analytics (public)
router.get("/performance/player", BetResultController.getPlayerPerformance);
router.get("/performance/game", BetResultController.getGamePerformance);

// NEW: Dashboard statistics (public)
router.get("/dashboard/stats", BetResultController.getDashboardStats);

// Protected routes (authentication required)
router.use(verifyToken);

// User specific routes
router.get("/user/:userId", BetResultController.getBetResultsByUser);

export default router;

