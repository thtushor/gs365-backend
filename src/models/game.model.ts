import { eq, and, sql, isNotNull, gte, gt, asc } from "drizzle-orm";
import { db } from "../db/connection";
import { games } from "../db/schema/games";
import { game_providers } from "../db/schema/gameProvider";
import { betResults } from "../db/schema/betResults";
import { transactions } from "../db/schema/transactions";
import { BalanceModel } from "./balance.model";
import { generateJWT, verifyJwt } from "../utils/jwt";
import { dropdownOptions, turnover, users } from "../db/schema";
import { CommissionData, CommissionModel } from "./commission.model";
import { getUserById } from "./user.model";
import { getAdminById } from "./admin.model";

export interface GameWithProvider {
  id: number;
  name: string;
  status: string;
  isFavorite: boolean;
  gameLogo: string;
  gameUrl: string;
  ggrPercent: string;
  categoryInfo: any;
  providerInfo: any;
  createdAt: Date;
  provider: {
    id: number;
    name: string;
    logo: string;
    status: string;
    country: string;
  };
}

export interface PlayGameRequest {
  userId: number;
  gameId: number;
  betAmount: number;
  userScore?: number;
  ipAddress?: string;
  deviceInfo?: string;
  deviceType?: string;
  deviceName?: string;
  osVersion?: string;
  browser?: string;
  browserVersion?: string;
}

export interface GameSessionToken {
  userId: number;
  userScore: number;
  gameId: number;
  gameName: string;
  userName: string;
  betAmount: number;
  sessionId: string;
}

export interface BetResultUpdate {
  sessionToken: string;
  betStatus: "win" | "loss";
  winAmount?: number;
  lossAmount?: number;
  betAmount: number;
  gameSessionId?: string;
  multiplier?: number;
  deviceType?: string;
  ipAddress?: string;
}

