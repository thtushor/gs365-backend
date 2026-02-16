"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const connection_1 = require("../db/connection");
const transactions_1 = require("../db/schema/transactions");
const AdminUsers_1 = require("../db/schema/AdminUsers");
const users_1 = require("../db/schema/users");
const betResults_1 = require("../db/schema/betResults");
const games_1 = require("../db/schema/games");
const drizzle_orm_1 = require("drizzle-orm");
const asyncHandler_1 = require("../utils/asyncHandler");
const adminMainBalance_model_1 = require("../models/adminMainBalance.model");
const schema_1 = require("../db/schema");
const balance_model_1 = require("../models/balance.model");
exports.getDashboardStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        console.log("🔄 Fetching dashboard statistics...");
        // Get main balance from adminMainBalance
        const adminMainBalanceStats = await adminMainBalance_model_1.AdminMainBalanceModel.calculateStats();
        // Get transaction statistics
        const transactionStats = await connection_1.db
            .select({
            totalWin: (0, drizzle_orm_1.sql) `SUM(CASE WHEN transaction_type = 'win' THEN amount ELSE 0 END)`,
            totalLoss: (0, drizzle_orm_1.sql) `SUM(CASE WHEN transaction_type = 'loss' THEN amount ELSE 0 END)`,
            totalDeposit: (0, drizzle_orm_1.sql) `SUM(CASE WHEN transaction_type = 'deposit' AND transaction_status = 'approved' THEN amount ELSE 0 END)`,
            totalSpinBonus: (0, drizzle_orm_1.sql) `SUM(CASE WHEN transaction_type = 'spin_bonus' AND transaction_status = 'approved' THEN amount ELSE 0 END)`,
            totalDepositUSD: (0, drizzle_orm_1.sql) `SUM(CASE WHEN transaction_type = 'deposit' AND transaction_status = 'approved' AND ${schema_1.currencies.code} = 'USD' THEN amount / NULLIF(conversion_rate, 0) ELSE 0 END)`,
            totalWithdraw: (0, drizzle_orm_1.sql) `
  SUM(
    CASE 
      WHEN transaction_type = 'withdraw'
        AND transaction_status = 'approved'
        AND ${transactions_1.transactions.affiliateId} IS NULL
      THEN amount
      ELSE 0
    END
  )
`,
            totalWithdrawUSD: (0, drizzle_orm_1.sql) `SUM(CASE WHEN transaction_type = 'withdraw' AND transaction_status = 'approved' AND ${schema_1.currencies.code} = 'USD'  THEN amount / NULLIF(conversion_rate, 0) ELSE 0 END)`,
            pendingDeposit: (0, drizzle_orm_1.sql) `SUM(CASE WHEN transaction_type = 'deposit' AND transaction_status = 'pending' THEN amount ELSE 0 END)`,
            pendingWithdraw: (0, drizzle_orm_1.sql) `
  SUM(
    CASE 
      WHEN transaction_type = 'withdraw'
        AND transaction_status = 'pending'
        AND ${transactions_1.transactions.affiliateId} IS NULL
      THEN amount 
      ELSE 0 
    END
  )
`,
            totalBonusCoin: (0, drizzle_orm_1.sql) `SUM(CASE WHEN promotion_id IS NOT NULL AND transaction_status = 'approved' THEN bonus_amount ELSE 0 END)`,
            totalBonusAmount: (0, drizzle_orm_1.sql) `SUM(CASE WHEN promotion_id IS NOT NULL AND transaction_status = 'approved' THEN bonus_amount ELSE 0 END)`,
            totalBonusAmountUSD: (0, drizzle_orm_1.sql) `SUM(CASE WHEN promotion_id IS NOT NULL AND transaction_status = 'approved' AND ${schema_1.currencies.code} = 'USD' THEN bonus_amount / NULLIF(conversion_rate, 0) ELSE 0 END)`,
            // affiliate withdrawal
            totalAffiliateWithdrawal: (0, drizzle_orm_1.sql) `SUM(CASE WHEN transaction_type = 'withdraw' AND transaction_status = 'approved' AND ${transactions_1.transactions.affiliateId} IS NOT NULL THEN amount ELSE 0 END)`,
            totalAffiliateWithdrawalPending: (0, drizzle_orm_1.sql) `SUM(CASE WHEN transaction_type = 'withdraw' AND transaction_status = 'pending' AND ${transactions_1.transactions.affiliateId} IS NOT NULL THEN amount ELSE 0 END)`,
        })
            .from(transactions_1.transactions)
            .leftJoin(schema_1.currencies, (0, drizzle_orm_1.eq)(transactions_1.transactions.currencyId, schema_1.currencies.id));
        // Get affiliate and agent counts
        const affiliateAgentStats = await connection_1.db
            .select({
            totalSuperAffiliate: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN role = 'superAffiliate' THEN 1 END)`,
            totalSubAffiliate: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN role = 'affiliate' THEN 1 END)`,
            totalSuperAgent: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN role = 'superAgent' THEN 1 END)`,
            totalSubAgent: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN role = 'agent' THEN 1 END)`,
            totalAffiliate: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN role IN ('affiliate', 'superAffiliate') THEN 1 END)`,
            totalAgent: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN role IN ('agent', 'superAgent') THEN 1 END)`,
            totalAffiliateWithdrawal: (0, drizzle_orm_1.sql) `
      COALESCE(
        (SELECT SUM(${transactions_1.transactions.amount})
         FROM ${transactions_1.transactions}
         WHERE ${transactions_1.transactions.affiliateId} IS NOT NULL
           AND ${transactions_1.transactions.type} = 'withdraw'
           AND ${transactions_1.transactions.status} = 'approved'
        ), 0
      )
    `,
            totalAffiliateKycVerified: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${AdminUsers_1.adminUsers.kyc_status} = 'verified' AND role IN ('affiliate', 'superAffiliate') THEN 1 END)`,
            totalAffiliateKycUnverified: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${AdminUsers_1.adminUsers.kyc_status} = 'unverified' AND role IN ('affiliate', 'superAffiliate') THEN 1 END)`,
            totalAffiliateKycRequired: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${AdminUsers_1.adminUsers.kyc_status} = 'required' AND role IN ('affiliate', 'superAffiliate') THEN 1 END)`,
        })
            .from(AdminUsers_1.adminUsers)
            .limit(1);
        // Get player statistics
        const playerStats = await connection_1.db
            .select({
            totalPlayers: (0, drizzle_orm_1.sql) `COUNT(*)`,
            totalOnlinePlayers: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${users_1.users.isLoggedIn} = true THEN 1 END)`,
            totalPlayerKycVerified: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${users_1.users.kyc_status} = 'verified' THEN 1 END)`,
            totalPlayerKycUnverified: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${users_1.users.kyc_status} = 'unverified' THEN 1 END)`,
            totalPlayerKycRequired: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${users_1.users.kyc_status} = 'required' THEN 1 END)`,
            totalBDUsers: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.countries.code} = 'BD' THEN 1 END)`,
            totalForeignUsers: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.countries.code} != 'BD' AND ${schema_1.countries.code} IS NOT NULL THEN 1 END)`,
        })
            .from(users_1.users)
            .leftJoin(schema_1.countries, (0, drizzle_orm_1.eq)(users_1.users.country_id, schema_1.countries.id))
            .limit(1);
        // Get bet statistics
        const betStats = await connection_1.db
            .select({
            totalBetPlaced: (0, drizzle_orm_1.sql) `SUM(${betResults_1.betResults.betAmount})`,
            totalBetWin: (0, drizzle_orm_1.sql) `SUM(${betResults_1.betResults.winAmount})`,
            totalBetLost: (0, drizzle_orm_1.sql) `SUM(${betResults_1.betResults.lossAmount})`,
        })
            .from(betResults_1.betResults)
            .limit(1);
        // Get total games count
        const [gamesCount] = await connection_1.db
            .select({
            totalGames: (0, drizzle_orm_1.sql) `COUNT(*)`,
            totalActiveGames: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${games_1.games.status} = 'active' THEN 1 END)`,
            totalInactiveGames: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${games_1.games.status} = 'inactive' THEN 1 END)`,
        })
            .from(games_1.games);
        const [gameProvidersCount] = await connection_1.db
            .select({
            totalGameProviders: (0, drizzle_orm_1.sql) `COUNT(*)`,
            totalActiveGameProviders: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.game_providers.status} = 'active' THEN 1 END)`,
            totalInactiveGameProviders: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.game_providers.status} = 'inactive' THEN 1 END)`,
            totalParentGameProviders: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.game_providers.parentId} IS NULL THEN 1 END)`,
            totalSubGameProviders: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.game_providers.parentId} IS NOT NULL THEN 1 END)`,
        })
            .from(schema_1.game_providers);
        const [sportsProvidersCount] = await connection_1.db
            .select({
            totalSportsProviders: (0, drizzle_orm_1.sql) `COUNT(*)`,
            totalActiveSportsProviders: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.sports_providers.status} = 'active' THEN 1 END)`,
            totalInactiveSportsProviders: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.sports_providers.status} = 'inactive' THEN 1 END)`,
            totalParentSportsProviders: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.sports_providers.parentId} IS NULL THEN 1 END)`,
            totalSubSportsProviders: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.sports_providers.parentId} IS NOT NULL THEN 1 END)`,
        })
            .from(schema_1.sports_providers);
        const [waggerList] = await connection_1.db
            .select({
            totalBetAmount: (0, drizzle_orm_1.sql) `SUM(${betResults_1.betResults.betAmount})`,
            totalWinAmount: (0, drizzle_orm_1.sql) `SUM(${betResults_1.betResults.winAmount})`,
            totalLossAmount: (0, drizzle_orm_1.sql) `SUM(${betResults_1.betResults.lossAmount})`,
        })
            .from(betResults_1.betResults);
        const totalPlayerCurrentBalance = await balance_model_1.BalanceModel.getTotalPlayerCurrentBalance();
        const totalGGRAmount = Number(waggerList?.totalBetAmount || 0) -
            Number(waggerList?.totalWinAmount || 0);
        const totalPlayerDepositsWithBonus = Number(adminMainBalanceStats.totalPlayerDeposit || 0) +
            Number(transactionStats[0]?.totalBonusAmount || 0);
        const netCompanyHoldingsFromPlayers = Number(totalPlayerDepositsWithBonus || 0) -
            Number(adminMainBalanceStats.totalPlayerWithdraw || 0);
        const totalCompanyProfit = Number(netCompanyHoldingsFromPlayers || 0) -
            Number(totalPlayerCurrentBalance.totalCurrentBalance || 0);
        // Prepare dashboard data
        const dashboardData = {
            totalSpinBonus: adminMainBalanceStats.totalSpinBonus,
            mainBalance: adminMainBalanceStats.currentMainBalance,
            totalAdminDeposit: adminMainBalanceStats.totalAdminDeposit,
            totalPlayerDeposit: adminMainBalanceStats.totalPlayerDeposit,
            totalPromotion: adminMainBalanceStats.totalPromotion,
            totalPlayerWithdraw: adminMainBalanceStats.totalPlayerWithdraw,
            totalAdminWithdraw: adminMainBalanceStats.totalAdminWithdraw,
            companyProfit: Number(totalCompanyProfit || 0),
            totalGGRAmount: Number(totalGGRAmount || 0),
            totalPlayerCurrentBalance: Number(totalPlayerCurrentBalance.totalCurrentBalance || 0),
            totalPlayerCurrentBalanceUSD: `$${Number(totalPlayerCurrentBalance.totalCurrentBalanceUSD || 0).toFixed(2)}`,
            // Win/Loss
            totalWin: Number(transactionStats[0]?.totalWin || 0),
            totalLoss: Number(transactionStats[0]?.totalLoss || 0),
            totalBetAmount: Number(waggerList?.totalBetAmount || 0),
            // Deposit/Withdraw
            totalDeposit: Number(transactionStats[0]?.totalDeposit || 0),
            totalDepositUSD: `$${Number(transactionStats[0]?.totalDepositUSD || 0).toFixed(2)}`,
            totalWithdraw: Number(transactionStats[0]?.totalWithdraw || 0),
            totalWithdrawUSD: `$${Number(transactionStats[0]?.totalWithdrawUSD || 0).toFixed(2)}`,
            // Deposit/Withdraw affiliates
            totalAffiliateWithdrawal: Number(transactionStats[0]?.totalAffiliateWithdrawal || 0),
            totalAffiliateWithdrawalPending: Number(transactionStats[0]?.totalAffiliateWithdrawalPending || 0),
            // Pending Transactions
            pendingDeposit: Number(transactionStats[0]?.pendingDeposit || 0),
            pendingWithdraw: Number(transactionStats[0]?.pendingWithdraw || 0),
            // Bonus Coins and Bonus Amount
            totalBonusCoin: Number(transactionStats[0]?.totalBonusCoin || 0),
            totalBonusAmount: Number(transactionStats[0]?.totalBonusAmount || 0),
            totalBonusAmountUSD: `$${Number(transactionStats[0]?.totalBonusAmountUSD || 0).toFixed(2)}`,
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
    }
    catch (error) {
        console.error("❌ Error fetching dashboard stats:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard statistics",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
});
