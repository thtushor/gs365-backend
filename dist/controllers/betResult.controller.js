"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetResultController = void 0;
const betResult_model_1 = require("../models/betResult.model");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.BetResultController = {
    // Get bet results with comprehensive filtering
    getBetResults: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const startOfDay = (value) => {
                const d = new Date(value);
                d.setHours(0, 0, 0, 0);
                return d;
            };
            const endOfDay = (value) => {
                const d = new Date(value);
                d.setHours(23, 59, 59, 999);
                return d;
            };
            const { userId, gameId, betStatus, playingStatus, dateFrom, dateTo, minBetAmount, maxBetAmount, gameName, providerName, isMobile, pageSize = 50, page = 1, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
            // Build filters object
            const filters = {
                limit: Number(pageSize),
                offset: Number(pageSize) * (Number(page) - 1),
                sortBy: sortBy,
                sortOrder: sortOrder
            };
            // Add optional filters
            if (userId)
                filters.userId = Number(userId);
            if (gameId)
                filters.gameId = Number(gameId);
            if (betStatus) {
                const betStatusArray = Array.isArray(betStatus) ? betStatus : [betStatus];
                const validBetStatuses = ['win', 'loss', 'pending', 'cancelled'];
                const filteredBetStatuses = betStatusArray
                    .map(status => String(status))
                    .filter((status) => validBetStatuses.includes(status));
                if (filteredBetStatuses.length > 0) {
                    filters.betStatus = filteredBetStatuses;
                }
            }
            if (playingStatus) {
                const playingStatusArray = Array.isArray(playingStatus) ? playingStatus : [playingStatus];
                const validPlayingStatuses = ['playing', 'completed', 'abandoned'];
                const filteredPlayingStatuses = playingStatusArray
                    .map(status => String(status))
                    .filter((status) => validPlayingStatuses.includes(status));
                if (filteredPlayingStatuses.length > 0) {
                    filters.playingStatus = filteredPlayingStatuses;
                }
            }
            if (dateFrom)
                filters.dateFrom = startOfDay(dateFrom);
            if (dateTo)
                filters.dateTo = endOfDay(dateTo);
            if (minBetAmount)
                filters.minBetAmount = Number(minBetAmount);
            if (maxBetAmount)
                filters.maxBetAmount = Number(maxBetAmount);
            if (gameName)
                filters.gameName = gameName;
            if (providerName)
                filters.providerName = providerName;
            if (isMobile !== undefined)
                filters.isMobile = isMobile === 'true';
            const result = await betResult_model_1.BetResultModel.getBetResultsWithFilters(filters);
            res.status(200).json({
                success: true,
                message: "Bet results retrieved successfully",
                data: result.data,
                pagination: {
                    page: Number(page),
                    pageSize: Number(pageSize),
                    totalPages: Math.ceil(result.total / Number(filters.limit)),
                    hasMore: result.total > (Number(filters.offset) + Number(filters.limit))
                },
                filters: result.filters,
                count: result.data.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve bet results",
                error: error.message,
            });
        }
    }),
    // Get bet result by ID
    getBetResultById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Bet result ID is required",
                });
            }
            const betResult = await betResult_model_1.BetResultModel.getBetResultById(Number(id));
            if (!betResult) {
                return res.status(404).json({
                    success: false,
                    message: "Bet result not found",
                });
            }
            res.status(200).json({
                success: true,
                message: "Bet result retrieved successfully",
                data: betResult,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve bet result",
                error: error.message,
            });
        }
    }),
    // Get bet result statistics
    getBetResultStats: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const startOfDay = (value) => {
                const d = new Date(value);
                d.setHours(0, 0, 0, 0);
                return d;
            };
            const endOfDay = (value) => {
                const d = new Date(value);
                d.setHours(23, 59, 59, 999);
                return d;
            };
            const { userId, gameId, betStatus, dateFrom, dateTo } = req.query;
            // Build filters object for stats
            const filters = {};
            if (userId)
                filters.userId = Number(userId);
            if (gameId)
                filters.gameId = Number(gameId);
            if (betStatus) {
                const betStatusArray = Array.isArray(betStatus) ? betStatus : [betStatus];
                filters.betStatus = betStatusArray.map(status => String(status));
            }
            if (dateFrom)
                filters.dateFrom = startOfDay(dateFrom);
            if (dateTo)
                filters.dateTo = endOfDay(dateTo);
            const stats = await betResult_model_1.BetResultModel.getBetResultStats(filters);
            res.status(200).json({
                success: true,
                message: "Bet result statistics retrieved successfully",
                data: stats,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve bet result statistics",
                error: error.message,
            });
        }
    }),
    // Get bet results by user
    getBetResultsByUser: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const { userId } = req.params;
            const { limit = 50, offset = 0 } = req.query;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
            }
            const filters = {
                userId: Number(userId),
                limit: Number(limit),
                offset: Number(offset),
                sortBy: 'createdAt',
                sortOrder: 'desc'
            };
            const result = await betResult_model_1.BetResultModel.getBetResultsWithFilters(filters);
            res.status(200).json({
                success: true,
                message: "User bet results retrieved successfully",
                data: result.data,
                pagination: {
                    total: result.total,
                    limit: Number(limit),
                    offset: Number(offset),
                    hasMore: result.total > (Number(offset) + Number(limit))
                },
                count: result.data.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve user bet results",
                error: error.message,
            });
        }
    }),
    // Get bet results by game
    getBetResultsByGame: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const { gameId } = req.params;
            const { limit = 50, offset = 0 } = req.query;
            if (!gameId) {
                return res.status(400).json({
                    success: false,
                    message: "Game ID is required",
                });
            }
            const filters = {
                gameId: Number(gameId),
                limit: Number(limit),
                offset: Number(offset),
                sortBy: 'createdAt',
                sortOrder: 'desc'
            };
            const result = await betResult_model_1.BetResultModel.getBetResultsWithFilters(filters);
            res.status(200).json({
                success: true,
                message: "Game bet results retrieved successfully",
                data: result.data,
                pagination: {
                    total: result.total,
                    limit: Number(limit),
                    offset: Number(offset),
                    hasMore: result.total > (Number(offset) + Number(limit))
                },
                count: result.data.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve game bet results",
                error: error.message,
            });
        }
    }),
    // Get bet results by status
    getBetResultsByStatus: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const { status } = req.params;
            const { limit = 50, offset = 0 } = req.query;
            if (!status) {
                return res.status(400).json({
                    success: false,
                    message: "Status is required",
                });
            }
            const validStatuses = ['win', 'loss', 'pending', 'cancelled'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid status. Must be one of: win, loss, pending, cancelled",
                });
            }
            const filters = {
                betStatus: [status],
                limit: Number(limit),
                offset: Number(offset),
                sortBy: 'createdAt',
                sortOrder: 'desc'
            };
            const result = await betResult_model_1.BetResultModel.getBetResultsWithFilters(filters);
            res.status(200).json({
                success: true,
                message: "Bet results by status retrieved successfully",
                data: result.data,
                pagination: {
                    total: result.total,
                    limit: Number(limit),
                    offset: Number(offset),
                    hasMore: result.total > (Number(offset) + Number(limit))
                },
                count: result.data.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve bet results by status",
                error: error.message,
            });
        }
    }),
    // NEW: Get player rankings/leaderboard
    getPlayerRankings: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const { rankBy = 'totalWins', // 'totalWins', 'totalWinAmount', 'winRate', 'totalProfit'
            sortOrder = 'desc', limit = 50, offset = 0, dateFrom, dateTo, gameId, userId, minGames = 1, // Minimum games played to be included in rankings
            includeStats = 'true' } = req.query;
            // Validate rankBy parameter
            const validRankByOptions = ['totalWins', 'totalWinAmount', 'winRate', 'totalProfit', 'totalBets', 'avgBetAmount'];
            if (!validRankByOptions.includes(rankBy)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid rankBy parameter. Must be one of: ${validRankByOptions.join(', ')}`,
                });
            }
            // Validate sortOrder
            if (!['asc', 'desc'].includes(sortOrder)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid sortOrder. Must be 'asc' or 'desc'",
                });
            }
            const filters = {
                rankBy: rankBy,
                sortOrder: sortOrder,
                limit: Number(limit),
                offset: Number(offset),
                dateFrom: dateFrom ? new Date(dateFrom) : undefined,
                dateTo: dateTo ? new Date(dateTo) : undefined,
                gameId: gameId ? Number(gameId) : undefined,
                minGames: Number(minGames),
                includeStats: includeStats === 'true',
                userId: userId ? Number(userId) : undefined
            };
            const result = await betResult_model_1.BetResultModel.getPlayerRankings(filters);
            res.status(200).json({
                success: true,
                message: "Player rankings retrieved successfully",
                data: result.data,
                pagination: {
                    total: result.total,
                    limit: Number(limit),
                    offset: Number(offset),
                    hasMore: result.total > (Number(offset) + Number(limit))
                },
                ranking: {
                    rankBy: rankBy,
                    sortOrder: sortOrder,
                    minGames: Number(minGames)
                },
                count: result.data.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve player rankings",
                error: error.message,
            });
        }
    }),
    // NEW: Get top winners leaderboard
    getTopWinners: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const startOfDay = (value) => {
                const d = new Date(value);
                d.setHours(0, 0, 0, 0);
                return d;
            };
            const endOfDay = (value) => {
                const d = new Date(value);
                d.setHours(23, 59, 59, 999);
                return d;
            };
            const { limit = 50, offset = 0, dateFrom, dateTo, gameId, minGames = 1 } = req.query;
            const filters = {
                limit: Number(limit),
                offset: Number(offset),
                dateFrom: dateFrom ? startOfDay(dateFrom) : undefined,
                dateTo: dateTo ? endOfDay(dateTo) : undefined,
                gameId: gameId ? Number(gameId) : undefined,
                minGames: Number(minGames)
            };
            const result = await betResult_model_1.BetResultModel.getTopWinners(filters);
            res.status(200).json({
                success: true,
                message: "Top winners leaderboard retrieved successfully",
                data: result.data,
                pagination: {
                    total: result.total,
                    limit: Number(limit),
                    offset: Number(offset),
                    hasMore: result.total > (Number(offset) + Number(limit))
                },
                count: result.data.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve top winners",
                error: error.message,
            });
        }
    }),
    // NEW: Get top losers leaderboard
    getTopLosers: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const startOfDay = (value) => {
                const d = new Date(value);
                d.setHours(0, 0, 0, 0);
                return d;
            };
            const endOfDay = (value) => {
                const d = new Date(value);
                d.setHours(23, 59, 59, 999);
                return d;
            };
            const { limit = 50, offset = 0, dateFrom, dateTo, gameId, minGames = 1 } = req.query;
            const filters = {
                limit: Number(limit),
                offset: Number(offset),
                dateFrom: dateFrom ? startOfDay(dateFrom) : undefined,
                dateTo: dateTo ? endOfDay(dateTo) : undefined,
                gameId: gameId ? Number(gameId) : undefined,
                minGames: Number(minGames)
            };
            const result = await betResult_model_1.BetResultModel.getTopLosers(filters);
            res.status(200).json({
                success: true,
                message: "Top losers leaderboard retrieved successfully",
                data: result.data,
                pagination: {
                    total: result.total,
                    limit: Number(limit),
                    offset: Number(offset),
                    hasMore: result.total > (Number(offset) + Number(limit))
                },
                count: result.data.length
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve top losers",
                error: error.message,
            });
        }
    }),
    // NEW: Get player performance analytics
    getPlayerPerformance: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const startOfDay = (value) => {
                const d = new Date(value);
                d.setHours(0, 0, 0, 0);
                return d;
            };
            const endOfDay = (value) => {
                const d = new Date(value);
                d.setHours(23, 59, 59, 999);
                return d;
            };
            const { userId, dateFrom, dateTo, gameId, groupBy = 'day' // 'day', 'week', 'month', 'game'
             } = req.query;
            if (!userId) {
                return res.status(400).json({
                    success: false,
                    message: "User ID is required",
                });
            }
            // Validate groupBy parameter
            const validGroupByOptions = ['day', 'week', 'month', 'game'];
            if (!validGroupByOptions.includes(groupBy)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid groupBy parameter. Must be one of: ${validGroupByOptions.join(', ')}`,
                });
            }
            const filters = {
                userId: Number(userId),
                dateFrom: dateFrom ? startOfDay(dateFrom) : undefined,
                dateTo: dateTo ? endOfDay(dateTo) : undefined,
                gameId: gameId ? Number(gameId) : undefined,
                groupBy: groupBy
            };
            const result = await betResult_model_1.BetResultModel.getPlayerPerformance(filters);
            res.status(200).json({
                success: true,
                message: "Player performance analytics retrieved successfully",
                data: result,
                filters: {
                    userId: Number(userId),
                    dateFrom: dateFrom,
                    dateTo: dateTo,
                    gameId: gameId,
                    groupBy: groupBy
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve player performance",
                error: error.message,
            });
        }
    }),
    // NEW: Get game performance analytics
    getGamePerformance: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const startOfDay = (value) => {
                const d = new Date(value);
                d.setHours(0, 0, 0, 0);
                return d;
            };
            const endOfDay = (value) => {
                const d = new Date(value);
                d.setHours(23, 59, 59, 999);
                return d;
            };
            const { gameId, dateFrom, dateTo, groupBy = 'day' // 'day', 'week', 'month', 'user'
             } = req.query;
            if (!gameId) {
                return res.status(400).json({
                    success: false,
                    message: "Game ID is required",
                });
            }
            // Validate groupBy parameter
            const validGroupByOptions = ['day', 'week', 'month', 'user'];
            if (!validGroupByOptions.includes(groupBy)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid groupBy parameter. Must be one of: ${validGroupByOptions.join(', ')}`,
                });
            }
            const filters = {
                gameId: Number(gameId),
                dateFrom: dateFrom ? startOfDay(dateFrom) : undefined,
                dateTo: dateTo ? endOfDay(dateTo) : undefined,
                groupBy: groupBy
            };
            const result = await betResult_model_1.BetResultModel.getGamePerformance(filters);
            res.status(200).json({
                success: true,
                message: "Game performance analytics retrieved successfully",
                data: result,
                filters: {
                    gameId: Number(gameId),
                    dateFrom: dateFrom,
                    dateTo: dateTo,
                    groupBy: groupBy
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve game performance",
                error: error.message,
            });
        }
    }),
    // NEW: Get comprehensive dashboard stats
    getDashboardStats: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        try {
            const startOfDay = (value) => {
                const d = new Date(value);
                d.setHours(0, 0, 0, 0);
                return d;
            };
            const endOfDay = (value) => {
                const d = new Date(value);
                d.setHours(23, 59, 59, 999);
                return d;
            };
            const { dateFrom, dateTo, gameId, userId } = req.query;
            const filters = {
                dateFrom: dateFrom ? startOfDay(dateFrom) : undefined,
                dateTo: dateTo ? endOfDay(dateTo) : undefined,
                gameId: gameId ? Number(gameId) : undefined,
                userId: userId ? Number(userId) : undefined
            };
            const result = await betResult_model_1.BetResultModel.getDashboardStats(filters);
            res.status(200).json({
                success: true,
                message: "Dashboard statistics retrieved successfully",
                data: result,
                filters: filters
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to retrieve dashboard statistics",
                error: error.message,
            });
        }
    }),
};
