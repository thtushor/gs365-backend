import { Request, Response } from "express";
import { db } from "../db/connection";
import { settings } from "../db/schema/settings";
import { transactions } from "../db/schema/transactions";
import { adminUsers } from "../db/schema/AdminUsers";
import { users } from "../db/schema/users";
import { betResults } from "../db/schema/betResults";
import { games } from "../db/schema/games";
import { eq, sql } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler";
import { AdminMainBalanceModel } from "../models/adminMainBalance.model";
import { countries, game_providers, sports_providers } from "../db/schema";

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  try {
    console.log("🔄 Fetching dashboard statistics...");
    
    // Get main balance from adminMainBalance
    const adminMainBalanceStats = await AdminMainBalanceModel.calculateStats();

    // Get transaction statistics
    const transactionStats = await db
      .select({
        totalWin: sql<number>`SUM(CASE WHEN transaction_type = 'win' THEN amount ELSE 0 END)`,
        totalLoss: sql<number>`SUM(CASE WHEN transaction_type = 'loss' THEN amount ELSE 0 END)`,
        totalDeposit: sql<number>`SUM(CASE WHEN transaction_type = 'deposit' AND transaction_status = 'approved' THEN amount ELSE 0 END)`,
        totalWithdraw: sql<number>`SUM(CASE WHEN transaction_type = 'withdraw' AND transaction_status = 'approved'  THEN amount ELSE 0 END)`,
        pendingDeposit: sql<number>`SUM(CASE WHEN transaction_type = 'deposit' AND transaction_status = 'pending' THEN amount ELSE 0 END)`,
        pendingWithdraw: sql<number>`SUM(CASE WHEN transaction_type = 'withdraw' AND transaction_status = 'pending' THEN amount ELSE 0 END)`,
        totalBonusCoin: sql<number>`SUM(CASE WHEN promotion_id IS NOT NULL THEN amount ELSE 0 END)`,
        totalBonusAmount: sql<number>`SUM(bonus_amount)`,
        // affiliate withdrawal
        totalAffiliateWithdrawal: sql<number>`SUM(CASE WHEN transaction_type = 'withdraw' AND transaction_status = 'approved' AND ${transactions.affiliateId} IS NOT NULL THEN amount ELSE 0 END)`,
        totalAffiliateWithdrawalPending: sql<number>`SUM(CASE WHEN transaction_type = 'withdraw' AND transaction_status = 'pending' AND ${transactions.affiliateId} IS NOT NULL THEN amount ELSE 0 END)`,
      })
      .from(transactions);

    // Get affiliate and agent counts
    const affiliateAgentStats = await db
      .select({
        totalSuperAffiliate: sql<number>`COUNT(CASE WHEN role = 'superAffiliate' THEN 1 END)`,
        totalSubAffiliate: sql<number>`COUNT(CASE WHEN role = 'affiliate' THEN 1 END)`,
        totalSuperAgent: sql<number>`COUNT(CASE WHEN role = 'superAgent' THEN 1 END)`,
        totalSubAgent: sql<number>`COUNT(CASE WHEN role = 'agent' THEN 1 END)`,
        totalAffiliate: sql<number>`COUNT(CASE WHEN role IN ('affiliate', 'superAffiliate') THEN 1 END)`,
        totalAgent: sql<number>`COUNT(CASE WHEN role IN ('agent', 'superAgent') THEN 1 END)`,
        totalAffiliateWithdrawal: sql<number>`
      COALESCE(
        (SELECT SUM(${transactions.amount})
         FROM ${transactions}
         WHERE ${transactions.affiliateId} IS NOT NULL
           AND ${transactions.type} = 'withdraw'
           AND ${transactions.status} = 'approved'
        ), 0
      )
    `,
        totalAffiliateKycVerified: sql<number>`COUNT(CASE WHEN ${adminUsers.kyc_status} = 'verified' AND role IN ('affiliate', 'superAffiliate') THEN 1 END)`,
        totalAffiliateKycUnverified: sql<number>`COUNT(CASE WHEN ${adminUsers.kyc_status} = 'unverified' AND role IN ('affiliate', 'superAffiliate') THEN 1 END)`,
        totalAffiliateKycRequired: sql<number>`COUNT(CASE WHEN ${adminUsers.kyc_status} = 'required' AND role IN ('affiliate', 'superAffiliate') THEN 1 END)`,
      })
      .from(adminUsers)
      .limit(1);

      // Get player statistics
      const playerStats = await db
        .select({
          totalPlayers: sql<number>`COUNT(*)`,
          totalOnlinePlayers: sql<number>`COUNT(CASE WHEN ${users.isLoggedIn} = true THEN 1 END)`,
          totalPlayerKycVerified: sql<number>`COUNT(CASE WHEN ${users.kyc_status} = 'verified' THEN 1 END)`,
          totalPlayerKycUnverified: sql<number>`COUNT(CASE WHEN ${users.kyc_status} = 'unverified' THEN 1 END)`,
          totalPlayerKycRequired: sql<number>`COUNT(CASE WHEN ${users.kyc_status} = 'required' THEN 1 END)`,
          totalBDUsers: sql<number>`COUNT(CASE WHEN ${countries.code} = 'BD' THEN 1 END)`,
          totalForeignUsers: sql<number>`COUNT(CASE WHEN ${countries.code} != 'BD' AND ${countries.code} IS NOT NULL THEN 1 END)`,
        })
        .from(users)
        .leftJoin(countries,eq(users.country_id,countries.id))
        .limit(1);

      // Get bet statistics
      const betStats = await db
        .select({
          totalBetPlaced: sql<number>`SUM(${betResults.betAmount})`,
          totalBetWin: sql<number>`SUM(${betResults.winAmount})`,
          totalBetLost: sql<number>`SUM(${betResults.lossAmount})`,
        })
        .from(betResults)
        .limit(1);

      // Get total games count
      const [gamesCount] = await db
        .select({ totalGames: sql<number>`COUNT(*)`,
        totalActiveGames: sql<number>`COUNT(CASE WHEN ${games.status} = 'active' THEN 1 END)`,
        totalInactiveGames: sql<number>`COUNT(CASE WHEN ${games.status} = 'inactive' THEN 1 END)`,
         })
        .from(games);

      const [gameProvidersCount] = await db
        .select({ totalGameProviders: sql<number>`COUNT(*)`,
        totalActiveGameProviders: sql<number>`COUNT(CASE WHEN ${game_providers.status} = 'active' THEN 1 END)`,
        totalInactiveGameProviders: sql<number>`COUNT(CASE WHEN ${game_providers.status} = 'inactive' THEN 1 END)`,
        totalParentGameProviders: sql<number>`COUNT(CASE WHEN ${game_providers.parentId} IS NULL THEN 1 END)`,
        totalSubGameProviders: sql<number>`COUNT(CASE WHEN ${game_providers.parentId} IS NOT NULL THEN 1 END)`,
         })
        .from(game_providers);

      const [sportsProvidersCount] = await db
        .select({ totalSportsProviders: sql<number>`COUNT(*)`,
        totalActiveSportsProviders: sql<number>`COUNT(CASE WHEN ${sports_providers.status} = 'active' THEN 1 END)`,
        totalInactiveSportsProviders: sql<number>`COUNT(CASE WHEN ${sports_providers.status} = 'inactive' THEN 1 END)`,
        totalParentSportsProviders: sql<number>`COUNT(CASE WHEN ${sports_providers.parentId} IS NULL THEN 1 END)`,
        totalSubSportsProviders: sql<number>`COUNT(CASE WHEN ${sports_providers.parentId} IS NOT NULL THEN 1 END)`,
         })
        .from(sports_providers);

    
      const [waggerList] = await db.select(
          {
            totalBetAmount: sql<number>`SUM(${betResults.betAmount})`,
            totalWinAmount: sql<number>`SUM(${betResults.winAmount})`,
            totalLossAmount: sql<number>`SUM(${betResults.lossAmount})`,
          }
        ).from(betResults);

    const totalCompanyProfit = Number(waggerList?.totalBetAmount || 0) - Number(waggerList?.totalWinAmount || 0);

    // Prepare dashboard data
    const dashboardData = {
      mainBalance: adminMainBalanceStats.currentMainBalance,
      totalAdminDeposit: adminMainBalanceStats.totalAdminDeposit,
      totalPlayerDeposit: adminMainBalanceStats.totalPlayerDeposit,
      totalPromotion: adminMainBalanceStats.totalPromotion,
      totalPlayerWithdraw: adminMainBalanceStats.totalPlayerWithdraw,
      totalAdminWithdraw: adminMainBalanceStats.totalAdminWithdraw,

      companyProfit: totalCompanyProfit,
      
      // Win/Loss
      totalWin: Number(transactionStats[0]?.totalWin || 0),
      totalLoss: Number(transactionStats[0]?.totalLoss || 0),
      totalBetAmount: Number(waggerList?.totalBetAmount || 0),
      
      // Deposit/Withdraw
      totalDeposit: Number(transactionStats[0]?.totalDeposit || 0),
      totalWithdraw: Number(transactionStats[0]?.totalWithdraw || 0),

      // Deposit/Withdraw affiliates
      totalAffiliateWithdrawal: Number(transactionStats[0]?.totalAffiliateWithdrawal || 0),
      totalAffiliateWithdrawalPending: Number(transactionStats[0]?.totalAffiliateWithdrawalPending || 0),
      
      // Pending Transactions
      pendingDeposit: Number(transactionStats[0]?.pendingDeposit || 0),
      pendingWithdraw: Number(transactionStats[0]?.pendingWithdraw || 0),
      
      // Bonus Coins and Bonus Amount
      totalBonusCoin: Number(transactionStats[0]?.totalBonusCoin || 0),
      totalBonusAmount: Number(transactionStats[0]?.totalBonusAmount || 0),
      
      // Affiliate Stats
      totalAffiliate: Number(affiliateAgentStats[0]?.totalAffiliate || 0),
      totalSuperAffiliate: Number(affiliateAgentStats[0]?.totalSuperAffiliate || 0),
      totalSubAffiliate: Number(affiliateAgentStats[0]?.totalSubAffiliate || 0),
      
      // Agent Stats
      totalAgent: Number(affiliateAgentStats[0]?.totalAgent || 0),
      totalSuperAgent: Number(affiliateAgentStats[0]?.totalSuperAgent || 0),
      totalSubAgent: Number(affiliateAgentStats[0]?.totalSubAgent || 0),
      
      // Player Stats
      totalPlayers: Number(playerStats[0]?.totalPlayers || 0),
      totalOnlinePlayers: Number(playerStats[0]?.totalOnlinePlayers || 0),
      totalPlayerKycVerified: Number(playerStats[0]?.totalPlayerKycVerified || 0),
      totalPlayerKycUnverified: Number(playerStats[0]?.totalPlayerKycUnverified || 0),
      totalPlayerKycRequired: Number(playerStats[0]?.totalPlayerKycRequired || 0),
      totalForeignUsers: Number(playerStats[0]?.totalForeignUsers || 0),
      totalBDUsers: Number(playerStats[0]?.totalBDUsers || 0),
      
      // Bet Stats
      totalBetPlaced: Number(betStats[0]?.totalBetPlaced || 0),
      totalBetWin: Number(betStats[0]?.totalBetWin || 0),
      totalBetLost: Number(betStats[0]?.totalBetLost || 0),
      
      // Provider Payments (static for now)
      totalGameProvidersPayment: 0,
      totalSportsProvidersPayment: 0,
      gameProviderPendingPayment: 0,
      sportsProviderPendingPayment: 0,
      
      // totalParentGameProvider:
      // Total Games
      totalGames: Number(gamesCount?.totalGames || 0),
      totalActiveGames: Number(gamesCount?.totalActiveGames || 0),
      totalInactiveGames: Number(gamesCount?.totalInactiveGames || 0),
      totalGameProviders: Number(gameProvidersCount?.totalGameProviders || 0),
      totalActiveGameProviders: Number(gameProvidersCount?.totalActiveGameProviders || 0),
      totalInactiveGameProviders: Number(gameProvidersCount?.totalInactiveGameProviders || 0),
      totalParentGameProviders: Number(gameProvidersCount?.totalParentGameProviders || 0),
      totalSubGameProviders: Number(gameProvidersCount?.totalSubGameProviders || 0),

      totalSportsProviders: Number(sportsProvidersCount?.totalSportsProviders || 0),
      totalActiveSportsProviders: Number(sportsProvidersCount?.totalActiveSportsProviders || 0),
      totalInactiveSportsProviders: Number(sportsProvidersCount?.totalInactiveSportsProviders || 0),
      totalParentSportsProviders: Number(sportsProvidersCount?.totalParentSportsProviders || 0),
      totalSubSportsProviders: Number(sportsProvidersCount?.totalSubSportsProviders || 0),
    };

      console.log("✅ Dashboard statistics fetched successfully");

      res.status(200).json({
        success: true,
        message: "Dashboard statistics retrieved successfully",
        data: dashboardData,
      });
    } catch (error) {
      console.error("❌ Error fetching dashboard stats:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch dashboard statistics",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
);
