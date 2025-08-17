import { eq, and, sql, desc, asc, like, gte, lte, inArray } from "drizzle-orm";
import { db } from "../db/connection";
import { betResults } from "../db/schema/betResults";
import { games } from "../db/schema/games";
import { game_providers } from "../db/schema/gameProvider";

export interface BetResultFilters {
  userId?: number;
  gameId?: number;
  betStatus?: ("win" | "loss" | "pending" | "cancelled")[];
  playingStatus?: ("playing" | "completed" | "abandoned")[];
  dateFrom?: Date;
  dateTo?: Date;
  minBetAmount?: number;
  maxBetAmount?: number;
  gameName?: string;
  providerName?: string;
  isMobile?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'betAmount' | 'userScore' | 'betPlacedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface BetResultWithDetails {
  id: number;
  userId: number;
  gameId: number;
  betAmount: string;
  betStatus: string;
  playingStatus: string;
  sessionToken: string;
  gameSessionId: string | null;
  winAmount: string;
  lossAmount: string;
  multiplier: string;
  gameName: string;
  gameProvider: string;
  gameCategory: string;
  userScore: number;
  userLevel: string;
  betPlacedAt: Date;
  gameStartedAt: Date | null;
  gameCompletedAt: Date | null;
  ipAddress: string | null;
  deviceInfo: string | null;
  isMobile: boolean;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Additional joined data
  gameDetails?: {
    id: number;
    name: string;
    gameLogo: string;
    gameUrl: string;
    status: string;
  };
  providerDetails?: {
    id: number;
    name: string;
    logo: string;
    status: string;
    country: string;
  };
}

