"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const game_controller_1 = require("../controllers/game.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// Public routes (no authentication required)
router.get("/games", game_controller_1.GameController.getAllGames);
router.get("/games/category/:category", game_controller_1.GameController.getGamesByCategory);
router.get("/games/favorites", game_controller_1.GameController.getFavoriteGames);
router.get("/games/:gameId/stats", game_controller_1.GameController.getGameStats);
router.get("/verify/:token", game_controller_1.GameController.verifyGameToken);
router.post("/bet-result", game_controller_1.GameController.updateBetResult);
// Protected routes (authentication required)
router.use(verifyToken_1.verifyToken);
// Game session management
router.post("/play", game_controller_1.GameController.playGame);
// User specific routes
router.get("/user/:userId/bet-history", game_controller_1.GameController.getUserBetHistory);
exports.default = router;