export const GameModel = {
  async getAllGamesWithProvider(): Promise<GameWithProvider[]> {
    try {
      const result = await db
        .select({
          // Game fields
          id: games.id,
          name: games.name,
          status: games.status,
          isFavorite: games.isFavorite,
          isExclusive: games.isExclusive,
          gameLogo: games.gameLogo,
          gameUrl: games.gameUrl,
          ggrPercent: games.ggrPercent,
          categoryId: games.categoryId,
          providerId: games.providerId,
          createdBy: games.createdBy,
          createdAt: games.createdAt,

          // Joined info
          categoryInfo: dropdownOptions,
          providerInfo: game_providers,
        })
        .from(games)
        .leftJoin(dropdownOptions, eq(games.categoryId, dropdownOptions.id))
        .leftJoin(game_providers, eq(games.providerId, game_providers.id))
        .where(eq(games.status, "active"))
        .orderBy(games.name);

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
    } catch (error) {
      console.error("Error fetching games with provider info:", error);
      throw error;
    }
  },

  async playGame(
    request: PlayGameRequest
  ): Promise<{ token: string; sessionId: string; url: string }> {
    try {
      // Fetch game with provider and category info
      const [game] = await db
        .select({
          id: games.id,
          name: games.name,
          status: games.status,
          isFavorite: games.isFavorite,
          isExclusive: games.isExclusive,
          gameLogo: games.gameLogo,
          gameUrl: games.gameUrl,
          ggrPercent: games.ggrPercent,
          categoryId: games.categoryId,
          providerId: games.providerId,
          createdBy: games.createdBy,
          createdAt: games.createdAt,

          // Joined info
          categoryInfo: dropdownOptions,
          providerInfo: game_providers,
        })
        .from(games)
        .leftJoin(game_providers, eq(games.providerId, game_providers.id))
        .leftJoin(dropdownOptions, eq(games.categoryId, dropdownOptions.id))
        .where(and(eq(games.id, request.gameId), eq(games.status, "active")))
        .limit(1);

      if (!game) {
        throw new Error("Game not found or inactive");
      }

      // Check user balance
      const userBalance = await BalanceModel.calculatePlayerBalance(
        request.userId
      );
      if (userBalance.currentBalance < request.betAmount) {
        throw new Error("Insufficient balance");
      }

      // Generate session ID
      const sessionId = `game_${request.userId}_${request.gameId
        }_${Date.now()}`;



      // Create bet result record
      const [betResult] = await db.insert(betResults).values({
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
        isMobile:
          request.deviceType === "mobile" || request.deviceType === "tablet",
        betPlacedAt: new Date(),
        gameStartedAt: new Date(),
      });

      // Use insertId from ResultSetHeader
      const betResultId = betResult.insertId;

      if (!betResultId) throw new Error("Failed to create bet record");

      // Generate JWT token
      const tokenPayload: GameSessionToken = {
        userId: request.userId,
        userScore: request.userScore || 0,
        gameId: request.gameId,
        gameName: game.name,
        userName: "User", // replace with actual username if available
        betAmount: request.betAmount,
        sessionId,
      };

      const token = generateJWT(tokenPayload, "2h");

      // Update bet result with session token
      await db
        .update(betResults)
        .set({ sessionToken: token })
        .where(eq(betResults.id, betResultId));

      return {
        token,
        sessionId,
        url: `https://gsgameprovider.vercel.app?sessionId=${sessionId}&token=${token}`,
      };
    } catch (error) {
      console.error("Error in playGame:", error);
      throw error;
    }
  },
  async verifyGameToken(
    token: string
  ): Promise<(GameSessionToken & { currentBalance: number }) | null> {
    try {
      // Verify JWT token
      const decoded = verifyJwt(token) as GameSessionToken;

      // console.log({ decoded });

      if (!decoded) {
        throw new Error("Invalid token");
      }

      const userBalance = await BalanceModel.calculatePlayerBalance(
        decoded.userId
      );
      if (userBalance.currentBalance <= 0) {
        throw new Error("Insufficient balance");
      }

      // Check if bet result exists
      const betResult = await db
        .select()
        .from(betResults)
        .where(eq(betResults.sessionToken, token))
        .limit(1);

      if (betResult.length === 0) {
        throw new Error("Invalid session token");
      }

      return { ...decoded, currentBalance: userBalance.currentBalance };
    } catch (error) {
      console.error("Error verifying game token:", error);
      return null;
    }
  },

  async updateBetResult(update: BetResultUpdate): Promise<boolean> {
    try {
      // Verify token first
      const tokenData = await this.verifyGameToken(update.sessionToken);

      if (!tokenData) {
        throw new Error("Invalid session token");
      }

      // Update bet result
      const updateData: any = {
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
      } else if (update.betStatus === "loss" && update.lossAmount) {
        updateData.lossAmount = update.lossAmount.toString();
      }

      // Verify the bet result record exists
      let gameResult = await db
        .select()
        .from(betResults)
        .where(eq(betResults.gameSessionId, update.gameSessionId))
        .limit(1)
        .then((results) => results[0]);


      gameResult && await db.delete(betResults).where(and(eq(betResults.gameSessionId, update.gameSessionId), eq(betResults.betStatus, "pending")))


      if (!gameResult) {
        // If bet result doesn't exist, try to find it by session token
        const [tokenResult] = await db
          .select()
          .from(betResults)
          .where(eq(betResults.sessionToken, update.sessionToken))
          .limit(1);

        if (!tokenResult) {
          throw new Error("No bet result found for this session");
        }

        // Update the gameSessionId if it was missing
        if (!tokenResult.gameSessionId) {
          await db
            .update(betResults)
            .set({ gameSessionId: update.gameSessionId })
            .where(eq(betResults.sessionToken, update.sessionToken));
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
        const userBalance = await BalanceModel.calculatePlayerBalance(gameResult.userId);
        console.log("Executing update query...");
        const result = await db
          .insert(betResults)
          .values({
            ...updateData,
            betBalance: userBalance?.currentBalance,
            gameId: gameResult?.gameId,
            gameCategory: gameResult.gameCategory,
            gameProvider: gameResult.gameProvider,
            gameSessionId: gameResult.gameSessionId,
            sessionToken: gameResult.sessionToken,
            userId: gameResult.userId
          })

        const getPlayerData = await getUserById(gameResult.userId)

        const affiliateData = getPlayerData.referred_by_admin_user ? await getAdminById(getPlayerData.referred_by_admin_user) : undefined

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

              const superAffiliateCommissionData: CommissionData = {
                adminUserId: affiliateData.id,
                playerId: gameResult.userId,
                commissionAmount: Math.round(calculatedCommission).toString(),
                status: "approved",
                createdBy: "system",
                betResultId: result?.[0]?.insertId,
                percentage: affiliateCommissionPercent.toString(),
              };

              Number(calculatedCommission) != 0 && await CommissionModel.createCommission(superAffiliateCommissionData);

            } else if (affiliateData.role === "affiliate") {
              // Affiliate: Check if they have a super affiliate upline
              const superAffiliateData = affiliateData.referred_by ? await getAdminById(affiliateData.referred_by) : undefined;

              console.log({ superAffiliateData })

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
                const affiliateCommissionData: CommissionData = {
                  adminUserId: affiliateData.id,
                  playerId: gameResult.userId,
                  commissionAmount: Math.round(affiliateCommission).toString(),
                  status: "approved",
                  createdBy: "system",
                  betResultId: result?.[0]?.insertId,
                  percentage: affiliateCommissionPercent.toString(),
                };

                // Create commission for super affiliate
                const superAffiliateCommissionData: CommissionData = {
                  adminUserId: superAffiliateData.id,
                  playerId: gameResult.userId,
                  commissionAmount: Math.round(superAffiliateCommission).toString(),
                  status: "approved",
                  createdBy: "system",
                  betResultId: result?.[0]?.insertId,
                  percentage: superAffiliateCommissionPercent.toString(),
                };

                // Insert both commissions
                affiliateCommission != 0 && await CommissionModel.createCommission(affiliateCommissionData);
                superAffiliateCommission != 0 && await CommissionModel.createCommission(superAffiliateCommissionData);

              }
            }
          }
        }


        // Create transaction record
        if (update.betStatus === "win" && update.winAmount) {
          await db.insert(transactions).values({
            userId: tokenData.userId,
            type: "win",
            gameId: gameResult.gameId,
            amount: update.winAmount.toString(),
            status: "approved",
            currencyId: 1, // Default currency, you might want to get this from user
            createdAt: new Date(),
          });
        } else if (update.betStatus === "loss" && update.lossAmount) {
          await db.insert(transactions).values({
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
        const updatedBalance = userBalance.currentBalance - Number(update.lossAmount || 0)

        if (updatedBalance <= 20) {
          await db.update(turnover).set({
            status: "completed",
            // remainingTurnover: "0"
          }).where(eq(turnover.userId, gameResult.userId))
          return false;
        }


        const getActiveTurnOver = await db
          .select()
          .from(turnover)
          .where(
            and(
              eq(turnover.userId, gameResult.userId),
              eq(turnover.status, "active"),
              gt(sql`CAST(${turnover.remainingTurnover} AS DECIMAL)`, 0)
            )
          ).orderBy(asc(turnover.id));

        for (const item of getActiveTurnOver) {
          if (turnOverReduction > 0) {
            if (Number(item?.remainingTurnover) >= turnOverReduction) {
              await db
                .update(turnover)
                .set({
                  remainingTurnover: (
                    Math.max(Number(item?.remainingTurnover) - Number(turnOverReduction), 0)
                  ).toString(),
                  status: (Math.max(Number(item?.remainingTurnover) - Number(turnOverReduction), 0)) <= 0 ? "completed" : undefined
                })
                .where(eq(turnover.id, item?.id));
              turnOverReduction = 0;
            } else {
              await db
                .update(turnover)
                .set({
                  remainingTurnover: "0",
                  status: "completed",
                })
                .where(eq(turnover.id, item?.id));
              turnOverReduction =
                turnOverReduction - Number(item?.remainingTurnover);
            }
          }
        }

        console.log("Update result:", result);

        // Update user last activity
        await db
          .update(users)
          .set({ lastActivity: new Date() })
          .where(eq(users.id, gameResult.userId));

      } catch (updateError) {
        console.error("Error during update:", updateError);
        console.error("Update data:", updateData);
        console.error("Game session ID:", update.gameSessionId);
        throw updateError;
      }



      return true;
    } catch (error) {
      console.error("Error updating bet result:", error);
      throw error;
    }
  },

  async getUserBetHistory(userId: number, limit: number = 50): Promise<any[]> {
    try {
      const result = await db
        .select()
        .from(betResults)
        .where(eq(betResults.userId, userId))
        .orderBy(sql`${betResults.createdAt} DESC`)
        .limit(limit);

      return result;
    } catch (error) {
      console.error("Error fetching user bet history:", error);
      throw error;
    }
  },

  async getGameStats(gameId: number): Promise<any> {
    try {
      const result = await db
        .select({
          totalBets: sql<number>`COUNT(*)`,
          totalBetAmount: sql<number>`COALESCE(SUM(${betResults.betAmount}), 0)`,
          totalWins: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END)`,
          totalLosses: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'loss' THEN 1 END)`,
          totalWinAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`,
          totalLossAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${betResults.lossAmount} ELSE 0 END), 0)`,
        })
        .from(betResults)
        .where(eq(betResults.gameId, gameId));

      return (
        result[0] || {
          totalBets: 0,
          totalBetAmount: 0,
          totalWins: 0,
          totalLosses: 0,
          totalWinAmount: 0,
          totalLossAmount: 0,
        }
      );
    } catch (error) {
      console.error("Error fetching game stats:", error);
      throw error;
    }
  },
};
