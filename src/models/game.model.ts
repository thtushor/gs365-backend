import { eq, and, sql, isNotNull, gte } from "drizzle-orm";
import { db } from "../db/connection";
import { games } from "../db/schema/games";
import { game_providers } from "../db/schema/gameProvider";
import { betResults } from "../db/schema/betResults";
import { transactions } from "../db/schema/transactions";
import { BalanceModel } from "./balance.model";
import { generateJWT, verifyJwt } from "../utils/jwt";

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
          id: games.id,
          name: games.name,
          status: games.status,
          isFavorite: games.isFavorite,
          gameLogo: games.gameLogo,
          gameUrl: games.gameUrl,
          ggrPercent: games.ggrPercent,
          categoryInfo: games.categoryInfo,
          providerInfo: games.providerInfo,
          createdAt: games.createdAt,
          provider: {
            id: game_providers.id,
            name: game_providers.name,
            logo: game_providers.logo,
            status: game_providers.status,
            country: game_providers.country,
          },
        })
        .from(games)
        .leftJoin(game_providers, eq(games.providerInfo, sql`JSON_EXTRACT(${games.providerInfo}, '$.id')`))
        .where(eq(games.status, "active"))
        .orderBy(games.name);

      return result.map(row => ({
        ...row,
        status: row.status || "inactive" as string,
        isFavorite: row.isFavorite ?? false,
        createdAt: row.createdAt || new Date(),
        provider: row.provider ? {
          id: row.provider.id,
          name: row.provider.name,
          logo: row.provider.logo,
          status: row.provider.status || "inactive",
          country: row.provider.country,
        } : {
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

  async playGame(request: PlayGameRequest): Promise<{ token: string; sessionId: string,url:string }> {
    try {
      // Validate game exists and is active
      const game = await db
        .select()
        .from(games)
        .where(and(eq(games.id, request.gameId), eq(games.status, "active")))
        .limit(1);

      if (game.length === 0) {
        throw new Error("Game not found or inactive");
      }

      // Check user balance
      const userBalance = await BalanceModel.calculatePlayerBalance(request.userId);
      if (userBalance.currentBalance < request.betAmount) {
        throw new Error("Insufficient balance");
      }

      // Generate session ID
      const sessionId = `game_${request.userId}_${request.gameId}_${Date.now()}`;

      // Create bet result record
      const [betResult] = await db
        .insert(betResults)
        .values({
          userId: request.userId,
          gameId: request.gameId,
          gameSessionId: sessionId,
          betAmount: request.betAmount.toString(),
          sessionToken: "", // Will be updated after token generation
          gameName: game[0].name,
          gameProvider: game[0].providerInfo ? JSON.stringify(game[0].providerInfo) : "",
          gameCategory: game[0].categoryInfo ? JSON.stringify(game[0].categoryInfo) : "",
          userScore: request.userScore || 0,
          ipAddress: request.ipAddress,
          deviceInfo: request.deviceInfo,
          isMobile: request.deviceType === "mobile" || request.deviceType === "tablet",
          betPlacedAt: new Date(),
          gameStartedAt: new Date(),
        });

      // Generate JWT token
      const tokenPayload: GameSessionToken = {
        userId: request.userId,
        userScore: request.userScore || 0,
        gameId: request.gameId,
        gameName: game[0].name,
        userName: "User", // You might want to get this from user table
        betAmount: request.betAmount,
        sessionId
      };

      const token = generateJWT(tokenPayload, "2h");

      // Update bet result with session token

      await db
        .update(betResults)
        .set({ sessionToken: token })
        .where(eq(betResults.id, betResult?.insertId));

      return { token, sessionId, url: `https://gsgameprovider.vercel.app?sessionId=${sessionId}&token=${token}` };
    } catch (error) {
      console.error("Error in playGame:", error);
      throw error;
    }
  },

  async verifyGameToken(token: string): Promise<GameSessionToken & {currentBalance: number} | null> {
    try {
      // Verify JWT token
      const decoded = verifyJwt(token) as GameSessionToken;

      console.log({decoded})

      if(!decoded){
        throw new Error("Invalid token")
      }

      const userBalance = await BalanceModel.calculatePlayerBalance(decoded.userId);
      if (userBalance.currentBalance<=0) {
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

      return {...decoded,currentBalance: userBalance.currentBalance};
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
        updatedAt: new Date(),
      };



      if(!update.gameSessionId){
        throw Error("Game session id is required")
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
        .then(results => results[0]);

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
        updateData.isMobile = update.deviceType === "mobile" || update.deviceType === "tablet";
      }
      
      if (update.ipAddress) {
        updateData.ipAddress = update.ipAddress;
      }

      console.log("Updating bet result with data:", updateData);
      console.log("Game session ID:", update.gameSessionId);
      
      try {
        console.log("Executing update query...");
        const result = await db
          .update(betResults)
          .set(updateData)
          .where(eq(betResults.gameSessionId, update.gameSessionId));
        
        console.log("Update result:", result);
      } catch (updateError) {
        console.error("Error during update:", updateError);
        console.error("Update data:", updateData);
        console.error("Game session ID:", update.gameSessionId);
        throw updateError;
      }

      
      

      // Create transaction record
      if (update.betStatus === "win" && update.winAmount) {
        await db.insert(transactions).values({
          userId: tokenData.userId,
          type: "win",
          gameId:gameResult.gameId,
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

      return result[0] || {
        totalBets: 0,
        totalBetAmount: 0,
        totalWins: 0,
        totalLosses: 0,
        totalWinAmount: 0,
        totalLossAmount: 0,
      };
    } catch (error) {
      console.error("Error fetching game stats:", error);
      throw error;
    }
  },
};
