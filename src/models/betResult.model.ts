import { eq, and, sql, desc, asc, like, gte, lte, inArray } from "drizzle-orm";
import { db } from "../db/connection";
import { betResults } from "../db/schema/betResults";
import { games } from "../db/schema/games";
import { game_providers } from "../db/schema/gameProvider";
import { dropdownOptions, users } from "../db/schema";
import { BalanceModel } from "./balance.model";

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
  sortBy?: "createdAt" | "betAmount" | "userScore" | "betPlacedAt";
  sortOrder?: "asc" | "desc";
}

// NEW: Player ranking interfaces
export interface PlayerRankingFilters {
  rankBy:
    | "totalWins"
    | "totalWinAmount"
    | "winRate"
    | "totalProfit"
    | "totalBets"
    | "avgBetAmount";
  sortOrder: "asc" | "desc";
  limit: number;
  offset: number;
  dateFrom?: Date;
  dateTo?: Date;
  gameId?: number;
  userId?: number;
  minGames: number;
  includeStats: boolean;
}

export interface PlayerRankingData {
  userId: number;
  rank: number;
  totalBets: number;
  totalWins: number;
  totalLosses: number;
  totalWinAmount: number;
  totalLossAmount: number;
  totalBetAmount: number;
  winRate: number;
  totalProfit: number;
  avgBetAmount: number;
  lastPlayed: Date;
  stats?: {
    gamesPlayed: string[];
    favoriteGame: string;
    bestWin: number;
    worstLoss: number;
  };
}

export interface TopPlayersFilters {
  limit: number;
  offset: number;
  dateFrom?: Date;
  dateTo?: Date;
  gameId?: number;
  minGames: number;
}

export interface PlayerPerformanceFilters {
  userId: number;
  dateFrom?: Date;
  dateTo?: Date;
  gameId?: number;
  groupBy: "day" | "week" | "month" | "game";
}

export interface GamePerformanceFilters {
  gameId: number;
  dateFrom?: Date;
  dateTo?: Date;
  groupBy: "day" | "week" | "month" | "user";
}

export interface DashboardStatsFilters {
  dateFrom?: Date;
  dateTo?: Date;
  gameId?: number;
  userId?: number;
}

// NEW: Game-wise statistics interface
export interface GameWiseStatsFilters {
  dateFrom?: Date;
  dateTo?: Date;
  gameId?: number;
  gameName?: string;
  providerId?: number;
  categoryId?: number;
  userId?: number;
  status?: string;
  limit?: number;
  offset?: number;
  sortBy?:
    | "totalBets"
    | "totalBetAmount"
    | "totalWinAmount"
    | "totalLossAmount"
    | "totalPlayers"
    | "winRate";
  sortOrder?: "asc" | "desc";
}

export interface GameWiseStatsData {
  gameId: number;
  gameName: string;
  gameLogo: string;
  gameUrl: string;
  gameStatus: string;
  categoryId?: number | null;
  categoryTitle?: string | null;
  categoryImgUrl?: string | null;
  providerId?: number | null;
  providerName?: string;
  providerLogo?: string;
  providerCountry?: string;

  // Statistics
  totalBets: number;
  totalBetAmount: number;
  totalWinAmount: number;
  totalLossAmount: number;
  totalPendingBets: number;
  totalPlayersPlayed: number;
  winRate: number;
  averageBetAmount: number;
  totalProfit: number;

  // Recent activity
  lastBetPlaced?: Date;
  lastWinAmount?: number;
  lastLossAmount?: number;

  // Player distribution
  uniquePlayersToday?: number;
  uniquePlayersThisWeek?: number;
  uniquePlayersThisMonth?: number;
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
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      console.log({filters})

      // Build where conditions
      const whereConditions = [];

      if (userId) {
        whereConditions.push(eq(betResults.userId, Number(userId)));
      }

      if (gameId) {
        whereConditions.push(eq(betResults.gameId, gameId));
      }

      if (betStatus && betStatus.length > 0) {
        whereConditions.push(
          inArray(
            betResults.betStatus,
            betStatus as ("win" | "loss" | "pending" | "cancelled")[]
          )
        );
      }

