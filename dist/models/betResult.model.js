"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetResultModel = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../db/connection");
const betResults_1 = require("../db/schema/betResults");
const games_1 = require("../db/schema/games");
const gameProvider_1 = require("../db/schema/gameProvider");
const schema_1 = require("../db/schema");
const balance_model_1 = require("./balance.model");
exports.BetResultModel = {
    async getBetResultsWithFilters(filters) {
        try {
            const { userId, gameId, betStatus, playingStatus, dateFrom, dateTo, minBetAmount, maxBetAmount, gameName, providerName, isMobile, limit = 50, offset = 0, sortBy = "createdAt", sortOrder = "desc", } = filters;
            console.log({ filters });
            // Build where conditions
            const whereConditions = [];
            if (userId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.userId, Number(userId)));
            }
            if (gameId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, gameId));
            }
            if (betStatus && betStatus.length > 0) {
                whereConditions.push((0, drizzle_orm_1.inArray)(betResults_1.betResults.betStatus, betStatus));
            }
            if (playingStatus && playingStatus.length > 0) {
                whereConditions.push((0, drizzle_orm_1.inArray)(betResults_1.betResults.playingStatus, playingStatus));
            }
            if (dateFrom) {
                whereConditions.push((0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, dateFrom));
            }
            if (dateTo) {
                whereConditions.push((0, drizzle_orm_1.lte)(betResults_1.betResults.createdAt, dateTo));
            }
            if (minBetAmount) {
                whereConditions.push((0, drizzle_orm_1.gte)(betResults_1.betResults.betAmount, minBetAmount.toString()));
            }
            if (maxBetAmount) {
                whereConditions.push((0, drizzle_orm_1.lte)(betResults_1.betResults.betAmount, maxBetAmount.toString()));
            }
            if (gameName) {
                whereConditions.push((0, drizzle_orm_1.like)(betResults_1.betResults.gameName, `%${gameName}%`));
            }
            if (providerName) {
                whereConditions.push((0, drizzle_orm_1.like)(betResults_1.betResults.gameProvider, `%${providerName}%`));
            }
            // Get total count for pagination
            const countQuery = connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(betResults_1.betResults);
            if (whereConditions.length > 0) {
                countQuery.where((0, drizzle_orm_1.and)(...whereConditions));
            }
            const totalResult = await countQuery;
            const total = totalResult[0]?.count || 0;
            // Apply sorting
            const sortField = sortBy === "betAmount"
                ? betResults_1.betResults.betAmount
                : sortBy === "userScore"
                    ? betResults_1.betResults.userScore
                    : sortBy === "betPlacedAt"
                        ? betResults_1.betResults.betPlacedAt
                        : betResults_1.betResults.createdAt;
            // Build main query with joins
            let query = connection_1.db
                .select({
                id: betResults_1.betResults.id,
                user: schema_1.users,
                userId: betResults_1.betResults.userId,
                gameId: betResults_1.betResults.gameId,
                betAmount: betResults_1.betResults.betAmount,
                betBalance: betResults_1.betResults.betBalance,
                betStatus: betResults_1.betResults.betStatus,
                playingStatus: betResults_1.betResults.playingStatus,
                sessionToken: betResults_1.betResults.sessionToken,
                gameSessionId: betResults_1.betResults.gameSessionId,
                winAmount: betResults_1.betResults.winAmount,
                lossAmount: betResults_1.betResults.lossAmount,
                multiplier: betResults_1.betResults.multiplier,
                gameName: betResults_1.betResults.gameName,
                gameProvider: betResults_1.betResults.gameProvider,
                gameCategory: betResults_1.betResults.gameCategory,
                userScore: betResults_1.betResults.userScore,
                userLevel: betResults_1.betResults.userLevel,
                betPlacedAt: betResults_1.betResults.betPlacedAt,
                gameStartedAt: betResults_1.betResults.gameStartedAt,
                gameCompletedAt: betResults_1.betResults.gameCompletedAt,
                ipAddress: betResults_1.betResults.ipAddress,
                deviceInfo: betResults_1.betResults.deviceInfo,
                isMobile: betResults_1.betResults.isMobile,
                createdBy: betResults_1.betResults.createdBy,
                updatedBy: betResults_1.betResults.updatedBy,
                createdAt: betResults_1.betResults.createdAt,
                updatedAt: betResults_1.betResults.updatedAt,
                // Game details
                gameId_join: games_1.games.id,
                gameName_join: games_1.games.name,
                gameLogo: games_1.games.gameLogo,
                gameUrl: games_1.games.gameUrl,
                gameStatus: games_1.games.status,
                // Provider details
                providerId: gameProvider_1.game_providers.id,
                providerName: gameProvider_1.game_providers.name,
                providerLogo: gameProvider_1.game_providers.logo,
                providerStatus: gameProvider_1.game_providers.status,
                providerCountry: gameProvider_1.game_providers.country,
            })
                .from(betResults_1.betResults)
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(betResults_1.betResults.userId, schema_1.users.id))
                .leftJoin(games_1.games, (0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, games_1.games.id))
                .leftJoin(gameProvider_1.game_providers, (0, drizzle_orm_1.eq)(games_1.games.providerId, gameProvider_1.game_providers.id)) // ✅ changed here
                .where((0, drizzle_orm_1.and)(...whereConditions))
                .orderBy(sortOrder === "asc" ? (0, drizzle_orm_1.asc)(sortField) : (0, drizzle_orm_1.desc)(sortField))
                .limit(limit)
                .offset(offset);
            // Apply pagination
            const results = await query;
            // Transform results to include parsed provider info and structured data
            const transformedResults = await Promise.all(results.map(async (row) => {
                // Parse provider info from JSON if available
                let parsedProviderInfo = null;
                if (row.gameProvider) {
                    try {
                        parsedProviderInfo = JSON.parse(row.gameProvider);
                    }
                    catch (error) {
                        console.warn("Failed to parse provider info JSON:", row.gameProvider);
                    }
                }
                const userBalance = await balance_model_1.BalanceModel.calculatePlayerBalance(row.userId);
                return {
                    id: row.id,
                    user: row.user,
                    userBalance,
                    betBalance: row?.betBalance,
                    userId: row.userId,
                    gameId: row.gameId,
                    betAmount: row.betAmount || "",
                    betStatus: row.betStatus || "",
                    playingStatus: row.playingStatus || "",
                    sessionToken: row.sessionToken || "",
                    gameSessionId: row.gameSessionId,
                    winAmount: row.winAmount || "",
                    lossAmount: row.lossAmount || "",
                    multiplier: row.multiplier || "",
                    gameName: row.gameName || "",
                    gameProvider: row.gameProvider || "",
                    gameCategory: row.gameCategory || "",
                    userScore: row.userScore || 0,
                    userLevel: row.userLevel || "",
                    betPlacedAt: row.betPlacedAt || new Date(),
                    gameStartedAt: row.gameStartedAt,
                    gameCompletedAt: row.gameCompletedAt,
                    ipAddress: row.ipAddress,
                    deviceInfo: row.deviceInfo,
                    isMobile: row.isMobile || false,
                    createdBy: row.createdBy,
                    updatedBy: row.updatedBy,
                    createdAt: row.createdAt || new Date(),
                    updatedAt: row.updatedAt || new Date(),
                    gameDetails: row.gameId_join
                        ? {
                            id: row.gameId_join,
                            name: row.gameName_join || row.gameName || "",
                            gameLogo: row.gameLogo || "",
                            gameUrl: row.gameUrl || "",
                            status: row.gameStatus || "unknown",
                        }
                        : undefined,
                    providerDetails: row.providerId
                        ? {
                            id: row.providerId,
                            name: row.providerName || "Unknown Provider",
                            logo: row.providerLogo || "",
                            status: row.providerStatus || "unknown",
                            country: row.providerCountry || "Unknown",
                        }
                        : undefined,
                };
            }));
            return {
                data: transformedResults,
                total,
                filters,
            };
        }
        catch (error) {
            console.error("Error fetching bet results with filters:", error);
            throw error;
        }
    },
    async getBetResultById(id) {
        try {
            const result = await connection_1.db
                .select({
                id: betResults_1.betResults.id,
                userId: betResults_1.betResults.userId,
                gameId: betResults_1.betResults.gameId,
                betAmount: betResults_1.betResults.betAmount,
                betStatus: betResults_1.betResults.betStatus,
                playingStatus: betResults_1.betResults.playingStatus,
                sessionToken: betResults_1.betResults.sessionToken,
                gameSessionId: betResults_1.betResults.gameSessionId,
                winAmount: betResults_1.betResults.winAmount,
                lossAmount: betResults_1.betResults.lossAmount,
                multiplier: betResults_1.betResults.multiplier,
                gameName: betResults_1.betResults.gameName,
                gameProvider: betResults_1.betResults.gameProvider,
                gameCategory: betResults_1.betResults.gameCategory,
                userScore: betResults_1.betResults.userScore,
                userLevel: betResults_1.betResults.userLevel,
                betPlacedAt: betResults_1.betResults.betPlacedAt,
                gameStartedAt: betResults_1.betResults.gameStartedAt,
                gameCompletedAt: betResults_1.betResults.gameCompletedAt,
                ipAddress: betResults_1.betResults.ipAddress,
                deviceInfo: betResults_1.betResults.deviceInfo,
                isMobile: betResults_1.betResults.isMobile,
                createdBy: betResults_1.betResults.createdBy,
                updatedBy: betResults_1.betResults.updatedBy,
                createdAt: betResults_1.betResults.createdAt,
                updatedAt: betResults_1.betResults.updatedAt,
                // Game details
                gameId_join: games_1.games.id,
                gameName_join: games_1.games.name,
                gameLogo: games_1.games.gameLogo,
                gameUrl: games_1.games.gameUrl,
                gameStatus: games_1.games.status,
                // Provider details
                providerId: gameProvider_1.game_providers.id,
                providerName: gameProvider_1.game_providers.name,
                providerLogo: gameProvider_1.game_providers.logo,
                providerStatus: gameProvider_1.game_providers.status,
                providerCountry: gameProvider_1.game_providers.country,
                // Category details
                categoryId_join: schema_1.dropdownOptions.id,
                categoryTitle: schema_1.dropdownOptions.title,
                categoryImgUrl: schema_1.dropdownOptions.imgUrl,
                categoryStatus: schema_1.dropdownOptions.status,
            })
                .from(betResults_1.betResults)
                .leftJoin(games_1.games, (0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, games_1.games.id))
                .leftJoin(gameProvider_1.game_providers, (0, drizzle_orm_1.eq)(games_1.games.providerId, gameProvider_1.game_providers.id)) // ✅ use providerId now
                .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(games_1.games.categoryId, schema_1.dropdownOptions.id)) // ✅ join category
                .where((0, drizzle_orm_1.eq)(betResults_1.betResults.id, id))
                .limit(1);
            if (result.length === 0) {
                return null;
            }
            const row = result[0];
            return {
                id: row.id,
                userId: row.userId,
                gameId: row.gameId,
                betAmount: row.betAmount || "",
                betStatus: row.betStatus || "",
                playingStatus: row.playingStatus || "",
                sessionToken: row.sessionToken || "",
                gameSessionId: row.gameSessionId,
                winAmount: row.winAmount || "",
                lossAmount: row.lossAmount || "",
                multiplier: row.multiplier || "",
                gameName: row.gameName || "",
                gameProvider: row.gameProvider || "",
                gameCategory: row.gameCategory || "",
                userScore: row.userScore || 0,
                userLevel: row.userLevel || "",
                betPlacedAt: row.betPlacedAt || new Date(),
                gameStartedAt: row.gameStartedAt,
                gameCompletedAt: row.gameCompletedAt,
                ipAddress: row.ipAddress,
                deviceInfo: row.deviceInfo,
                isMobile: row.isMobile || false,
                createdBy: row.createdBy,
                updatedBy: row.updatedBy,
                createdAt: row.createdAt || new Date(),
                updatedAt: row.updatedAt || new Date(),
                gameDetails: row.gameId_join
                    ? {
                        id: row.gameId_join,
                        name: row.gameName_join || row.gameName || "",
                        gameLogo: row.gameLogo || "",
                        gameUrl: row.gameUrl || "",
                        status: row.gameStatus || "unknown",
                    }
                    : undefined,
                providerDetails: row.providerId
                    ? {
                        id: row.providerId,
                        name: row.providerName || "Unknown Provider",
                        logo: row.providerLogo || "",
                        status: row.providerStatus || "unknown",
                        country: row.providerCountry || "Unknown",
                    }
                    : undefined,
            };
        }
        catch (error) {
            console.error("Error fetching bet result by ID:", error);
            throw error;
        }
    },
    async getBetResultStats(filters) {
        try {
            const whereConditions = [];
            if (filters?.userId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.userId, filters.userId));
            }
            if (filters?.gameId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, filters.gameId));
            }
            if (filters?.betStatus && filters.betStatus.length > 0) {
                whereConditions.push((0, drizzle_orm_1.inArray)(betResults_1.betResults.betStatus, filters.betStatus));
            }
            if (filters?.dateFrom) {
                whereConditions.push((0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, filters.dateFrom));
            }
            if (filters?.dateTo) {
                whereConditions.push((0, drizzle_orm_1.lte)(betResults_1.betResults.createdAt, filters.dateTo));
            }
            const query = connection_1.db
                .select({
                totalBets: (0, drizzle_orm_1.sql) `COUNT(*)`,
                totalBetAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.betAmount}), 0)`,
                totalWins: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END)`,
                totalLosses: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN 1 END)`,
                totalWinAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`,
                totalLossAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN ${betResults_1.betResults.lossAmount} ELSE 0 END), 0)`,
            })
                .from(betResults_1.betResults);
            if (whereConditions.length > 0) {
                query.where((0, drizzle_orm_1.and)(...whereConditions));
            }
            const result = await query;
            const stats = result[0];
            const totalBets = stats.totalBets || 0;
            const totalBetAmount = Number(stats.totalBetAmount) || 0;
            const totalWins = stats.totalWins || 0;
            const totalLosses = stats.totalLosses || 0;
            const totalWinAmount = Number(stats.totalWinAmount) || 0;
            const totalLossAmount = Number(stats.totalLossAmount) || 0;
            return {
                totalBets,
                totalBetAmount,
                totalWins,
                totalLosses,
                totalWinAmount,
                totalLossAmount,
                averageBetAmount: totalBets > 0 ? totalBetAmount / totalBets : 0,
                winRate: totalBets > 0 ? (totalWins / totalBets) * 100 : 0,
            };
        }
        catch (error) {
            console.error("Error fetching bet result stats:", error);
            throw error;
        }
    },
    // NEW: Get player rankings/leaderboard
    async getPlayerRankings(filters) {
        try {
            const whereConditions = [];
            if (filters.dateFrom) {
                whereConditions.push((0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, filters.dateFrom));
            }
            if (filters.dateTo) {
                whereConditions.push((0, drizzle_orm_1.lte)(betResults_1.betResults.createdAt, filters.dateTo));
            }
            if (filters.gameId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, filters.gameId));
            }
            if (filters.userId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.userId, filters.userId));
            }
            // Build order-by expression based on rankBy parameter (use raw expressions, not aliases)
            let orderByExpr;
            switch (filters.rankBy) {
                case "totalWins":
                    orderByExpr = (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END)`;
                    break;
                case "totalWinAmount":
                    orderByExpr = (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`;
                    break;
                case "winRate":
                    orderByExpr = (0, drizzle_orm_1.sql) `(COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END) / NULLIF(COUNT(*), 0))`;
                    break;
                case "totalProfit":
                    orderByExpr = (0, drizzle_orm_1.sql) `(COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN ${betResults_1.betResults.lossAmount} ELSE 0 END), 0))`;
                    break;
                case "totalBets":
                    orderByExpr = (0, drizzle_orm_1.sql) `COUNT(*)`;
                    break;
                case "avgBetAmount":
                    orderByExpr = (0, drizzle_orm_1.sql) `COALESCE(AVG(${betResults_1.betResults.betAmount}), 0)`;
                    break;
                default:
                    orderByExpr = (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END)`;
            }
            // Get total count for pagination
            const countQuery = connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.userId})` })
                .from(betResults_1.betResults);
            if (whereConditions.length > 0) {
                countQuery.where((0, drizzle_orm_1.and)(...whereConditions));
            }
            const totalResult = await countQuery;
            const total = totalResult[0]?.count || 0;
            // Main ranking query
            const results = await connection_1.db
                .select({
                userId: betResults_1.betResults?.userId,
                // user: users,
                // game: games,
                // provider: game_providers,
                totalBets: (0, drizzle_orm_1.sql) `COUNT(*)`,
                totalWins: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END)`,
                totalLosses: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN 1 END)`,
                totalWinAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`,
                totalLossAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN ${betResults_1.betResults.lossAmount} ELSE 0 END), 0)`,
                totalBetAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.betAmount}), 0)`,
                lastPlayed: (0, drizzle_orm_1.sql) `MAX(${betResults_1.betResults.createdAt})`,
            })
                .from(betResults_1.betResults)
                // .leftJoin(users, eq(betResults.userId, users.id))
                // .leftJoin(games, eq(betResults.gameId, games.id))
                // .leftJoin(game_providers, eq(games.providerId, game_providers.id))
                .where((0, drizzle_orm_1.and)(...whereConditions))
                .groupBy(betResults_1.betResults.userId)
                .having((0, drizzle_orm_1.sql) `COUNT(*) >= ${filters.minGames}`)
                .orderBy(filters.sortOrder === "desc" ? (0, drizzle_orm_1.desc)(orderByExpr) : (0, drizzle_orm_1.asc)(orderByExpr))
                .limit(filters.limit)
                .offset(filters.offset);
            // Transform results and add calculated fields
            const rankings = await Promise.all(results.map(async (row, index) => {
                const totalBets = row.totalBets || 0;
                const totalWins = row.totalWins || 0;
                const totalLosses = row.totalLosses || 0;
                const totalWinAmount = Number(row.totalWinAmount) || 0;
                const totalLossAmount = Number(row.totalLossAmount) || 0;
                const totalBetAmount = Number(row.totalBetAmount) || 0;
                const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
                const totalProfit = totalWinAmount - totalLossAmount;
                const avgBetAmount = totalBets > 0 ? totalBetAmount / totalBets : 0;
                const [userData] = await connection_1.db
                    .select()
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_1.users?.id, row?.userId));
                const userBalance = await balance_model_1.BalanceModel.calculatePlayerBalance(row?.userId, userData?.currency_id);
                return {
                    userId: row?.userId,
                    user: { ...userData, password: undefined },
                    userBalance,
                    // game: row.game,
                    // provider: row.provider,
                    rank: filters.offset + index + 1,
                    totalBets,
                    totalWins,
                    totalLosses,
                    totalWinAmount,
                    totalLossAmount,
                    totalBetAmount,
                    winRate: Math.round(winRate * 100) / 100, // Round to 2 decimal places
                    totalProfit: Math.round(totalProfit * 100) / 100,
                    avgBetAmount: Math.round(avgBetAmount * 100) / 100,
                    lastPlayed: row?.lastPlayed || new Date(),
                };
            }));
            // Add additional stats if requested
            // if (filters.includeStats) {
            //   for (const ranking of rankings) {
            //     const stats = await this.getPlayerStats(
            //       ranking.userId,
            //       filters.dateFrom,
            //       filters.dateTo,
            //       filters.gameId
            //     );
            //     ranking.stats = stats;
            //   }
            // }
            return {
                data: rankings,
                total,
            };
        }
        catch (error) {
            console.error("Error fetching player rankings:", error);
            throw error;
        }
    },
    // NEW: Get top winners leaderboard
    async getTopWinners(filters) {
        try {
            const whereConditions = [];
            if (filters.dateFrom) {
                whereConditions.push((0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, filters.dateFrom));
            }
            if (filters.dateTo) {
                whereConditions.push((0, drizzle_orm_1.lte)(betResults_1.betResults.createdAt, filters.dateTo));
            }
            if (filters.gameId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, filters.gameId));
            }
            // Get total count for pagination
            const countQuery = connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.userId})` })
                .from(betResults_1.betResults);
            if (whereConditions.length > 0) {
                countQuery.where((0, drizzle_orm_1.and)(...whereConditions));
            }
            const totalResult = await countQuery;
            const total = totalResult[0]?.count || 0;
            // Get top winners by total win amount
            const winnersBase = connection_1.db
                .select({
                userId: betResults_1.betResults.userId,
                totalBets: (0, drizzle_orm_1.sql) `COUNT(*)`,
                totalWins: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END)`,
                totalLosses: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN 1 END)`,
                totalWinAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`,
                totalLossAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN ${betResults_1.betResults.lossAmount} ELSE 0 END), 0)`,
                totalBetAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.betAmount}), 0)`,
                lastPlayed: (0, drizzle_orm_1.sql) `MAX(${betResults_1.betResults.createdAt})`,
            })
                .from(betResults_1.betResults);
            const winnersQuery = (whereConditions.length > 0
                ? winnersBase.where((0, drizzle_orm_1.and)(...whereConditions))
                : winnersBase)
                .groupBy(betResults_1.betResults.userId)
                .having((0, drizzle_orm_1.sql) `COUNT(*) >= ${filters.minGames}`)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`))
                .limit(filters.limit)
                .offset(filters.offset);
            const results = await winnersQuery;
            // Transform results
            const winners = results.map((row, index) => {
                const totalBets = row.totalBets || 0;
                const totalWins = row.totalWins || 0;
                const totalLosses = row.totalLosses || 0;
                const totalWinAmount = Number(row.totalWinAmount) || 0;
                const totalLossAmount = Number(row.totalLossAmount) || 0;
                const totalBetAmount = Number(row.totalBetAmount) || 0;
                const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
                const totalProfit = totalWinAmount - totalLossAmount;
                const avgBetAmount = totalBets > 0 ? totalBetAmount / totalBets : 0;
                return {
                    userId: row.userId,
                    rank: filters.offset + index + 1,
                    totalBets,
                    totalWins,
                    totalLosses,
                    totalWinAmount,
                    totalLossAmount,
                    totalBetAmount,
                    winRate: Math.round(winRate * 100) / 100,
                    totalProfit: Math.round(totalProfit * 100) / 100,
                    avgBetAmount: Math.round(avgBetAmount * 100) / 100,
                    lastPlayed: row.lastPlayed || new Date(),
                };
            });
            return {
                data: winners,
                total,
            };
        }
        catch (error) {
            console.error("Error fetching top winners:", error);
            throw error;
        }
    },
    // NEW: Get top losers leaderboard
    async getTopLosers(filters) {
        try {
            const whereConditions = [];
            if (filters.dateFrom) {
                whereConditions.push((0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, filters.dateFrom));
            }
            if (filters.dateTo) {
                whereConditions.push((0, drizzle_orm_1.lte)(betResults_1.betResults.createdAt, filters.dateTo));
            }
            if (filters.gameId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, filters.gameId));
            }
            // Get total count for pagination
            const countQuery = connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.userId})` })
                .from(betResults_1.betResults);
            if (whereConditions.length > 0) {
                countQuery.where((0, drizzle_orm_1.and)(...whereConditions));
            }
            const totalResult = await countQuery;
            const total = totalResult[0]?.count || 0;
            // Get top losers by total loss amount
            const losersBase = connection_1.db
                .select({
                userId: betResults_1.betResults.userId,
                totalBets: (0, drizzle_orm_1.sql) `COUNT(*)`,
                totalWins: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END)`,
                totalLosses: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN 1 END)`,
                totalWinAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`,
                totalLossAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN ${betResults_1.betResults.lossAmount} ELSE 0 END), 0)`,
                totalBetAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.betAmount}), 0)`,
                lastPlayed: (0, drizzle_orm_1.sql) `MAX(${betResults_1.betResults.createdAt})`,
            })
                .from(betResults_1.betResults);
            const losersQuery = (whereConditions.length > 0
                ? losersBase.where((0, drizzle_orm_1.and)(...whereConditions))
                : losersBase)
                .groupBy(betResults_1.betResults.userId)
                .having((0, drizzle_orm_1.sql) `COUNT(*) >= ${filters.minGames}`)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN ${betResults_1.betResults.lossAmount} ELSE 0 END), 0)`))
                .limit(filters.limit)
                .offset(filters.offset);
            const results = await losersQuery;
            // Transform results
            const losers = results.map((row, index) => {
                const totalBets = row.totalBets || 0;
                const totalWins = row.totalWins || 0;
                const totalLosses = row.totalLosses || 0;
                const totalWinAmount = Number(row.totalWinAmount) || 0;
                const totalLossAmount = Number(row.totalLossAmount) || 0;
                const totalBetAmount = Number(row.totalBetAmount) || 0;
                const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
                const totalProfit = totalWinAmount - totalLossAmount;
                const avgBetAmount = totalBets > 0 ? totalBetAmount / totalBets : 0;
                return {
                    userId: row.userId,
                    rank: filters.offset + index + 1,
                    totalBets,
                    totalWins,
                    totalLosses,
                    totalWinAmount,
                    totalLossAmount,
                    totalBetAmount,
                    winRate: Math.round(winRate * 100) / 100,
                    totalProfit: Math.round(totalProfit * 100) / 100,
                    avgBetAmount: Math.round(avgBetAmount * 100) / 100,
                    lastPlayed: row.lastPlayed || new Date(),
                };
            });
            return {
                data: losers,
                total,
            };
        }
        catch (error) {
            console.error("Error fetching top losers:", error);
            throw error;
        }
    },
    // NEW: Get player performance analytics
    async getPlayerPerformance(filters) {
        try {
            const whereConditions = [(0, drizzle_orm_1.eq)(betResults_1.betResults.userId, filters.userId)];
            if (filters.dateFrom) {
                whereConditions.push((0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, filters.dateFrom));
            }
            if (filters.dateTo) {
                whereConditions.push((0, drizzle_orm_1.lte)(betResults_1.betResults.createdAt, filters.dateTo));
            }
            if (filters.gameId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, filters.gameId));
            }
            let groupByField;
            let dateFormat;
            switch (filters.groupBy) {
                case "day":
                    groupByField = (0, drizzle_orm_1.sql) `DATE(${betResults_1.betResults.createdAt})`;
                    dateFormat = "YYYY-MM-DD";
                    break;
                case "week":
                    groupByField = (0, drizzle_orm_1.sql) `YEARWEEK(${betResults_1.betResults.createdAt})`;
                    dateFormat = "YYYY-WW";
                    break;
                case "month":
                    groupByField = (0, drizzle_orm_1.sql) `DATE_FORMAT(${betResults_1.betResults.createdAt}, '%Y-%m')`;
                    dateFormat = "YYYY-MM";
                    break;
                case "game":
                    groupByField = betResults_1.betResults.gameId;
                    dateFormat = "game";
                    break;
                default:
                    groupByField = (0, drizzle_orm_1.sql) `DATE(${betResults_1.betResults.createdAt})`;
                    dateFormat = "YYYY-MM-DD";
            }
            const performanceQuery = connection_1.db
                .select({
                period: groupByField,
                totalBets: (0, drizzle_orm_1.sql) `COUNT(*)`,
                totalWins: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END)`,
                totalLosses: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN 1 END)`,
                totalWinAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`,
                totalLossAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN ${betResults_1.betResults.lossAmount} ELSE 0 END), 0)`,
                totalBetAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.betAmount}), 0)`,
                avgBetAmount: (0, drizzle_orm_1.sql) `COALESCE(AVG(${betResults_1.betResults.betAmount}), 0)`,
            })
                .from(betResults_1.betResults)
                .where((0, drizzle_orm_1.and)(...whereConditions))
                .groupBy(groupByField)
                .orderBy((0, drizzle_orm_1.asc)(groupByField));
            const results = await performanceQuery;
            return {
                userId: filters.userId,
                groupBy: filters.groupBy,
                dateFormat,
                data: results.map((row) => ({
                    period: row.period,
                    totalBets: row.totalBets || 0,
                    totalWins: row.totalWins || 0,
                    totalLosses: row.totalLosses || 0,
                    totalWinAmount: Number(row.totalWinAmount) || 0,
                    totalLossAmount: Number(row.totalLossAmount) || 0,
                    totalBetAmount: Number(row.totalBetAmount) || 0,
                    avgBetAmount: Number(row.avgBetAmount) || 0,
                    winRate: row.totalBets > 0
                        ? Math.round((row.totalWins / row.totalBets) * 10000) / 100
                        : 0,
                    totalProfit: Number(row.totalWinAmount) - Number(row.totalLossAmount),
                })),
            };
        }
        catch (error) {
            console.error("Error fetching player performance:", error);
            throw error;
        }
    },
    // NEW: Get game performance analytics
    async getGamePerformance(filters) {
        try {
            const whereConditions = [(0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, filters.gameId)];
            if (filters.dateFrom) {
                whereConditions.push((0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, filters.dateFrom));
            }
            if (filters.dateTo) {
                whereConditions.push((0, drizzle_orm_1.lte)(betResults_1.betResults.createdAt, filters.dateTo));
            }
            let groupByField;
            let periodFormat;
            switch (filters.groupBy) {
                case "day":
                    groupByField = (0, drizzle_orm_1.sql) `DATE(${betResults_1.betResults.createdAt})`;
                    periodFormat = "YYYY-MM-DD";
                    break;
                case "week":
                    groupByField = (0, drizzle_orm_1.sql) `YEARWEEK(${betResults_1.betResults.createdAt})`;
                    periodFormat = "YYYY-WW";
                    break;
                case "month":
                    groupByField = (0, drizzle_orm_1.sql) `DATE_FORMAT(${betResults_1.betResults.createdAt}, '%Y-%m')`;
                    periodFormat = "YYYY-MM";
                    break;
                case "user":
                    groupByField = betResults_1.betResults.userId;
                    periodFormat = "user";
                    break;
                default:
                    groupByField = (0, drizzle_orm_1.sql) `DATE(${betResults_1.betResults.createdAt})`;
                    periodFormat = "YYYY-MM-DD";
            }
            const performanceQuery = connection_1.db
                .select({
                period: groupByField,
                totalBets: (0, drizzle_orm_1.sql) `COUNT(*)`,
                totalWins: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END)`,
                totalLosses: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN 1 END)`,
                totalWinAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`,
                totalLossAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN ${betResults_1.betResults.lossAmount} ELSE 0 END), 0)`,
                totalBetAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.betAmount}), 0)`,
                uniquePlayers: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.userId})`,
            })
                .from(betResults_1.betResults)
                .where((0, drizzle_orm_1.and)(...whereConditions))
                .groupBy(groupByField)
                .orderBy((0, drizzle_orm_1.asc)(groupByField));
            const results = await performanceQuery;
            return {
                gameId: filters.gameId,
                groupBy: filters.groupBy,
                periodFormat,
                data: results.map((row) => ({
                    period: row.period,
                    totalBets: row.totalBets || 0,
                    totalWins: row.totalWins || 0,
                    totalLosses: row.totalLosses || 0,
                    totalWinAmount: Number(row.totalWinAmount) || 0,
                    totalLossAmount: Number(row.totalLossAmount) || 0,
                    totalBetAmount: Number(row.totalBetAmount) || 0,
                    uniquePlayers: row.uniquePlayers || 0,
                    winRate: row.totalBets > 0
                        ? Math.round((row.totalWins / row.totalBets) * 10000) / 100
                        : 0,
                    totalProfit: Number(row.totalWinAmount) - Number(row.totalLossAmount),
                })),
            };
        }
        catch (error) {
            console.error("Error fetching game performance:", error);
            throw error;
        }
    },
    // NEW: Get comprehensive dashboard stats
    async getDashboardStats(filters) {
        try {
            const whereConditions = [];
            if (filters.dateFrom) {
                whereConditions.push((0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, filters.dateFrom));
            }
            if (filters.dateTo) {
                whereConditions.push((0, drizzle_orm_1.lte)(betResults_1.betResults.createdAt, filters.dateTo));
            }
            if (filters.gameId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, filters.gameId));
            }
            if (filters.userId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.userId, filters.userId));
            }
            const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
            // Overall stats
            const overallStats = await connection_1.db
                .select({
                totalBets: (0, drizzle_orm_1.sql) `COUNT(*)`,
                totalBetAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.betAmount}), 0)`,
                totalWins: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END)`,
                totalLosses: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN 1 END)`,
                totalWinAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`,
                totalLossAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN ${betResults_1.betResults.lossAmount} ELSE 0 END), 0)`,
                uniquePlayers: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.userId})`,
                uniqueGames: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.gameId})`,
            })
                .from(betResults_1.betResults)
                .where(whereClause);
            const stats = overallStats[0];
            // Top performers (top 5)
            const topPerformers = await connection_1.db
                .select({
                userId: betResults_1.betResults.userId,
                totalWins: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END)`,
                totalWinAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`,
            })
                .from(betResults_1.betResults)
                .where(whereClause)
                .groupBy(betResults_1.betResults.userId)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`))
                .limit(5);
            // Recent activity (last 10 bets)
            const recentActivity = await connection_1.db
                .select({
                id: betResults_1.betResults.id,
                userId: betResults_1.betResults.userId,
                gameId: betResults_1.betResults.gameId,
                betStatus: betResults_1.betResults.betStatus,
                betAmount: betResults_1.betResults.betAmount,
                winAmount: betResults_1.betResults.winAmount,
                lossAmount: betResults_1.betResults.lossAmount,
                createdAt: betResults_1.betResults.createdAt,
            })
                .from(betResults_1.betResults)
                .where(whereClause)
                .orderBy((0, drizzle_orm_1.desc)(betResults_1.betResults.createdAt))
                .limit(10);
            // Game popularity
            const gamePopularity = await connection_1.db
                .select({
                gameId: betResults_1.betResults.gameId,
                gameName: betResults_1.betResults.gameName,
                totalBets: (0, drizzle_orm_1.sql) `COUNT(*)`,
                totalBetAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.betAmount}), 0)`,
            })
                .from(betResults_1.betResults)
                .where(whereClause)
                .groupBy(betResults_1.betResults.gameId, betResults_1.betResults.gameName)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(*)`))
                .limit(10);
            const totalBets = stats.totalBets || 0;
            const totalBetAmount = Number(stats.totalBetAmount) || 0;
            const totalWins = stats.totalWins || 0;
            const totalLosses = stats.totalLosses || 0;
            const totalWinAmount = Number(stats.totalWinAmount) || 0;
            const totalLossAmount = Number(stats.totalLossAmount) || 0;
            return {
                overview: {
                    totalBets,
                    totalBetAmount: Math.round(totalBetAmount * 100) / 100,
                    totalWins,
                    totalLosses,
                    totalWinAmount: Math.round(totalWinAmount * 100) / 100,
                    totalLossAmount: Math.round(totalLossAmount * 100) / 100,
                    uniquePlayers: stats.uniquePlayers || 0,
                    uniqueGames: stats.uniqueGames || 0,
                    winRate: totalBets > 0
                        ? Math.round((totalWins / totalBets) * 10000) / 100
                        : 0,
                    totalProfit: Math.round((totalWinAmount - totalLossAmount) * 100) / 100,
                    averageBetAmount: totalBets > 0
                        ? Math.round((totalBetAmount / totalBets) * 100) / 100
                        : 0,
                },
                topPerformers: topPerformers.map((player, index) => ({
                    rank: index + 1,
                    userId: player.userId,
                    totalWins: player.totalWins || 0,
                    totalWinAmount: Math.round(Number(player.totalWinAmount) * 100) / 100,
                })),
                recentActivity: recentActivity.map((bet) => ({
                    id: bet.id,
                    userId: bet.userId,
                    gameId: bet.gameId,
                    betStatus: bet.betStatus,
                    betAmount: Number(bet.betAmount) || 0,
                    winAmount: Number(bet.winAmount) || 0,
                    lossAmount: Number(bet.lossAmount) || 0,
                    createdAt: bet.createdAt,
                })),
                gamePopularity: gamePopularity.map((game) => ({
                    gameId: game.gameId,
                    gameName: game.gameName || "Unknown Game",
                    totalBets: game.totalBets || 0,
                    totalBetAmount: Math.round(Number(game.totalBetAmount) * 100) / 100,
                })),
            };
        }
        catch (error) {
            console.error("Error fetching dashboard stats:", error);
            throw error;
        }
    },
    // NEW: Get comprehensive game-wise statistics
    async getGameWiseStats(filters) {
        try {
            const { dateFrom, dateTo, gameId, gameName, userId, providerId, categoryId, status, limit = 50, offset = 0, sortBy = "totalBets", sortOrder = "desc", } = filters;
            // Build where conditions
            const whereConditions = [];
            if (dateFrom) {
                whereConditions.push((0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, dateFrom));
            }
            if (dateTo) {
                whereConditions.push((0, drizzle_orm_1.lte)(betResults_1.betResults.createdAt, dateTo));
            }
            if (gameId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, gameId));
            }
            if (userId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.userId, userId));
            }
            if (providerId) {
                whereConditions.push((0, drizzle_orm_1.eq)(games_1.games.providerId, providerId));
            }
            if (gameName) {
                whereConditions.push((0, drizzle_orm_1.like)(games_1.games.name, `%${gameName}%`));
            }
            if (status) {
                whereConditions.push((0, drizzle_orm_1.eq)(games_1.games.status, status));
            }
            const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
            // Get total count for pagination
            const countQuery = connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.gameId})` })
                .from(betResults_1.betResults)
                .leftJoin(games_1.games, (0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, games_1.games.id));
            if (whereClause) {
                countQuery.where(whereClause);
            }
            const totalResult = await countQuery;
            const total = totalResult[0]?.count || 0;
            // Build order-by expression based on sortBy parameter
            let orderByExpr;
            switch (sortBy) {
                case "totalBets":
                    orderByExpr = (0, drizzle_orm_1.sql) `COUNT(*)`;
                    break;
                case "totalBetAmount":
                    orderByExpr = (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.betAmount}), 0)`;
                    break;
                case "totalWinAmount":
                    orderByExpr = (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.winAmount}), 0)`;
                    break;
                case "totalLossAmount":
                    orderByExpr = (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.lossAmount}), 0)`;
                    break;
                case "totalPlayers":
                    orderByExpr = (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.userId})`;
                    break;
                case "winRate":
                    orderByExpr = (0, drizzle_orm_1.sql) `(COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END) / NULLIF(COUNT(*), 0))`;
                    break;
                default:
                    orderByExpr = (0, drizzle_orm_1.sql) `COUNT(*)`;
            }
            // Main query for game-wise statistics
            const results = await connection_1.db
                .select({
                // Game details
                gameId: betResults_1.betResults.gameId,
                // gameName: games.name,
                // gameLogo: games.gameLogo,
                // gameUrl: games.gameUrl,
                // gameStatus: games.status,
                // categoryId: games.categoryId,
                // providerId: games.providerId,
                game: games_1.games,
                provider: gameProvider_1.game_providers,
                user: schema_1.users,
                // Statistics
                totalBets: (0, drizzle_orm_1.sql) `COUNT(*)`,
                totalBetAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.betAmount}), 0)`,
                totalWinAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.winAmount}), 0)`,
                totalLossAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.lossAmount}), 0)`,
                totalPendingBets: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'pending' THEN 1 END)`,
                totalPlayersPlayed: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.userId})`,
                // Recent activity
                lastBetPlaced: (0, drizzle_orm_1.sql) `MAX(${betResults_1.betResults.createdAt})`,
                lastWinAmount: (0, drizzle_orm_1.sql) `MAX(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END)`,
                lastLossAmount: (0, drizzle_orm_1.sql) `MAX(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN ${betResults_1.betResults.lossAmount} ELSE 0 END)`,
                // Category details
                categoryTitle: schema_1.dropdownOptions.title,
                categoryImgUrl: schema_1.dropdownOptions.imgUrl,
                // Provider details
                providerName: gameProvider_1.game_providers.name,
                providerLogo: gameProvider_1.game_providers.logo,
                providerCountry: gameProvider_1.game_providers.country,
            })
                .from(betResults_1.betResults)
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(betResults_1.betResults.userId, schema_1.users.id))
                .leftJoin(games_1.games, (0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, games_1.games.id))
                .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(games_1.games.categoryId, schema_1.dropdownOptions.id))
                .leftJoin(gameProvider_1.game_providers, (0, drizzle_orm_1.eq)(games_1.games.providerId, gameProvider_1.game_providers.id))
                .where(whereClause)
                .groupBy(betResults_1.betResults.gameId, games_1.games.id, schema_1.dropdownOptions.title, schema_1.dropdownOptions.imgUrl, gameProvider_1.game_providers.name, gameProvider_1.game_providers.logo, gameProvider_1.game_providers.country)
                .orderBy(sortOrder === "desc" ? (0, drizzle_orm_1.desc)(orderByExpr) : (0, drizzle_orm_1.asc)(orderByExpr))
                .limit(limit)
                .offset(offset);
            // Get additional time-based player statistics for each game
            const gameIds = results.map((r) => r.gameId);
            const timeBasedStats = await Promise.all(gameIds.map(async (gameId) => {
                const today = new Date();
                const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                const [todayStats] = await connection_1.db
                    .select({
                    count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.userId})`,
                })
                    .from(betResults_1.betResults)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, gameId), (0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, today)))
                    .limit(1);
                const [weekStats] = await connection_1.db
                    .select({
                    count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.userId})`,
                })
                    .from(betResults_1.betResults)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, gameId), (0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, weekAgo)))
                    .limit(1);
                const [monthStats] = await connection_1.db
                    .select({
                    count: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${betResults_1.betResults.userId})`,
                })
                    .from(betResults_1.betResults)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, gameId), (0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, monthAgo)))
                    .limit(1);
                return {
                    gameId,
                    uniquePlayersToday: todayStats?.count || 0,
                    uniquePlayersThisWeek: weekStats?.count || 0,
                    uniquePlayersThisMonth: monthStats?.count || 0,
                };
            }));
            // Transform results to include calculated fields
            const gameStats = results.map((row) => {
                const totalBets = row.totalBets || 0;
                const totalBetAmount = Number(row.totalBetAmount) || 0;
                const totalWinAmount = Number(row.totalWinAmount) || 0;
                const totalLossAmount = Number(row.totalLossAmount) || 0;
                const totalPendingBets = row.totalPendingBets || 0;
                const totalPlayersPlayed = row.totalPlayersPlayed || 0;
                const winRate = totalBets > 0
                    ? totalBets - totalPendingBets > 0
                        ? (totalWinAmount / (totalBets - totalPendingBets)) * 100
                        : 0
                    : 0;
                const averageBetAmount = totalBets > 0 ? totalBetAmount / totalBets : 0;
                const totalProfit = totalWinAmount - totalLossAmount;
                // Find time-based stats for this game
                const timeStats = timeBasedStats.find((ts) => ts.gameId === row.gameId);
                return {
                    ...row,
                    gameId: row.gameId,
                    // Statistics
                    totalBets,
                    totalBetAmount: Math.round(totalBetAmount * 100) / 100,
                    totalWinAmount: Math.round(totalWinAmount * 100) / 100,
                    totalLossAmount: Math.round(totalLossAmount * 100) / 100,
                    totalPendingBets,
                    totalPlayersPlayed,
                    winRate: Math.round(winRate * 100) / 100,
                    averageBetAmount: Math.round(averageBetAmount * 100) / 100,
                    totalProfit: Math.round(totalProfit * 100) / 100,
                    // Recent activity
                    lastBetPlaced: row.lastBetPlaced,
                    lastWinAmount: Number(row.lastWinAmount) || 0,
                    lastLossAmount: Number(row.lastLossAmount) || 0,
                    // Player distribution
                    uniquePlayersToday: timeStats?.uniquePlayersToday || 0,
                    uniquePlayersThisWeek: timeStats?.uniquePlayersThisWeek || 0,
                    uniquePlayersThisMonth: timeStats?.uniquePlayersThisMonth || 0,
                };
            });
            // Calculate summary statistics
            const summary = {
                totalGames: total,
                totalBets: gameStats.reduce((sum, game) => sum + game.totalBets, 0),
                totalBetAmount: Math.round(gameStats.reduce((sum, game) => sum + game.totalBetAmount, 0) * 100) / 100,
                totalWinAmount: Math.round(gameStats.reduce((sum, game) => sum + game.totalWinAmount, 0) * 100) / 100,
                totalLossAmount: Math.round(gameStats.reduce((sum, game) => sum + game.totalLossAmount, 0) * 100) / 100,
                totalPendingBets: gameStats.reduce((sum, game) => sum + game.totalPendingBets, 0),
                totalPlayersPlayed: new Set(gameStats.flatMap((game) => Array.from({ length: game.totalPlayersPlayed }, () => game.gameId))).size,
                overallWinRate: gameStats.length > 0
                    ? Math.round((gameStats.reduce((sum, game) => sum + game.winRate, 0) /
                        gameStats.length) *
                        100) / 100
                    : 0,
            };
            // Calculate pagination
            const currentOffset = filters.offset || 0;
            const currentLimit = filters.limit || 50;
            const page = Math.floor(currentOffset / currentLimit) + 1;
            const pageSize = currentLimit;
            const totalPages = Math.ceil(total / currentLimit);
            return {
                data: gameStats,
                total,
                summary,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            console.error("Error fetching game-wise statistics:", error);
            throw error;
        }
    },
    // Helper method to get player stats
    async getPlayerStats(userId, dateFrom, dateTo, gameId) {
        try {
            const whereConditions = [(0, drizzle_orm_1.eq)(betResults_1.betResults.userId, userId)];
            if (dateFrom) {
                whereConditions.push((0, drizzle_orm_1.gte)(betResults_1.betResults.createdAt, dateFrom));
            }
            if (dateTo) {
                whereConditions.push((0, drizzle_orm_1.lte)(betResults_1.betResults.createdAt, dateTo));
            }
            if (gameId) {
                whereConditions.push((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, gameId));
            }
            const whereClause = (0, drizzle_orm_1.and)(...whereConditions);
            // Get games played
            const gamesPlayed = await connection_1.db
                .select({ gameName: betResults_1.betResults.gameName })
                .from(betResults_1.betResults)
                .where(whereClause)
                .groupBy(betResults_1.betResults.gameName);
            // Get favorite game (most played)
            const favoriteGame = await connection_1.db
                .select({ gameName: betResults_1.betResults.gameName, count: (0, drizzle_orm_1.sql) `COUNT(*)` })
                .from(betResults_1.betResults)
                .where(whereClause)
                .groupBy(betResults_1.betResults.gameName)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `count`))
                .limit(1);
            // Get best win
            const bestWin = await connection_1.db
                .select({ winAmount: betResults_1.betResults.winAmount })
                .from(betResults_1.betResults)
                .where((0, drizzle_orm_1.and)(whereClause, (0, drizzle_orm_1.eq)(betResults_1.betResults.betStatus, "win")))
                .orderBy((0, drizzle_orm_1.desc)(betResults_1.betResults.winAmount))
                .limit(1);
            // Get worst loss
            const worstLoss = await connection_1.db
                .select({ lossAmount: betResults_1.betResults.lossAmount })
                .from(betResults_1.betResults)
                .where((0, drizzle_orm_1.and)(whereClause, (0, drizzle_orm_1.eq)(betResults_1.betResults.betStatus, "loss")))
                .orderBy((0, drizzle_orm_1.desc)(betResults_1.betResults.lossAmount))
                .limit(1);
            return {
                gamesPlayed: gamesPlayed.map((g) => g.gameName || "Unknown Game"),
                favoriteGame: favoriteGame[0]?.gameName || "Unknown Game",
                bestWin: Number(bestWin[0]?.winAmount) || 0,
                worstLoss: Number(worstLoss[0]?.lossAmount) || 0,
            };
        }
        catch (error) {
            console.error("Error fetching player stats:", error);
            return {
                gamesPlayed: [],
                favoriteGame: "Unknown Game",
                bestWin: 0,
                worstLoss: 0,
            };
        }
    },
};