export const BetResultModel = {
  async getBetResultsWithFilters(filters: BetResultFilters): Promise<{
    data: BetResultWithDetails[];
    total: number;
    filters: BetResultFilters;
  }> {
    try {
      const {
        userId,
        gameId,
        betStatus,
        playingStatus,
        dateFrom,
        dateTo,
        minBetAmount,
        maxBetAmount,
        gameName,
        providerName,
        isMobile,
        limit = 50,
        offset = 0,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = filters;

      // Build where conditions
      const whereConditions = [];

      if (userId) {
        whereConditions.push(eq(betResults.userId, userId));
      }

      if (gameId) {
        whereConditions.push(eq(betResults.gameId, gameId));
      }

      if (betStatus && betStatus.length > 0) {
        whereConditions.push(inArray(betResults.betStatus, betStatus as ("win" | "loss" | "pending" | "cancelled")[]));
      }

      if (playingStatus && playingStatus.length > 0) {
        whereConditions.push(inArray(betResults.playingStatus, playingStatus as ("playing" | "completed" | "abandoned")[]));
      }

      if (dateFrom) {
        whereConditions.push(gte(betResults.createdAt, dateFrom));
      }

      if (dateTo) {
        whereConditions.push(lte(betResults.createdAt, dateTo));
      }

      if (minBetAmount) {
        whereConditions.push(gte(betResults.betAmount, minBetAmount.toString()));
      }

      if (maxBetAmount) {
        whereConditions.push(lte(betResults.betAmount, maxBetAmount.toString()));
      }

      if (gameName) {
        whereConditions.push(like(betResults.gameName, `%${gameName}%`));
      }

      if (providerName) {
        whereConditions.push(like(betResults.gameProvider, `%${providerName}%`));
      }

      if (isMobile !== undefined) {
        whereConditions.push(eq(betResults.isMobile, isMobile));
      }

      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(betResults);

      if (whereConditions.length > 0) {
        countQuery.where(and(...whereConditions));
      }

      const totalResult = await countQuery;
      const total = totalResult[0]?.count || 0;

      
      // Apply sorting
      const sortField = sortBy === 'betAmount' ? betResults.betAmount :
                       sortBy === 'userScore' ? betResults.userScore :
                       sortBy === 'betPlacedAt' ? betResults.betPlacedAt :
                       betResults.createdAt;

      // Build main query with joins
      let query = db
        .select({
          id: betResults.id,
          userId: betResults.userId,
          gameId: betResults.gameId,
          betAmount: betResults.betAmount,
          betStatus: betResults.betStatus,
          playingStatus: betResults.playingStatus,
          sessionToken: betResults.sessionToken,
          gameSessionId: betResults.gameSessionId,
          winAmount: betResults.winAmount,
          lossAmount: betResults.lossAmount,
          multiplier: betResults.multiplier,
          gameName: betResults.gameName,
          gameProvider: betResults.gameProvider,
          gameCategory: betResults.gameCategory,
          userScore: betResults.userScore,
          userLevel: betResults.userLevel,
          betPlacedAt: betResults.betPlacedAt,
          gameStartedAt: betResults.gameStartedAt,
          gameCompletedAt: betResults.gameCompletedAt,
          ipAddress: betResults.ipAddress,
          deviceInfo: betResults.deviceInfo,
          isMobile: betResults.isMobile,
          createdBy: betResults.createdBy,
          updatedBy: betResults.updatedBy,
          createdAt: betResults.createdAt,
          updatedAt: betResults.updatedAt,
          // Game details
          gameId_join: games.id,
          gameName_join: games.name,
          gameLogo: games.gameLogo,
          gameUrl: games.gameUrl,
          gameStatus: games.status,
          // Provider details
          providerId: game_providers.id,
          providerName: game_providers.name,
          providerLogo: game_providers.logo,
          providerStatus: game_providers.status,
          providerCountry: game_providers.country,
        })
        .from(betResults)
        .leftJoin(games, eq(betResults.gameId, games.id))
        .leftJoin(game_providers, eq(games.providerInfo, sql`JSON_EXTRACT(${games.providerInfo}, '$.id')`))
        .where(and(...whereConditions))
        .orderBy(sortOrder === 'asc' ? asc(sortField) : desc(sortField))
        .limit(limit).offset(offset);
      


    

      // Apply pagination
      

      const results = await query;

      // Transform results to include parsed provider info and structured data
      const transformedResults: BetResultWithDetails[] = results.map(row => {
        // Parse provider info from JSON if available
        let parsedProviderInfo = null;
        if (row.gameProvider) {
          try {
            parsedProviderInfo = JSON.parse(row.gameProvider);
          } catch (error) {
            console.warn('Failed to parse provider info JSON:', row.gameProvider);
          }
        }

        return {
          id: row.id,
          userId: row.userId,
          gameId: row.gameId,
          betAmount: row.betAmount || '',
          betStatus: row.betStatus || '',
          playingStatus: row.playingStatus || '',
          sessionToken: row.sessionToken || '',
          gameSessionId: row.gameSessionId,
          winAmount: row.winAmount || '',
          lossAmount: row.lossAmount || '',
          multiplier: row.multiplier || '',
          gameName: row.gameName || '',
          gameProvider: row.gameProvider || '',
          gameCategory: row.gameCategory || '',
          userScore: row.userScore || 0,
          userLevel: row.userLevel || '',
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
          gameDetails: row.gameId_join ? {
            id: row.gameId_join,
            name: row.gameName_join || row.gameName || '',
            gameLogo: row.gameLogo || '',
            gameUrl: row.gameUrl || '',
            status: row.gameStatus || 'unknown',
          } : undefined,
          providerDetails: row.providerId ? {
            id: row.providerId,
            name: row.providerName || 'Unknown Provider',
            logo: row.providerLogo || '',
            status: row.providerStatus || 'unknown',
            country: row.providerCountry || 'Unknown',
          } : undefined,
        };
      });

      return {
        data: transformedResults,
        total,
        filters,
      };
    } catch (error) {
      console.error("Error fetching bet results with filters:", error);
      throw error;
    }
  },

  async getBetResultById(id: number): Promise<BetResultWithDetails | null> {
    try {
      const result = await db
        .select({
          id: betResults.id,
          userId: betResults.userId,
          gameId: betResults.gameId,
          betAmount: betResults.betAmount,
          betStatus: betResults.betStatus,
          playingStatus: betResults.playingStatus,
          sessionToken: betResults.sessionToken,
          gameSessionId: betResults.gameSessionId,
          winAmount: betResults.winAmount,
          lossAmount: betResults.lossAmount,
          multiplier: betResults.multiplier,
          gameName: betResults.gameName,
          gameProvider: betResults.gameProvider,
          gameCategory: betResults.gameCategory,
          userScore: betResults.userScore,
          userLevel: betResults.userLevel,
          betPlacedAt: betResults.betPlacedAt,
          gameStartedAt: betResults.gameStartedAt,
          gameCompletedAt: betResults.gameCompletedAt,
          ipAddress: betResults.ipAddress,
          deviceInfo: betResults.deviceInfo,
          isMobile: betResults.isMobile,
          createdBy: betResults.createdBy,
          updatedBy: betResults.updatedBy,
          createdAt: betResults.createdAt,
          updatedAt: betResults.updatedAt,
          // Game details
          gameId_join: games.id,
          gameName_join: games.name,
          gameLogo: games.gameLogo,
          gameUrl: games.gameUrl,
          gameStatus: games.status,
          // Provider details
          providerId: game_providers.id,
          providerName: game_providers.name,
          providerLogo: game_providers.logo,
          providerStatus: game_providers.status,
          providerCountry: game_providers.country,
        })
        .from(betResults)
        .leftJoin(games, eq(betResults.gameId, games.id))
        .leftJoin(game_providers, eq(games.providerInfo, sql`JSON_EXTRACT(${games.providerInfo}, '$.id')`))
        .where(eq(betResults.id, id))
        .limit(1);

      if (result.length === 0) {
        return null;
      }

      const row = result[0];

      return {
        id: row.id,
        userId: row.userId,
        gameId: row.gameId,
        betAmount: row.betAmount || '',
        betStatus: row.betStatus || '',
        playingStatus: row.playingStatus || '',
        sessionToken: row.sessionToken || '',
        gameSessionId: row.gameSessionId,
        winAmount: row.winAmount || '',
        lossAmount: row.lossAmount || '',
        multiplier: row.multiplier || '',
        gameName: row.gameName || '',
        gameProvider: row.gameProvider || '',
        gameCategory: row.gameCategory || '',
        userScore: row.userScore || 0,
        userLevel: row.userLevel || '',
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
        gameDetails: row.gameId_join ? {
          id: row.gameId_join,
          name: row.gameName_join || row.gameName || '',
          gameLogo: row.gameLogo || '',
          gameUrl: row.gameUrl || '',
          status: row.gameStatus || 'unknown',
        } : undefined,
        providerDetails: row.providerId ? {
          id: row.providerId,
          name: row.providerName || 'Unknown Provider',
          logo: row.providerLogo || '',
          status: row.providerStatus || 'unknown',
          country: row.providerCountry || 'Unknown',
        } : undefined,
      };
    } catch (error) {
      console.error("Error fetching bet result by ID:", error);
      throw error;
    }
  },

  async getBetResultStats(filters?: Omit<BetResultFilters, 'limit' | 'offset' | 'sortBy' | 'sortOrder'>): Promise<{
    totalBets: number;
    totalBetAmount: number;
    totalWins: number;
    totalLosses: number;
    totalWinAmount: number;
    totalLossAmount: number;
    averageBetAmount: number;
    winRate: number;
  }> {
    try {
      const whereConditions = [];

      if (filters?.userId) {
        whereConditions.push(eq(betResults.userId, filters.userId));
      }

      if (filters?.gameId) {
        whereConditions.push(eq(betResults.gameId, filters.gameId));
      }

      if (filters?.betStatus && filters.betStatus.length > 0) {
        whereConditions.push(inArray(betResults.betStatus, filters.betStatus as ("win" | "loss" | "pending" | "cancelled")[]));
      }

      if (filters?.dateFrom) {
        whereConditions.push(gte(betResults.createdAt, filters.dateFrom));
      }

      if (filters?.dateTo) {
        whereConditions.push(lte(betResults.createdAt, filters.dateTo));
      }

      const query = db
        .select({
          totalBets: sql<number>`COUNT(*)`,
          totalBetAmount: sql<number>`COALESCE(SUM(${betResults.betAmount}), 0)`,
          totalWins: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END)`,
          totalLosses: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'loss' THEN 1 END)`,
          totalWinAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`,
          totalLossAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${betResults.lossAmount} ELSE 0 END), 0)`,
        })
        .from(betResults);

      if (whereConditions.length > 0) {
        query.where(and(...whereConditions));
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
    } catch (error) {
      console.error("Error fetching bet result stats:", error);
      throw error;
    }
  },
};