      if (playingStatus && playingStatus.length > 0) {
        whereConditions.push(
          inArray(
            betResults.playingStatus,
            playingStatus as ("playing" | "completed" | "abandoned")[]
          )
        );
      }

      if (dateFrom) {
        whereConditions.push(gte(betResults.createdAt, dateFrom));
      }

      if (dateTo) {
        whereConditions.push(lte(betResults.createdAt, dateTo));
      }

      if (minBetAmount) {
        whereConditions.push(
          gte(betResults.betAmount, minBetAmount.toString())
        );
      }

      if (maxBetAmount) {
        whereConditions.push(
          lte(betResults.betAmount, maxBetAmount.toString())
        );
      }

      if (gameName) {
        whereConditions.push(like(betResults.gameName, `%${gameName}%`));
      }

      if (providerName) {
        whereConditions.push(
          like(betResults.gameProvider, `%${providerName}%`)
        );
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
      const sortField =
        sortBy === "betAmount"
          ? betResults.betAmount
          : sortBy === "userScore"
          ? betResults.userScore
          : sortBy === "betPlacedAt"
          ? betResults.betPlacedAt
          : betResults.createdAt;

      // Build main query with joins
      let query = db
        .select({
          id: betResults.id,
          user: users,
          userId: betResults.userId,
          gameId: betResults.gameId,
          betAmount: betResults.betAmount,
          betBalance: betResults.betBalance,
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
        .leftJoin(users, eq(betResults.userId, users.id))
        .leftJoin(games, eq(betResults.gameId, games.id))
        .leftJoin(game_providers, eq(games.providerId, game_providers.id)) // ✅ changed here
        .where(and(...whereConditions))
        .orderBy(sortOrder === "asc" ? asc(sortField) : desc(sortField))
        .limit(limit)
        .offset(offset);

      // Apply pagination

      const results = await query;

      // Transform results to include parsed provider info and structured data
      const transformedResults: BetResultWithDetails[] = await Promise.all(
        results.map(async (row) => {
          // Parse provider info from JSON if available
          let parsedProviderInfo = null;
          if (row.gameProvider) {
            try {
              parsedProviderInfo = JSON.parse(row.gameProvider);
            } catch (error) {
              console.warn(
                "Failed to parse provider info JSON:",
                row.gameProvider
              );
            }
          }

          const userBalance = await BalanceModel.calculatePlayerBalance(
            row.userId
          );

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
        })
      );

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

          // Category details
          categoryId_join: dropdownOptions.id,
          categoryTitle: dropdownOptions.title,
          categoryImgUrl: dropdownOptions.imgUrl,
          categoryStatus: dropdownOptions.status,
        })
        .from(betResults)
        .leftJoin(games, eq(betResults.gameId, games.id))
        .leftJoin(game_providers, eq(games.providerId, game_providers.id)) // ✅ use providerId now
        .leftJoin(dropdownOptions, eq(games.categoryId, dropdownOptions.id)) // ✅ join category
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
    } catch (error) {
      console.error("Error fetching bet result by ID:", error);
      throw error;
    }
  },

  async getBetResultStats(
    filters?: Omit<
      BetResultFilters,
      "limit" | "offset" | "sortBy" | "sortOrder"
    >
  ): Promise<{
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
        whereConditions.push(
          inArray(
            betResults.betStatus,
            filters.betStatus as ("win" | "loss" | "pending" | "cancelled")[]
          )
        );
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

  // NEW: Get player rankings/leaderboard
  async getPlayerRankings(filters: PlayerRankingFilters): Promise<{
    data: PlayerRankingData[];
    total: number;
  }> {
    try {
      const whereConditions = [];

      if (filters.dateFrom) {
        whereConditions.push(gte(betResults.createdAt, filters.dateFrom));
      }

      if (filters.dateTo) {
        whereConditions.push(lte(betResults.createdAt, filters.dateTo));
      }

      if (filters.gameId) {
        whereConditions.push(eq(betResults.gameId, filters.gameId));
      }

      if (filters.userId) {
        whereConditions.push(eq(betResults.userId, filters.userId));
      }

      // Build order-by expression based on rankBy parameter (use raw expressions, not aliases)
      let orderByExpr: any;
      switch (filters.rankBy) {
        case "totalWins":
          orderByExpr = sql`COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END)`;
          break;
        case "totalWinAmount":
          orderByExpr = sql`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`;
          break;
        case "winRate":
          orderByExpr = sql`(COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END) / NULLIF(COUNT(*), 0))`;
          break;
        case "totalProfit":
          orderByExpr = sql`(COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0) - COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${betResults.lossAmount} ELSE 0 END), 0))`;
          break;
        case "totalBets":
          orderByExpr = sql`COUNT(*)`;
          break;
        case "avgBetAmount":
          orderByExpr = sql`COALESCE(AVG(${betResults.betAmount}), 0)`;
          break;
        default:
          orderByExpr = sql`COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END)`;
      }

      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`COUNT(DISTINCT ${betResults.userId})` })
        .from(betResults);

      if (whereConditions.length > 0) {
        countQuery.where(and(...whereConditions));
      }

      const totalResult = await countQuery;
      const total = totalResult[0]?.count || 0;

      // Main ranking query
      const results = await db
        .select({
          userId: betResults?.userId,
          // user: users,
          // game: games,
          // provider: game_providers,
          totalBets: sql<number>`COUNT(*)`,
          totalWins: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END)`,
          totalLosses: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'loss' THEN 1 END)`,
          totalWinAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`,
          totalLossAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${betResults.lossAmount} ELSE 0 END), 0)`,
          totalBetAmount: sql<number>`COALESCE(SUM(${betResults.betAmount}), 0)`,
          lastPlayed: sql<Date>`MAX(${betResults.createdAt})`,
        })
        .from(betResults)
        // .leftJoin(users, eq(betResults.userId, users.id))
        // .leftJoin(games, eq(betResults.gameId, games.id))
        // .leftJoin(game_providers, eq(games.providerId, game_providers.id))
        .where(and(...whereConditions))
        .groupBy(betResults.userId)
        .having(sql`COUNT(*) >= ${filters.minGames}`)
        .orderBy(
          filters.sortOrder === "desc" ? desc(orderByExpr) : asc(orderByExpr)
        )
        .limit(filters.limit)
        .offset(filters.offset);

      // Transform results and add calculated fields
      const rankings: PlayerRankingData[] = await Promise.all(
        results.map(async (row, index) => {
          const totalBets = row.totalBets || 0;
          const totalWins = row.totalWins || 0;
          const totalLosses = row.totalLosses || 0;
          const totalWinAmount = Number(row.totalWinAmount) || 0;
          const totalLossAmount = Number(row.totalLossAmount) || 0;
          const totalBetAmount = Number(row.totalBetAmount) || 0;
          const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;
          const totalProfit = totalWinAmount - totalLossAmount;
          const avgBetAmount = totalBets > 0 ? totalBetAmount / totalBets : 0;

          const [userData] = await db
            .select()
            .from(users)
            .where(eq(users?.id, row?.userId));

          const userBalance = await BalanceModel.calculatePlayerBalance(
            row?.userId,
            userData?.currency_id!
          );

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
        })
      );

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
    } catch (error) {
      console.error("Error fetching player rankings:", error);
      throw error;
    }
  },

  // NEW: Get top winners leaderboard
  async getTopWinners(filters: TopPlayersFilters): Promise<{
    data: PlayerRankingData[];
    total: number;
  }> {
    try {
      const whereConditions = [];

      if (filters.dateFrom) {
        whereConditions.push(gte(betResults.createdAt, filters.dateFrom));
      }

      if (filters.dateTo) {
        whereConditions.push(lte(betResults.createdAt, filters.dateTo));
      }

      if (filters.gameId) {
        whereConditions.push(eq(betResults.gameId, filters.gameId));
      }

      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`COUNT(DISTINCT ${betResults.userId})` })
        .from(betResults);

      if (whereConditions.length > 0) {
        countQuery.where(and(...whereConditions));
      }

      const totalResult = await countQuery;
      const total = totalResult[0]?.count || 0;

      // Get top winners by total win amount
      const winnersBase = db
        .select({
          userId: betResults.userId,
          totalBets: sql<number>`COUNT(*)`,
          totalWins: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END)`,
          totalLosses: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'loss' THEN 1 END)`,
          totalWinAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`,
          totalLossAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${betResults.lossAmount} ELSE 0 END), 0)`,
          totalBetAmount: sql<number>`COALESCE(SUM(${betResults.betAmount}), 0)`,
          lastPlayed: sql<Date>`MAX(${betResults.createdAt})`,
        })
        .from(betResults);

      const winnersQuery = (
        whereConditions.length > 0
          ? winnersBase.where(and(...whereConditions))
          : winnersBase
      )
        .groupBy(betResults.userId)
        .having(sql`COUNT(*) >= ${filters.minGames}`)
        .orderBy(
          desc(
            sql`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`
          )
        )
        .limit(filters.limit)
        .offset(filters.offset);

      const results = await winnersQuery;

      // Transform results
      const winners: PlayerRankingData[] = results.map((row, index) => {
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
    } catch (error) {
      console.error("Error fetching top winners:", error);
      throw error;
    }
  },

  // NEW: Get top losers leaderboard
  async getTopLosers(filters: TopPlayersFilters): Promise<{
    data: PlayerRankingData[];
    total: number;
  }> {
    try {
      const whereConditions = [];

      if (filters.dateFrom) {
        whereConditions.push(gte(betResults.createdAt, filters.dateFrom));
      }

      if (filters.dateTo) {
        whereConditions.push(lte(betResults.createdAt, filters.dateTo));
      }

      if (filters.gameId) {
        whereConditions.push(eq(betResults.gameId, filters.gameId));
      }

      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`COUNT(DISTINCT ${betResults.userId})` })
        .from(betResults);

      if (whereConditions.length > 0) {
        countQuery.where(and(...whereConditions));
      }

      const totalResult = await countQuery;
      const total = totalResult[0]?.count || 0;

      // Get top losers by total loss amount
      const losersBase = db
        .select({
          userId: betResults.userId,
          totalBets: sql<number>`COUNT(*)`,
          totalWins: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END)`,
          totalLosses: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'loss' THEN 1 END)`,
          totalWinAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`,
          totalLossAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${betResults.lossAmount} ELSE 0 END), 0)`,
          totalBetAmount: sql<number>`COALESCE(SUM(${betResults.betAmount}), 0)`,
          lastPlayed: sql<Date>`MAX(${betResults.createdAt})`,
        })
        .from(betResults);

      const losersQuery = (
        whereConditions.length > 0
          ? losersBase.where(and(...whereConditions))
          : losersBase
      )
        .groupBy(betResults.userId)
        .having(sql`COUNT(*) >= ${filters.minGames}`)
        .orderBy(
          desc(
            sql`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${betResults.lossAmount} ELSE 0 END), 0)`
          )
        )
        .limit(filters.limit)
        .offset(filters.offset);

      const results = await losersQuery;

      // Transform results
      const losers: PlayerRankingData[] = results.map((row, index) => {
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
    } catch (error) {
      console.error("Error fetching top losers:", error);
      throw error;
    }
  },

  // NEW: Get player performance analytics
  async getPlayerPerformance(filters: PlayerPerformanceFilters): Promise<any> {
    try {
      const whereConditions = [eq(betResults.userId, filters.userId)];

      if (filters.dateFrom) {
        whereConditions.push(gte(betResults.createdAt, filters.dateFrom));
      }

      if (filters.dateTo) {
        whereConditions.push(lte(betResults.createdAt, filters.dateTo));
      }

      if (filters.gameId) {
        whereConditions.push(eq(betResults.gameId, filters.gameId));
      }

      let groupByField: any;
      let dateFormat: string;

      switch (filters.groupBy) {
        case "day":
          groupByField = sql`DATE(${betResults.createdAt})`;
          dateFormat = "YYYY-MM-DD";
          break;
        case "week":
          groupByField = sql`YEARWEEK(${betResults.createdAt})`;
          dateFormat = "YYYY-WW";
          break;
        case "month":
          groupByField = sql`DATE_FORMAT(${betResults.createdAt}, '%Y-%m')`;
          dateFormat = "YYYY-MM";
          break;
        case "game":
          groupByField = betResults.gameId;
          dateFormat = "game";
          break;
        default:
          groupByField = sql`DATE(${betResults.createdAt})`;
          dateFormat = "YYYY-MM-DD";
      }

      const performanceQuery = db
        .select({
          period: groupByField,
          totalBets: sql<number>`COUNT(*)`,
          totalWins: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END)`,
          totalLosses: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'loss' THEN 1 END)`,
          totalWinAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`,
          totalLossAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${betResults.lossAmount} ELSE 0 END), 0)`,
          totalBetAmount: sql<number>`COALESCE(SUM(${betResults.betAmount}), 0)`,
          avgBetAmount: sql<number>`COALESCE(AVG(${betResults.betAmount}), 0)`,
        })
        .from(betResults)
        .where(and(...whereConditions))
        .groupBy(groupByField)
        .orderBy(asc(groupByField));

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
          winRate:
            row.totalBets > 0
              ? Math.round((row.totalWins / row.totalBets) * 10000) / 100
              : 0,
          totalProfit: Number(row.totalWinAmount) - Number(row.totalLossAmount),
        })),
      };
    } catch (error) {
      console.error("Error fetching player performance:", error);
      throw error;
    }
  },

  // NEW: Get game performance analytics
  async getGamePerformance(filters: GamePerformanceFilters): Promise<any> {
    try {
      const whereConditions = [eq(betResults.gameId, filters.gameId)];

      if (filters.dateFrom) {
        whereConditions.push(gte(betResults.createdAt, filters.dateFrom));
      }

      if (filters.dateTo) {
        whereConditions.push(lte(betResults.createdAt, filters.dateTo));
      }

      let groupByField: any;
      let periodFormat: string;

      switch (filters.groupBy) {
        case "day":
          groupByField = sql`DATE(${betResults.createdAt})`;
          periodFormat = "YYYY-MM-DD";
          break;
        case "week":
          groupByField = sql`YEARWEEK(${betResults.createdAt})`;
          periodFormat = "YYYY-WW";
          break;
        case "month":
          groupByField = sql`DATE_FORMAT(${betResults.createdAt}, '%Y-%m')`;
          periodFormat = "YYYY-MM";
          break;
        case "user":
          groupByField = betResults.userId;
          periodFormat = "user";
          break;
        default:
          groupByField = sql`DATE(${betResults.createdAt})`;
          periodFormat = "YYYY-MM-DD";
      }

      const performanceQuery = db
        .select({
          period: groupByField,
          totalBets: sql<number>`COUNT(*)`,
          totalWins: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END)`,
          totalLosses: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'loss' THEN 1 END)`,
          totalWinAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`,
          totalLossAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${betResults.lossAmount} ELSE 0 END), 0)`,
          totalBetAmount: sql<number>`COALESCE(SUM(${betResults.betAmount}), 0)`,
          uniquePlayers: sql<number>`COUNT(DISTINCT ${betResults.userId})`,
        })
        .from(betResults)
        .where(and(...whereConditions))
        .groupBy(groupByField)
        .orderBy(asc(groupByField));

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
          winRate:
            row.totalBets > 0
              ? Math.round((row.totalWins / row.totalBets) * 10000) / 100
              : 0,
          totalProfit: Number(row.totalWinAmount) - Number(row.totalLossAmount),
        })),
      };
    } catch (error) {
      console.error("Error fetching game performance:", error);
      throw error;
    }
  },

  // NEW: Get comprehensive dashboard stats
  async getDashboardStats(filters: DashboardStatsFilters): Promise<any> {
    try {
      const whereConditions = [];

      if (filters.dateFrom) {
        whereConditions.push(gte(betResults.createdAt, filters.dateFrom));
      }

      if (filters.dateTo) {
        whereConditions.push(lte(betResults.createdAt, filters.dateTo));
      }

      if (filters.gameId) {
        whereConditions.push(eq(betResults.gameId, filters.gameId));
      }

      if (filters.userId) {
        whereConditions.push(eq(betResults.userId, filters.userId));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Overall stats
      const overallStats = await db
        .select({
          totalBets: sql<number>`COUNT(*)`,
          totalBetAmount: sql<number>`COALESCE(SUM(${betResults.betAmount}), 0)`,
          totalWins: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END)`,
          totalLosses: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'loss' THEN 1 END)`,
          totalWinAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`,
          totalLossAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${betResults.lossAmount} ELSE 0 END), 0)`,
          uniquePlayers: sql<number>`COUNT(DISTINCT ${betResults.userId})`,
          uniqueGames: sql<number>`COUNT(DISTINCT ${betResults.gameId})`,
        })
        .from(betResults)
        .where(whereClause);

      const stats = overallStats[0];

      // Top performers (top 5)
      const topPerformers = await db
        .select({
          userId: betResults.userId,
          totalWins: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END)`,
          totalWinAmount: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`,
        })
        .from(betResults)
        .where(whereClause)
        .groupBy(betResults.userId)
        .orderBy(
          desc(
            sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END), 0)`
          )
        )
        .limit(5);

      // Recent activity (last 10 bets)
      const recentActivity = await db
        .select({
          id: betResults.id,
          userId: betResults.userId,
          gameId: betResults.gameId,
          betStatus: betResults.betStatus,
          betAmount: betResults.betAmount,
          winAmount: betResults.winAmount,
          lossAmount: betResults.lossAmount,
          createdAt: betResults.createdAt,
        })
        .from(betResults)
        .where(whereClause)
        .orderBy(desc(betResults.createdAt))
        .limit(10);

      // Game popularity
      const gamePopularity = await db
        .select({
          gameId: betResults.gameId,
          gameName: betResults.gameName,
          totalBets: sql<number>`COUNT(*)`,
          totalBetAmount: sql<number>`COALESCE(SUM(${betResults.betAmount}), 0)`,
        })
        .from(betResults)
        .where(whereClause)
        .groupBy(betResults.gameId, betResults.gameName)
        .orderBy(desc(sql<number>`COUNT(*)`))
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
          winRate:
            totalBets > 0
              ? Math.round((totalWins / totalBets) * 10000) / 100
              : 0,
          totalProfit:
            Math.round((totalWinAmount - totalLossAmount) * 100) / 100,
          averageBetAmount:
            totalBets > 0
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
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // NEW: Get comprehensive game-wise statistics
  async getGameWiseStats(filters: GameWiseStatsFilters): Promise<{
    data: any[];
    total: number;
    summary: {
      totalGames: number;
      totalBets: number;
      totalBetAmount: number;
      totalWinAmount: number;
      totalLossAmount: number;
      totalPendingBets: number;
      totalPlayersPlayed: number;
      overallWinRate: number;
    };
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const {
        dateFrom,
        dateTo,
        gameId,
        gameName,
        userId,
        providerId,
        categoryId,
        status,
        limit = 50,
        offset = 0,
        sortBy = "totalBets",
        sortOrder = "desc",
      } = filters;

      // Build where conditions
      const whereConditions = [];

      if (dateFrom) {
        whereConditions.push(gte(betResults.createdAt, dateFrom));
      }

      if (dateTo) {
        whereConditions.push(lte(betResults.createdAt, dateTo));
      }

      if (gameId) {
        whereConditions.push(eq(betResults.gameId, gameId));
      }

      if (userId) {
        whereConditions.push(eq(betResults.userId, userId));
      }

      if (providerId) {
        whereConditions.push(eq(games.providerId, providerId));
      }

      if (gameName) {
        whereConditions.push(like(games.name, `%${gameName}%`));
      }

      if (status) {
        whereConditions.push(eq(games.status, status as "active" | "inactive"));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`COUNT(DISTINCT ${betResults.gameId})` })
        .from(betResults)
        .leftJoin(games, eq(betResults.gameId, games.id));

      if (whereClause) {
        countQuery.where(whereClause);
      }

      const totalResult = await countQuery;
      const total = totalResult[0]?.count || 0;

      // Build order-by expression based on sortBy parameter
      let orderByExpr: any;
      switch (sortBy) {
        case "totalBets":
          orderByExpr = sql`COUNT(*)`;
          break;
        case "totalBetAmount":
          orderByExpr = sql`COALESCE(SUM(${betResults.betAmount}), 0)`;
          break;
        case "totalWinAmount":
          orderByExpr = sql`COALESCE(SUM(${betResults.winAmount}), 0)`;
          break;
        case "totalLossAmount":
          orderByExpr = sql`COALESCE(SUM(${betResults.lossAmount}), 0)`;
          break;
        case "totalPlayers":
          orderByExpr = sql`COUNT(DISTINCT ${betResults.userId})`;
          break;
        case "winRate":
          orderByExpr = sql`(COUNT(CASE WHEN ${betResults.betStatus} = 'win' THEN 1 END) / NULLIF(COUNT(*), 0))`;
          break;
        default:
          orderByExpr = sql`COUNT(*)`;
      }

      // Main query for game-wise statistics
      const results = await db
        .select({
          // Game details
          gameId: betResults.gameId,
          // gameName: games.name,
          // gameLogo: games.gameLogo,
          // gameUrl: games.gameUrl,
          // gameStatus: games.status,
          // categoryId: games.categoryId,
          // providerId: games.providerId,
          game: games,
          provider: game_providers,
          user: users,

          // Statistics
          totalBets: sql<number>`COUNT(*)`,
          totalBetAmount: sql<number>`COALESCE(SUM(${betResults.betAmount}), 0)`,
          totalWinAmount: sql<number>`COALESCE(SUM(${betResults.winAmount}), 0)`,
          totalLossAmount: sql<number>`COALESCE(SUM(${betResults.lossAmount}), 0)`,
          totalPendingBets: sql<number>`COUNT(CASE WHEN ${betResults.betStatus} = 'pending' THEN 1 END)`,
          totalPlayersPlayed: sql<number>`COUNT(DISTINCT ${betResults.userId})`,

          // Recent activity
          lastBetPlaced: sql<Date>`MAX(${betResults.createdAt})`,
          lastWinAmount: sql<number>`MAX(CASE WHEN ${betResults.betStatus} = 'win' THEN ${betResults.winAmount} ELSE 0 END)`,
          lastLossAmount: sql<number>`MAX(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${betResults.lossAmount} ELSE 0 END)`,

          // Category details
          categoryTitle: dropdownOptions.title,
          categoryImgUrl: dropdownOptions.imgUrl,

          // Provider details
          providerName: game_providers.name,
          providerLogo: game_providers.logo,
          providerCountry: game_providers.country,
        })
        .from(betResults)
        .leftJoin(users, eq(betResults.userId, users.id))
        .leftJoin(games, eq(betResults.gameId, games.id))
        .leftJoin(dropdownOptions, eq(games.categoryId, dropdownOptions.id))
        .leftJoin(game_providers, eq(games.providerId, game_providers.id))
        .where(whereClause)
        .groupBy(
          betResults.gameId,
          games.id,
          dropdownOptions.title,
          dropdownOptions.imgUrl,
          game_providers.name,
          game_providers.logo,
          game_providers.country
        )
        .orderBy(sortOrder === "desc" ? desc(orderByExpr) : asc(orderByExpr))
        .limit(limit)
        .offset(offset);

      // Get additional time-based player statistics for each game
      const gameIds = results.map((r) => r.gameId);
      const timeBasedStats = await Promise.all(
        gameIds.map(async (gameId) => {
          const today = new Date();
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

          const [todayStats] = await db
            .select({
              count: sql<number>`COUNT(DISTINCT ${betResults.userId})`,
            })
            .from(betResults)
            .where(
              and(
                eq(betResults.gameId, gameId),
                gte(betResults.createdAt, today)
              )
            )
            .limit(1);

          const [weekStats] = await db
            .select({
              count: sql<number>`COUNT(DISTINCT ${betResults.userId})`,
            })
            .from(betResults)
            .where(
              and(
                eq(betResults.gameId, gameId),
                gte(betResults.createdAt, weekAgo)
              )
            )
            .limit(1);

          const [monthStats] = await db
            .select({
              count: sql<number>`COUNT(DISTINCT ${betResults.userId})`,
            })
            .from(betResults)
            .where(
              and(
                eq(betResults.gameId, gameId),
                gte(betResults.createdAt, monthAgo)
              )
            )
            .limit(1);

          return {
            gameId,
            uniquePlayersToday: todayStats?.count || 0,
            uniquePlayersThisWeek: weekStats?.count || 0,
            uniquePlayersThisMonth: monthStats?.count || 0,
          };
        })
      );

      // Transform results to include calculated fields
      const gameStats: any[] = results.map((row) => {
        const totalBets = row.totalBets || 0;
        const totalBetAmount = Number(row.totalBetAmount) || 0;
        const totalWinAmount = Number(row.totalWinAmount) || 0;
        const totalLossAmount = Number(row.totalLossAmount) || 0;
        const totalPendingBets = row.totalPendingBets || 0;
        const totalPlayersPlayed = row.totalPlayersPlayed || 0;

        const winRate =
          totalBets > 0
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
        totalBetAmount:
          Math.round(
            gameStats.reduce((sum, game) => sum + game.totalBetAmount, 0) * 100
          ) / 100,
        totalWinAmount:
          Math.round(
            gameStats.reduce((sum, game) => sum + game.totalWinAmount, 0) * 100
          ) / 100,
        totalLossAmount:
          Math.round(
            gameStats.reduce((sum, game) => sum + game.totalLossAmount, 0) * 100
          ) / 100,
        totalPendingBets: gameStats.reduce(
          (sum, game) => sum + game.totalPendingBets,
          0
        ),
        totalPlayersPlayed: new Set(
          gameStats.flatMap((game) =>
            Array.from({ length: game.totalPlayersPlayed }, () => game.gameId)
          )
        ).size,
        overallWinRate:
          gameStats.length > 0
            ? Math.round(
                (gameStats.reduce((sum, game) => sum + game.winRate, 0) /
                  gameStats.length) *
                  100
              ) / 100
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
    } catch (error) {
      console.error("Error fetching game-wise statistics:", error);
      throw error;
    }
  },

  // Helper method to get player stats
  async getPlayerStats(
    userId: number,
    dateFrom?: Date,
    dateTo?: Date,
    gameId?: number
  ): Promise<{
    gamesPlayed: string[];
    favoriteGame: string;
    bestWin: number;
    worstLoss: number;
  }> {
    try {
      const whereConditions = [eq(betResults.userId, userId)];

      if (dateFrom) {
        whereConditions.push(gte(betResults.createdAt, dateFrom));
      }

      if (dateTo) {
        whereConditions.push(lte(betResults.createdAt, dateTo));
      }

      if (gameId) {
        whereConditions.push(eq(betResults.gameId, gameId));
      }

      const whereClause = and(...whereConditions);

      // Get games played
      const gamesPlayed = await db
        .select({ gameName: betResults.gameName })
        .from(betResults)
        .where(whereClause)
        .groupBy(betResults.gameName);

      // Get favorite game (most played)
      const favoriteGame = await db
        .select({ gameName: betResults.gameName, count: sql<number>`COUNT(*)` })
        .from(betResults)
        .where(whereClause)
        .groupBy(betResults.gameName)
        .orderBy(desc(sql`count`))
        .limit(1);

      // Get best win
      const bestWin = await db
        .select({ winAmount: betResults.winAmount })
        .from(betResults)
        .where(and(whereClause, eq(betResults.betStatus, "win")))
        .orderBy(desc(betResults.winAmount))
        .limit(1);

      // Get worst loss
      const worstLoss = await db
        .select({ lossAmount: betResults.lossAmount })
        .from(betResults)
        .where(and(whereClause, eq(betResults.betStatus, "loss")))
        .orderBy(desc(betResults.lossAmount))
        .limit(1);

      return {
        gamesPlayed: gamesPlayed.map((g) => g.gameName || "Unknown Game"),
        favoriteGame: favoriteGame[0]?.gameName || "Unknown Game",
        bestWin: Number(bestWin[0]?.winAmount) || 0,
        worstLoss: Number(worstLoss[0]?.lossAmount) || 0,
      };
    } catch (error) {
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
