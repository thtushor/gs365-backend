"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gameStats_controller_1 = require("../controllers/gameStats.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// GET /api/game-stats - Get comprehensive game-wise statistics
router.get("/", verifyToken_1.verifyToken, gameStats_controller_1.getGameWiseStats);
// GET /api/game-stats/:gameId - Get statistics for a specific game
router.get("/:gameId", verifyToken_1.verifyToken, gameStats_controller_1.getGameStatsById);
exports.default = router;
