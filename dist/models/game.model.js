"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameModel = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../db/connection");
const games_1 = require("../db/schema/games");
const gameProvider_1 = require("../db/schema/gameProvider");
const betResults_1 = require("../db/schema/betResults");
const transactions_1 = require("../db/schema/transactions");
const balance_model_1 = require("./balance.model");
const jwt_1 = require("../utils/jwt");
const schema_1 = require("../db/schema");
const commission_model_1 = require("./commission.model");
const user_model_1 = require("./user.model");
const admin_model_1 = require("./admin.model");
exports.GameModel = {
    async getAllGamesWithProvider() {
        try {
            const result = await connection_1.db
                .select({
                // Game fields
                id: games_1.games.id,
                name: games_1.games.name,
                status: games_1.games.status,
                isFavorite: games_1.games.isFavorite,
                isExclusive: games_1.games.isExclusive,
                gameLogo: games_1.games.gameLogo,
                gameUrl: games_1.games.gameUrl,
                ggrPercent: games_1.games.ggrPercent,
                categoryId: games_1.games.categoryId,
                providerId: games_1.games.providerId,
                createdBy: games_1.games.createdBy,
                createdAt: games_1.games.createdAt,
                // Joined info
                categoryInfo: schema_1.dropdownOptions,
                providerInfo: gameProvider_1.game_providers,
            })
                .from(games_1.games)
                .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(games_1.games.categoryId, schema_1.dropdownOptions.id))
                .leftJoin(gameProvider_1.game_providers, (0, drizzle_orm_1.eq)(games_1.games.providerId, gameProvider_1.game_providers.id))
                .where((0, drizzle_orm_1.eq)(games_1.games.status, "active"))
                .orderBy(games_1.games.name);
            return result.map((row) => ({
                ...row,
                status: row.status || "inactive",
                isFavorite: row.isFavorite ?? false,
                createdAt: row.createdAt || new Date(),
                categoryInfo: row.categoryInfo || null,
                provider: row.providerInfo
                    ? {
                        id: row.providerInfo.id,
                        name: row.providerInfo.name,
                        logo: row.providerInfo.logo,
                        status: row.providerInfo.status || "inactive",
                        country: row.providerInfo.country,
                    }
                    : {
                        id: 0,
                        name: "Unknown Provider",
                        logo: "",
                        status: "inactive",
                        country: "Unknown",
                    },
            }));
        }
        catch (error) {
            console.error("Error fetching games with provider info:", error);
            throw error;
        }
    },
    async playGame(request) {
        try {
            // Fetch game with provider and category info
            const [game] = await connection_1.db
                .select({
                id: games_1.games.id,
                name: games_1.games.name,
                status: games_1.games.status,
                isFavorite: games_1.games.isFavorite,
                isExclusive: games_1.games.isExclusive,
                gameLogo: games_1.games.gameLogo,
                gameUrl: games_1.games.gameUrl,
                ggrPercent: games_1.games.ggrPercent,
                categoryId: games_1.games.categoryId,
                providerId: games_1.games.providerId,
                createdBy: games_1.games.createdBy,
                createdAt: games_1.games.createdAt,
                // Joined info
                categoryInfo: schema_1.dropdownOptions,
                providerInfo: gameProvider_1.game_providers,
            })
                .from(games_1.games)
                .leftJoin(gameProvider_1.game_providers, (0, drizzle_orm_1.eq)(games_1.games.providerId, gameProvider_1.game_providers.id))
                .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(games_1.games.categoryId, schema_1.dropdownOptions.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(games_1.games.id, request.gameId), (0, drizzle_orm_1.eq)(games_1.games.status, "active")))
                .limit(1);
            if (!game) {
                throw new Error("Game not found or inactive");
            }
            // Check user balance
            const userBalance = await balance_model_1.BalanceModel.calculatePlayerBalance(request.userId);
            if (userBalance.currentBalance < request.betAmount) {
                throw new Error("Insufficient balance");
            }
            // Generate session ID
            const sessionId = `game_${request.userId}_${request.gameId}_${Date.now()}`;
            // Create bet result record
            const [betResult] = await connection_1.db.insert(betResults_1.betResults).values({
                userId: Number(request.userId),
                gameId: request.gameId,
                gameSessionId: sessionId,
                betBalance: userBalance.currentBalance?.toString(),
                betAmount: request.betAmount.toString(),
                sessionToken: "", // Will be updated after token generation
                gameName: game.name,
                gameProvider: game.providerInfo
                    ? JSON.stringify(game.providerInfo)
                    : "",
                gameCategory: game.categoryInfo
                    ? JSON.stringify(game.categoryInfo)
                    : "",
                userScore: request.userScore || 0,
                ipAddress: request.ipAddress,
                deviceInfo: request.deviceInfo,
                isMobile: request.deviceType === "mobile" || request.deviceType === "tablet",
                betPlacedAt: new Date(),
                gameStartedAt: new Date(),
            });
            // Use insertId from ResultSetHeader
            const betResultId = betResult.insertId;
            if (!betResultId)
                throw new Error("Failed to create bet record");
            // Generate JWT token
            const tokenPayload = {
                userId: request.userId,
                userScore: request.userScore || 0,
                gameId: request.gameId,
                gameName: game.name,
                userName: "User", // replace with actual username if available
                betAmount: request.betAmount,
                sessionId,
            };
            const token = (0, jwt_1.generateJWT)(tokenPayload, "2h");
            // Update bet result with session token
            await connection_1.db
                .update(betResults_1.betResults)
                .set({ sessionToken: token })
                .where((0, drizzle_orm_1.eq)(betResults_1.betResults.id, betResultId));
            return {
                token,
                sessionId,
                url: `https://gsgameprovider.vercel.app?sessionId=${sessionId}&token=${token}`,
            };
        }
        catch (error) {
            console.error("Error in playGame:", error);
            throw error;
        }
    },
    async verifyGameToken(token) {
        try {
            // Verify JWT token
            const decoded = (0, jwt_1.verifyJwt)(token);
            // console.log({ decoded });
            if (!decoded) {
                throw new Error("Invalid token");
            }
            const userBalance = await balance_model_1.BalanceModel.calculatePlayerBalance(decoded.userId);
            if (userBalance.currentBalance <= 0) {
                throw new Error("Insufficient balance");
            }
            // Check if bet result exists
            const betResult = await connection_1.db
                .select()
                .from(betResults_1.betResults)
                .where((0, drizzle_orm_1.eq)(betResults_1.betResults.sessionToken, token))
                .limit(1);
            if (betResult.length === 0) {
                throw new Error("Invalid session token");
            }
            return { ...decoded, currentBalance: userBalance.currentBalance };
        }
        catch (error) {
            console.error("Error verifying game token:", error);
            return null;
        }
    },
    async updateBetResult(update) {
        try {
            // Verify token first
            const tokenData = await this.verifyGameToken(update.sessionToken);
            if (!tokenData) {
                throw new Error("Invalid session token");
            }
            // Update bet result
            const updateData = {
                betStatus: update.betStatus,
                playingStatus: "completed",
                gameCompletedAt: new Date(),
                betAmount: update.betAmount.toString(),
                updatedAt: new Date(),
            };
            if (!update.gameSessionId) {
                throw Error("Game session id is required");
            }
            if (update.betStatus === "win" && update.winAmount) {
                updateData.winAmount = update.winAmount.toString();
                updateData.multiplier = update.multiplier?.toString() || "1.0000";
            }
            else if (update.betStatus === "loss" && update.lossAmount) {
                updateData.lossAmount = update.lossAmount.toString();
            }
            // Verify the bet result record exists
            let gameResult = await connection_1.db
                .select()
                .from(betResults_1.betResults)
                .where((0, drizzle_orm_1.eq)(betResults_1.betResults.gameSessionId, update.gameSessionId))
                .limit(1)
                .then((results) => results[0]);
            gameResult && await connection_1.db.delete(betResults_1.betResults).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(betResults_1.betResults.gameSessionId, update.gameSessionId), (0, drizzle_orm_1.eq)(betResults_1.betResults.betStatus, "pending")));
            if (!gameResult) {
                // If bet result doesn't exist, try to find it by session token
                const [tokenResult] = await connection_1.db
                    .select()
                    .from(betResults_1.betResults)
                    .where((0, drizzle_orm_1.eq)(betResults_1.betResults.sessionToken, update.sessionToken))
                    .limit(1);
                if (!tokenResult) {
                    throw new Error("No bet result found for this session");
                }
                // Update the gameSessionId if it was missing
                if (!tokenResult.gameSessionId) {
                    await connection_1.db
                        .update(betResults_1.betResults)
                        .set({ gameSessionId: update.gameSessionId })
                        .where((0, drizzle_orm_1.eq)(betResults_1.betResults.sessionToken, update.sessionToken));
                }
                // Use the token result for further processing
                gameResult = tokenResult;
            }
            if (!gameResult.gameId) {
                throw new Error("Game id is not valid");
            }
            // Ensure we have a valid bet result record to update
            if (!gameResult.id) {
                throw new Error("Invalid bet result record");
            }
            // Add device tracking for audit trail
            if (update.deviceType) {
                updateData.isMobile =
                    update.deviceType === "mobile" || update.deviceType === "tablet";
            }
            if (update.ipAddress) {
                updateData.ipAddress = update.ipAddress;
            }
            console.log("Updating bet result with data:", updateData);
            console.log("Game session ID:", update.gameSessionId);
            try {
                const userBalance = await balance_model_1.BalanceModel.calculatePlayerBalance(gameResult.userId);
                console.log("Executing update query...");
                const result = await connection_1.db
                    .insert(betResults_1.betResults)
                    .values({
                    ...updateData,
                    betBalance: userBalance?.currentBalance,
                    gameId: gameResult?.gameId,
                    gameCategory: gameResult.gameCategory,
                    gameProvider: gameResult.gameProvider,
                    gameSessionId: gameResult.gameSessionId,
                    sessionToken: gameResult.sessionToken,
                    userId: gameResult.userId
                });
                const getPlayerData = await (0, user_model_1.getUserById)(gameResult.userId);
                const affiliateData = getPlayerData.referred_by_admin_user ? await (0, admin_model_1.getAdminById)(getPlayerData.referred_by_admin_user) : undefined;
                // console.log({affiliateData,getPlayerData})
                if (affiliateData && (affiliateData.role === "affiliate" || affiliateData.role === "superAffiliate")) {
                    const lossAmount = Number(update?.lossAmount || 0);
                    const winAmount = Number(update?.winAmount || 0);
                    // Calculate commission based on loss or win
                    const baseAmount = lossAmount > 0 ? lossAmount : (winAmount > 0 ? winAmount : 0);
                    if (baseAmount > 0) {
                        const affiliateCommissionPercent = Number(affiliateData?.commission_percent || 0);
                        if (affiliateData.role === "superAffiliate") {
                            // Super Affiliate: Only one commission entry with full percentage
                            const calculatedCommission = lossAmount > 0
                                ? baseAmount * (affiliateCommissionPercent / 100)
                                : -baseAmount * (affiliateCommissionPercent / 100);
                            const superAffiliateCommissionData = {
                                adminUserId: affiliateData.id,
                                playerId: gameResult.userId,
                                commissionAmount: calculatedCommission.toFixed(2),
                                status: "approved",
                                createdBy: "system",
                                betResultId: result?.[0]?.insertId,
                                percentage: affiliateCommissionPercent.toString(),
                            };
                            Number(calculatedCommission) != 0 && await commission_model_1.CommissionModel.createCommission(superAffiliateCommissionData);
                        }
                        else if (affiliateData.role === "affiliate") {
                            // Affiliate: Check if they have a super affiliate upline
                            const superAffiliateData = affiliateData.referred_by ? await (0, admin_model_1.getAdminById)(affiliateData.referred_by) : undefined;
                            console.log({ superAffiliateData });
                            if (superAffiliateData && superAffiliateData.role === "superAffiliate") {
                                const affiliateCommissionPercent = Number(affiliateData?.commission_percent || 0);
                                const superAffiliateCommissionPercent = Number(superAffiliateData?.commission_percent || 0) - Number(affiliateCommissionPercent);
                                // Calculate affiliate commission (their own percentage)
                                const affiliateCommission = lossAmount > 0
                                    ? baseAmount * (affiliateCommissionPercent / 100)
                                    : -baseAmount * (affiliateCommissionPercent / 100);
                                // Calculate super affiliate commission (their percentage from sub-affiliate)
                                const superAffiliateCommission = lossAmount > 0
                                    ? baseAmount * (superAffiliateCommissionPercent / 100)
                                    : -baseAmount * (superAffiliateCommissionPercent / 100);
                                // Create commission for affiliate
                                const affiliateCommissionData = {
                                    adminUserId: affiliateData.id,
                                    playerId: gameResult.userId,
                                    commissionAmount: affiliateCommission.toFixed(2),
                                    status: "approved",
                                    createdBy: "system",
                                    betResultId: result?.[0]?.insertId,
                                    percentage: affiliateCommissionPercent.toString(),
                                };
                                // Create commission for super affiliate
                                const superAffiliateCommissionData = {
                                    adminUserId: superAffiliateData.id,
                                    playerId: gameResult.userId,
                                    commissionAmount: superAffiliateCommission.toFixed(2),
                                    status: "approved",
                                    createdBy: "system",
                                    betResultId: result?.[0]?.insertId,
                                    percentage: superAffiliateCommissionPercent.toString(),
                                };
                                // Insert both commissions
                                affiliateCommission != 0 && await commission_model_1.CommissionModel.createCommission(affiliateCommissionData);
                                superAffiliateCommission != 0 && await commission_model_1.CommissionModel.createCommission(superAffiliateCommissionData);
                            }
                        }
                    }
                }
                // Create transaction record
                if (update.betStatus === "win" && update.winAmount) {
                    await connection_1.db.insert(transactions_1.transactions).values({
                        userId: tokenData.userId,
                        type: "win",
                        gameId: gameResult.gameId,
                        amount: update.winAmount.toString(),
                        status: "approved",
                        currencyId: 1, // Default currency, you might want to get this from user
                        createdAt: new Date(),
                    });
                }
                else if (update.betStatus === "loss" && update.lossAmount) {
                    await connection_1.db.insert(transactions_1.transactions).values({
                        userId: tokenData.userId,
                        type: "loss",
                        gameId: gameResult.gameId,
                        amount: update.lossAmount.toString(),
                        status: "approved",
                        currencyId: 1, // Default currency, you might want to get this from user
                        createdAt: new Date(),
                    });
                }
                let turnOverReduction = update.betAmount;
                const updatedBalance = userBalance.currentBalance - Number(update.lossAmount || 0);
                if (updatedBalance <= 20) {
                    await connection_1.db.update(schema_1.turnover).set({
                        status: "completed",
                        // remainingTurnover: "0"
                    }).where((0, drizzle_orm_1.eq)(schema_1.turnover.userId, gameResult.userId));
                    return false;
                }
                const getActiveTurnOver = await connection_1.db
                    .select()
                    .from(schema_1.turnover)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.turnover.userId, gameResult.userId), (0, drizzle_orm_1.eq)(schema_1.turnover.status, "active"), (0, drizzle_orm_1.gt)((0, drizzle_orm_1.sql) `CAST(${schema_1.turnover.remainingTurnover} AS DECIMAL)`, 0))).orderBy((0, drizzle_orm_1.asc)(schema_1.turnover.id));
                for (const item of getActiveTurnOver) {
                    if (turnOverReduction > 0) {
                        if (Number(item?.remainingTurnover) >= turnOverReduction) {
                            await connection_1.db
                                .update(schema_1.turnover)
                                .set({
                                remainingTurnover: (Math.max(Number(item?.remainingTurnover) - Number(turnOverReduction), 0)).toString(),
                                status: (Math.max(Number(item?.remainingTurnover) - Number(turnOverReduction), 0)) <= 0 ? "completed" : undefined
                            })
                                .where((0, drizzle_orm_1.eq)(schema_1.turnover.id, item?.id));
                            turnOverReduction = 0;
                        }
                        else {
                            await connection_1.db
                                .update(schema_1.turnover)
                                .set({
                                remainingTurnover: "0",
                                status: "completed",
                            })
                                .where((0, drizzle_orm_1.eq)(schema_1.turnover.id, item?.id));
                            turnOverReduction =
                                turnOverReduction - Number(item?.remainingTurnover);
                        }
                    }
                }
                console.log("Update result:", result);
            }
            catch (updateError) {
                console.error("Error during update:", updateError);
                console.error("Update data:", updateData);
                console.error("Game session ID:", update.gameSessionId);
                throw updateError;
            }
            return true;
        }
        catch (error) {
            console.error("Error updating bet result:", error);
            throw error;
        }
    },
    async getUserBetHistory(userId, limit = 50) {
        try {
            const result = await connection_1.db
                .select()
                .from(betResults_1.betResults)
                .where((0, drizzle_orm_1.eq)(betResults_1.betResults.userId, userId))
                .orderBy((0, drizzle_orm_1.sql) `${betResults_1.betResults.createdAt} DESC`)
                .limit(limit);
            return result;
        }
        catch (error) {
            console.error("Error fetching user bet history:", error);
            throw error;
        }
    },
    async getGameStats(gameId) {
        try {
            const result = await connection_1.db
                .select({
                totalBets: (0, drizzle_orm_1.sql) `COUNT(*)`,
                totalBetAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(${betResults_1.betResults.betAmount}), 0)`,
                totalWins: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN 1 END)`,
                totalLosses: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN 1 END)`,
                totalWinAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'win' THEN ${betResults_1.betResults.winAmount} ELSE 0 END), 0)`,
                totalLossAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CASE WHEN ${betResults_1.betResults.betStatus} = 'loss' THEN ${betResults_1.betResults.lossAmount} ELSE 0 END), 0)`,
            })
                .from(betResults_1.betResults)
                .where((0, drizzle_orm_1.eq)(betResults_1.betResults.gameId, gameId));
            return (result[0] || {
                totalBets: 0,
                totalBetAmount: 0,
                totalWins: 0,
                totalLosses: 0,
                totalWinAmount: 0,
                totalLossAmount: 0,
            });
        }
        catch (error) {
            console.error("Error fetching game stats:", error);
            throw error;
        }
    },
};
