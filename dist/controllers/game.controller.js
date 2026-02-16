"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameController = void 0;
const game_model_1 = require("../models/game.model");
const asyncHandler_1 = require("../utils/asyncHandler");
const UAParser = __importStar(require("ua-parser-js"));
const __1 = require("..");
exports.GameController = {
    // Helper function to get client IP (same as user controller)
    getClientIp(req) {
        let ip = req.headers["x-forwarded-for"]
            ?.split(",")
            .map((s) => s.trim())[0] ||
            req.headers["x-real-ip"] ||
            req.socket?.remoteAddress ||
            req.connection?.remoteAddress ||
            req.ip ||
            "Unknown";
        if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") {
            ip = "127.0.0.1";
        }
        if (ip.startsWith("::ffff:")) {
            ip = ip.replace("::ffff:", "");
        }
        return ip;
    },
    // Get all games with provider information
    getAllGames: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const games = await game_model_1.GameModel.getAllGamesWithProvider();
            res.status(200).json({
                success: true,
                message: "Games retrieved successfully",
                data: games,
                count: games.length,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve games",
                error: error.message,
            });
        }
    }),
    // Play game - validate balance and generate session token
    playGame: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const { userId, gameId, betAmount, userScore } = req.body;
            // Validate required fields
            if (!userId || !gameId) {
                return res.status(400).json({
                    success: false,
                    message: "userId, gameId, and betAmount are required",
                });
            }
            // if (betAmount <= 0) {
            //   return res.status(400).json({
            //     success: false,
            //     message: "Bet amount must be greater than 0",
            //   });
            // }
            // --- Device Info Extraction (same as user controller) ---
            const userAgent = req.headers["user-agent"] || "";
            const parser = new UAParser.UAParser(userAgent);
            const uaResult = parser.getResult();
            const device_type = uaResult.device.type || "Desktop";
            const device_name = uaResult.device.model || uaResult.os.name || "Unknown";
            const os_version = uaResult.os.name
                ? `${uaResult.os.name} ${uaResult.os.version || ""}`.trim()
                : "Unknown";
            const browser = uaResult.browser.name || "Unknown";
            const browser_version = uaResult.browser.version || "Unknown";
            const ip_address = exports.GameController.getClientIp(req);
            // Combine device info into a single string (similar to user controller)
            const deviceInfo = `${browser} ${browser_version} on ${os_version}`;
            const result = await game_model_1.GameModel.playGame({
                userId: Number(userId),
                gameId: Number(gameId),
                betAmount: Number(betAmount),
                userScore: userScore ? Number(userScore) : undefined,
                ipAddress: ip_address,
                deviceInfo: deviceInfo,
                deviceType: device_type,
                deviceName: device_name,
                osVersion: os_version,
                browser: browser,
                browserVersion: browser_version,
            });
            res.status(200).json({
                success: true,
                message: "Game session created successfully",
                data: {
                    sessionToken: result.token,
                    sessionId: result.sessionId,
                    url: result.url,
                    expiresIn: "1 hour",
                },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message || "Failed to create game session",
                error: error.message,
            });
        }
    }),
    // Verify game session token
    verifyGameToken: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const { token } = req.params;
            if (!token) {
                return res.status(400).json({
                    success: false,
                    message: "Token is required",
                });
            }
            const tokenData = await game_model_1.GameModel.verifyGameToken(token);
            if (!tokenData) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid or expired token",
                });
            }
            res.status(200).json({
                success: true,
                message: "Token verified successfully",
                data: {
                    userId: tokenData.userId,
                    userScore: tokenData.userScore,
                    gameId: tokenData.gameId,
                    gameName: tokenData.gameName,
                    userName: tokenData.userName,
                    betAmount: tokenData.betAmount,
                    sessionId: tokenData.sessionId,
                    currentBalance: tokenData.currentBalance,
                },
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: "Token verification failed",
                error: error.message,
            });
        }
    }),
    // Update betting result (win/loss)
    updateBetResult: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const { sessionToken, betStatus, winAmount, lossAmount, betAmount, gameSessionId, multiplier, } = req.body;
            // Get device info for audit trail
            const userAgent = req.headers["user-agent"] || "";
            const parser = new UAParser.UAParser(userAgent);
            const uaResult = parser.getResult();
            const device_type = uaResult.device.type || "Desktop";
            const ip_address = exports.GameController.getClientIp(req);
            // Validate required fields
            if (!sessionToken || !betStatus || !gameSessionId || !betAmount) {
                return res.status(400).json({
                    success: false,
                    message: "sessionToken, betStatus, betAmount and gameSessionId are required",
                });
            }
            if (!["win", "loss"].includes(betStatus)) {
                return res.status(400).json({
                    success: false,
                    message: "betStatus must be either 'win' or 'loss'",
                });
            }
            if (betStatus === "win" && (!winAmount || winAmount <= 0)) {
                return res.status(400).json({
                    success: false,
                    message: "winAmount is required and must be greater than 0 for win status",
                });
            }
            if (betStatus === "loss" && (!lossAmount || lossAmount <= 0)) {
                return res.status(400).json({
                    success: false,
                    message: "lossAmount is required and must be greater than 0 for loss status",
                });
            }
            await game_model_1.GameModel.updateBetResult({
                sessionToken,
                betStatus,
                winAmount: winAmount ? Number(winAmount) : undefined,
                lossAmount: lossAmount ? Number(lossAmount) : undefined,
                gameSessionId,
                multiplier: multiplier ? Number(multiplier) : undefined,
                deviceType: device_type,
                ipAddress: ip_address,
                betAmount: betAmount
            });
            const tokenResult = await game_model_1.GameModel.verifyGameToken(sessionToken);
            __1.io.emit(`betResultUpdated-${tokenResult?.userId}`, {
                gameSessionId,
                betStatus,
                winAmount,
                lossAmount,
            });
            res.status(200).json({
                success: true,
                message: `Bet result updated successfully: ${betStatus}`,
                data: {
                    betStatus,
                    betAmount,
                    winAmount: winAmount || 0,
                    lossAmount: lossAmount || 0,
                    multiplier: multiplier || 1,
                },
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: "Failed to update bet result",
                error: error.message,
            });
        }
    }),
    // Get user bet history
    getUserBetHistory: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const { userId } = req.params;
            const { limit = 50 } = req.query;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "userId is required",
                });
            }
            const betHistory = await game_model_1.GameModel.getUserBetHistory(Number(userId), Number(limit));
            res.status(200).json({
                success: true,
                message: "Bet history retrieved successfully",
                data: betHistory,
                count: betHistory.length,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve bet history",
                error: error.message,
            });
        }
    }),
    // Get game statistics
    getGameStats: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const { gameId } = req.params;
            if (!gameId) {
                return res.status(400).json({
                    success: false,
                    message: "gameId is required",
                });
            }
            const stats = await game_model_1.GameModel.getGameStats(Number(gameId));
            res.status(200).json({
                success: true,
                message: "Game statistics retrieved successfully",
                data: stats,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve game statistics",
                error: error.message,
            });
        }
    }),
    // Get games by category
    getGamesByCategory: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const { category } = req.params;
            const { status = "active" } = req.query;
            if (!category) {
                return res.status(400).json({
                    success: false,
                    message: "Category is required",
                });
            }
            const games = await game_model_1.GameModel.getAllGamesWithProvider();
            const filteredGames = games.filter((game) => {
                const gameCategory = game.categoryInfo?.name || game.categoryInfo?.label || "";
                return (gameCategory.toLowerCase().includes(category.toLowerCase()) &&
                    game.status === status);
            });
            res.status(200).json({
                success: true,
                message: `Games in category '${category}' retrieved successfully`,
                data: filteredGames,
                count: filteredGames.length,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve games by category",
                error: error.message,
            });
        }
    }),
    // Get favorite games for a user
    getFavoriteGames: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const games = await game_model_1.GameModel.getAllGamesWithProvider();
            const favoriteGames = games.filter((game) => game.isFavorite);
            res.status(200).json({
                success: true,
                message: "Favorite games retrieved successfully",
                data: favoriteGames,
                count: favoriteGames.length,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve favorite games",
                error: error.message,
            });
        }
    }),
};
