"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const betResult_controller_1 = require("../controllers/betResult.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// Public routes (no authentication required)
router.get("/", betResult_controller_1.BetResultController.getBetResults);
router.get("/stats", betResult_controller_1.BetResultController.getBetResultStats);
// router.get("/recent", BetResultController.get);
router.get("/status/:status", betResult_controller_1.BetResultController.getBetResultsByStatus);
router.get("/game/:gameId", betResult_controller_1.BetResultController.getBetResultsByGame);
router.get("/:id", betResult_controller_1.BetResultController.getBetResultById);
// NEW: Player rankings and leaderboards (public)
router.get("/rankings/players", betResult_controller_1.BetResultController.getPlayerRankings);
router.get("/rankings/winners", betResult_controller_1.BetResultController.getTopWinners);
router.get("/rankings/losers", betResult_controller_1.BetResultController.getTopLosers);
// NEW: Performance analytics (public)
router.get("/performance/player", betResult_controller_1.BetResultController.getPlayerPerformance);
router.get("/performance/game", betResult_controller_1.BetResultController.getGamePerformance);
// NEW: Dashboard statistics (public)
router.get("/dashboard/stats", betResult_controller_1.BetResultController.getDashboardStats);
// Protected routes (authentication required)
router.use(verifyToken_1.verifyToken);
// User specific routes
router.get("/user/:userId", betResult_controller_1.BetResultController.getBetResultsByUser);
exports.default = router;
