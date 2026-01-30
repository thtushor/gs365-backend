import { eq, and, sql, isNotNull } from "drizzle-orm";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { currencies } from "../db/schema/currency";
import { promotions } from "../db/schema";

export interface PlayerBalance {
  totalSpinBonusUSD: number;
  totalSpinBonus: number;
  currencyCode: string;
  totalDeposits: number;
  totalWithdrawals: number;
  totalWins: number;
  totalLosses: number;
  currentBalance: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  approvedDeposits: number;
  approvedWithdrawals: number;
  // USD equivalents
  totalDepositsUSD: number;
  totalWithdrawalsUSD: number;
  totalWinsUSD: number;
  totalLossesUSD: number;
  currentBalanceUSD: number;
  pendingDepositsUSD: number;
  pendingWithdrawalsUSD: number;
  approvedDepositsUSD: number;
  approvedWithdrawalsUSD: number;
}

export interface BalanceFilters {
  userId?: number;
  currencyId?: number;
  status?: "all" | "approved" | "pending";
}

export const BalanceModel = {
  async calculatePlayerBalance(
    userId: number,
    currencyId?: number,
  ): Promise<PlayerBalance> {
    try {
      let whereConditions = [eq(transactions.userId, userId)];

      if (currencyId) {
        whereConditions.push(eq(transactions.currencyId, currencyId));
      }

      const result = await db
        .select({
          // BDT amounts (original logic)
          totalDeposits: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'deposit' 
              AND ${transactions.status} = 'approved' 
              THEN ${transactions.amount} + COALESCE(${transactions.bonusAmount}, 0) ELSE 0 END), 0)
          `,
          totalSpinBonus: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'spin_bonus' 
              AND ${transactions.status} = 'approved' 
              THEN ${transactions.amount} + COALESCE(${transactions.bonusAmount}, 0) ELSE 0 END), 0)
          `,
          totalWithdrawals: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdraw' 
              AND ${transactions.status} = 'approved' 
              THEN ${transactions.amount} ELSE 0 END), 0)
          `,
          totalWins: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'win' 
              AND ${transactions.status} = 'approved' 
              THEN ${transactions.amount} ELSE 0 END), 0)
          `,
          totalLosses: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'loss' 
              AND ${transactions.status} = 'approved' 
              THEN ${transactions.amount} ELSE 0 END), 0)
          `,
          pendingDeposits: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'deposit' 
              AND ${transactions.status} = 'pending' 
              THEN ${transactions.amount} + COALESCE(${transactions.bonusAmount}, 0) ELSE 0 END), 0)
          `,
          pendingWithdrawals: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdraw' 
              AND ${transactions.status} = 'pending' 
              THEN ${transactions.amount} ELSE 0 END), 0)
          `,
          // USD amounts (converted)
          totalDepositsUSD: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'deposit' 
              AND ${transactions.status} = 'approved' 
              THEN (${transactions.amount} + COALESCE(${transactions.bonusAmount}, 0)) / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
          `,
          totalSpinBonusUSD: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'spin_bonus' 
              AND ${transactions.status} = 'approved' 
              THEN (${transactions.amount} + COALESCE(${transactions.bonusAmount}, 0)) / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
          `,
          totalWithdrawalsUSD: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdraw' 
              AND ${transactions.status} = 'approved' 
              THEN ${transactions.amount} / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
          `,
          totalWinsUSD: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'win' 
              AND ${transactions.status} = 'approved' 
              THEN ${transactions.amount} / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
          `,
          totalLossesUSD: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'loss' 
              AND ${transactions.status} = 'approved' 
              THEN ${transactions.amount} / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
          `,
          pendingDepositsUSD: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'deposit' 
              AND ${transactions.status} = 'pending' 
              THEN (${transactions.amount} + COALESCE(${transactions.bonusAmount}, 0)) / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
          `,
          pendingWithdrawalsUSD: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdraw' 
              AND ${transactions.status} = 'pending' 
              THEN ${transactions.amount} / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
          `,
        })
        .from(transactions)
        .leftJoin(promotions, eq(transactions.promotionId, promotions.id))
        .where(and(...whereConditions))
        .groupBy(transactions.userId);

      if (result.length === 0) {
        // Return default balance object if no transactions found
        return {
          currencyCode: "N/A",
          totalDeposits: 0,
          totalSpinBonus: 0,
          totalWithdrawals: 0,
          totalWins: 0,
          totalLosses: 0,
          currentBalance: 0,
          pendingDeposits: 0,
          pendingWithdrawals: 0,
          approvedDeposits: 0,
          approvedWithdrawals: 0,
          // USD equivalents
          totalDepositsUSD: 0,
          totalSpinBonusUSD: 0,
          totalWithdrawalsUSD: 0,
          totalWinsUSD: 0,
          totalLossesUSD: 0,
          currentBalanceUSD: 0,
          pendingDepositsUSD: 0,
          pendingWithdrawalsUSD: 0,
          approvedDepositsUSD: 0,
          approvedWithdrawalsUSD: 0,
        };
      }

      const row = result[0];
      // BDT amounts
      const totalSpinBonus = Number(row.totalSpinBonus);
      const totalDeposits = Number(row.totalDeposits);
      const totalWithdrawals = Number(row.totalWithdrawals);
      const totalWins = Number(row.totalWins);
      const totalLosses = Number(row.totalLosses);
      const pendingDeposits = Number(row.pendingDeposits);
      const pendingWithdrawals = Number(row.pendingWithdrawals);

      // USD amounts
      const totalSpinBonusUSD = Number(row.totalSpinBonusUSD);
      const totalDepositsUSD = Number(row.totalDepositsUSD);
      const totalWithdrawalsUSD = Number(row.totalWithdrawalsUSD);
      const totalWinsUSD = Number(row.totalWinsUSD);
      const totalLossesUSD = Number(row.totalLossesUSD);
      const pendingDepositsUSD = Number(row.pendingDepositsUSD);
      const pendingWithdrawalsUSD = Number(row.pendingWithdrawalsUSD);

      // Calculate current balance: deposits + wins - withdrawals - losses
      const currentBalance =
        totalDeposits +
        totalSpinBonus +
        totalWins -
        totalWithdrawals -
        totalLosses;
      const currentBalanceUSD =
        totalDepositsUSD +
        totalSpinBonusUSD +
        totalWinsUSD -
        totalWithdrawalsUSD -
        totalLossesUSD;

      return {
        currencyCode: "N/A", // Will be updated if currency info is needed
        totalDeposits,
        totalWithdrawals,
        totalWins,
        totalLosses,
        totalSpinBonus,
        currentBalance,
        pendingDeposits,
        pendingWithdrawals,
        approvedDeposits: totalDeposits,
        approvedWithdrawals: totalWithdrawals,
        // USD equivalents
        totalDepositsUSD,
        totalWithdrawalsUSD,
        totalSpinBonusUSD,
        totalWinsUSD,
        totalLossesUSD,
        currentBalanceUSD,
        pendingDepositsUSD,
        pendingWithdrawalsUSD,
        approvedDepositsUSD: totalDepositsUSD,
        approvedWithdrawalsUSD: totalWithdrawalsUSD,
      };
    } catch (error) {
      console.error("Error calculating player balance:", error);
      throw error;
    }
  },

  async calculateAllPlayerBalances(
    filters: BalanceFilters = {},
  ): Promise<PlayerBalance[]> {
    try {
      let whereConditions = [];

      if (filters.userId) {
        whereConditions.push(eq(transactions.userId, filters.userId));
      }

      if (filters.currencyId) {
        whereConditions.push(eq(transactions.currencyId, filters.currencyId));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const balanceQuery = sql`
        SELECT 
          t.user_id as userId,
          t.currency_id as currencyId,
          c.code as currencyCode,
          -- BDT amounts (original logic)
          COALESCE(SUM(CASE WHEN t.type = 'deposit' AND t.status = 'approved' THEN t.amount ELSE 0 END), 0) as totalDeposits,
          COALESCE(SUM(CASE WHEN t.type = 'spin_bonus' AND t.status = 'approved' THEN t.amount ELSE 0 END), 0) as totalSpinBonus,
          COALESCE(SUM(CASE WHEN t.type = 'withdraw' AND t.status = 'approved' THEN t.amount ELSE 0 END), 0) as totalWithdrawals,
          COALESCE(SUM(CASE WHEN t.type = 'win' AND t.status = 'approved' THEN t.amount ELSE 0 END), 0) as totalWins,
          COALESCE(SUM(CASE WHEN t.type = 'loss' AND t.status = 'approved' THEN t.amount ELSE 0 END), 0) as totalLosses,
          COALESCE(SUM(CASE WHEN t.type = 'deposit' AND t.status = 'pending' THEN t.amount ELSE 0 END), 0) as pendingDeposits,
          COALESCE(SUM(CASE WHEN t.type = 'withdraw' AND t.status = 'pending' THEN t.amount ELSE 0 END), 0) as pendingWithdrawals,
          -- USD amounts (converted)
          COALESCE(SUM(CASE WHEN t.type = 'deposit' AND t.status = 'approved' THEN t.amount / COALESCE(t.conversion_rate, 1) ELSE 0 END), 0) as totalDepositsUSD,
          COALESCE(SUM(CASE WHEN t.type = 'spin_bonus' AND t.status = 'approved' THEN t.amount / COALESCE(t.conversion_rate, 1) ELSE 0 END), 0) as totalSpinBonusUSD,
          COALESCE(SUM(CASE WHEN t.type = 'withdraw' AND t.status = 'approved' THEN t.amount / COALESCE(t.conversion_rate, 1) ELSE 0 END), 0) as totalWithdrawalsUSD,
          COALESCE(SUM(CASE WHEN t.type = 'win' AND t.status = 'approved' THEN t.amount / COALESCE(t.conversion_rate, 1) ELSE 0 END), 0) as totalWinsUSD,
          COALESCE(SUM(CASE WHEN t.type = 'loss' AND t.status = 'approved' THEN t.amount / COALESCE(t.conversion_rate, 1) ELSE 0 END), 0) as totalLossesUSD,
          COALESCE(SUM(CASE WHEN t.type = 'deposit' AND t.status = 'pending' THEN t.amount / COALESCE(t.conversion_rate, 1) ELSE 0 END), 0) as pendingDepositsUSD,
          COALESCE(SUM(CASE WHEN t.type = 'withdraw' AND t.status = 'pending' THEN t.amount / COALESCE(t.conversion_rate, 1) ELSE 0 END), 0) as pendingWithdrawalsUSD
        FROM transactions t
        LEFT JOIN currencies c ON t.currency_id = c.id
        ${whereClause ? sql`WHERE ${whereClause}` : sql``}
        GROUP BY t.user_id, t.currency_id, c.code
        ORDER BY t.user_id, t.currency_id
      `;

      const result = await db.execute(balanceQuery);

      return result.map((row: any) => {
        // BDT amounts
        const totalSpinBonus = Number(row.totalSpinBonus);
        const totalDeposits = Number(row.totalDeposits);
        const totalWithdrawals = Number(row.totalWithdrawals);
        const totalWins = Number(row.totalWins);
        const totalLosses = Number(row.totalLosses);
        const pendingDeposits = Number(row.pendingDeposits);
        const pendingWithdrawals = Number(row.pendingWithdrawals);

        // USD amounts
        const totalSpinBonusUSD = Number(row.totalSpinBonusUSD);
        const totalDepositsUSD = Number(row.totalDepositsUSD);
        const totalWithdrawalsUSD = Number(row.totalWithdrawalsUSD);
        const totalWinsUSD = Number(row.totalWinsUSD);
        const totalLossesUSD = Number(row.totalLossesUSD);
        const pendingDepositsUSD = Number(row.pendingDepositsUSD);
        const pendingWithdrawalsUSD = Number(row.pendingWithdrawalsUSD);

        // Calculate current balance: deposits + wins - withdrawals - losses
        const currentBalance =
          totalDeposits +
          totalSpinBonus +
          totalWins -
          totalWithdrawals -
          totalLosses;
        const currentBalanceUSD =
          totalDepositsUSD +
          totalSpinBonusUSD +
          totalWinsUSD -
          totalWithdrawalsUSD -
          totalLossesUSD;

        return {
          userId: Number(row.userId),
          currencyId: Number(row.currencyId),
          currencyCode: row.currencyCode,
          totalDeposits,
          totalSpinBonus,
          totalSpinBonusUSD,
          totalWithdrawals,
          totalWins,
          totalLosses,
          currentBalance,
          pendingDeposits,
          pendingWithdrawals,
          approvedDeposits: totalDeposits,
          approvedWithdrawals: totalWithdrawals,
          // USD equivalents
          totalDepositsUSD,
          totalWithdrawalsUSD,
          totalWinsUSD,
          totalLossesUSD,
          currentBalanceUSD,
          pendingDepositsUSD,
          pendingWithdrawalsUSD,
          approvedDepositsUSD: totalDepositsUSD,
          approvedWithdrawalsUSD: totalWithdrawalsUSD,
        };
      });
    } catch (error) {
      console.error("Error calculating all player balances:", error);
      throw error;
    }
  },
  async getTotalPlayerCurrentBalance(): Promise<{
    totalCurrentBalance: number;
    totalCurrentBalanceUSD: number;
  }> {
    try {
      const result = await db
        .select({
          // BDT amounts (original logic)
          totalDeposits: sql<number>`
          COALESCE(SUM(CASE WHEN ${transactions.type} = 'deposit' 
            AND ${transactions.status} = 'approved' 
            THEN ${transactions.amount} + COALESCE(${transactions.bonusAmount}, 0) ELSE 0 END), 0)
        `,
          totalSpinBonus: sql<number>`
          COALESCE(SUM(CASE WHEN ${transactions.type} = 'spin_bonus' 
            AND ${transactions.status} = 'approved' 
            THEN ${transactions.amount} + COALESCE(${transactions.bonusAmount}, 0) ELSE 0 END), 0)
        `,
          totalWithdrawals: sql<number>`
          COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdraw' 
            AND ${transactions.status} = 'approved' 
            THEN ${transactions.amount} ELSE 0 END), 0)
        `,
          totalWins: sql<number>`
          COALESCE(SUM(CASE WHEN ${transactions.type} = 'win' 
            AND ${transactions.status} = 'approved' 
            THEN ${transactions.amount} ELSE 0 END), 0)
        `,
          totalLosses: sql<number>`
          COALESCE(SUM(CASE WHEN ${transactions.type} = 'loss' 
            AND ${transactions.status} = 'approved' 
            THEN ${transactions.amount} ELSE 0 END), 0)
        `,
          // USD amounts (converted)
          totalDepositsUSD: sql<number>`
          COALESCE(SUM(CASE WHEN ${transactions.type} = 'deposit' 
            AND ${transactions.status} = 'approved' 
            THEN (${transactions.amount} + COALESCE(${transactions.bonusAmount}, 0)) / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
        `,
          totalSpinBonusUSD: sql<number>`
          COALESCE(SUM(CASE WHEN ${transactions.type} = 'spin_bonus' 
            AND ${transactions.status} = 'approved' 
            THEN (${transactions.amount} + COALESCE(${transactions.bonusAmount}, 0)) / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
        `,
          totalWithdrawalsUSD: sql<number>`
          COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdraw' 
            AND ${transactions.status} = 'approved' 
            THEN ${transactions.amount} / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
        `,
          totalWinsUSD: sql<number>`
          COALESCE(SUM(CASE WHEN ${transactions.type} = 'win' 
            AND ${transactions.status} = 'approved' 
            THEN ${transactions.amount} / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
        `,
          totalLossesUSD: sql<number>`
          COALESCE(SUM(CASE WHEN ${transactions.type} = 'loss' 
            AND ${transactions.status} = 'approved' 
            THEN ${transactions.amount} / COALESCE(${transactions.conversionRate}, 1) ELSE 0 END), 0)
        `,
        })
        .from(transactions)
        .where(isNotNull(transactions.userId));

      const row = result[0];

      // BDT amounts
      const totalSpinBonus = Number(row.totalSpinBonus);
      const totalDeposits = Number(row.totalDeposits);
      const totalWithdrawals = Number(row.totalWithdrawals);
      const totalWins = Number(row.totalWins);
      const totalLosses = Number(row.totalLosses);

      // USD amounts
      const totalSpinBonusUSD = Number(row.totalSpinBonusUSD);
      const totalDepositsUSD = Number(row.totalDepositsUSD);
      const totalWithdrawalsUSD = Number(row.totalWithdrawalsUSD);
      const totalWinsUSD = Number(row.totalWinsUSD);
      const totalLossesUSD = Number(row.totalLossesUSD);

      // Calculate total balance of all players
      const totalCurrentBalance =
        totalDeposits +
        totalSpinBonus +
        totalWins -
        totalWithdrawals -
        totalLosses;
      const totalCurrentBalanceUSD =
        totalDepositsUSD +
        totalSpinBonusUSD +
        totalWinsUSD -
        totalWithdrawalsUSD -
        totalLossesUSD;

      return { totalCurrentBalance, totalCurrentBalanceUSD };
    } catch (error) {
      console.error("Error calculating total players balance:", error);
      throw error;
    }
  },
  async getBalanceSummary(userId: number): Promise<{
    totalBalance: number;
    currencyBalances: PlayerBalance[];
    summary: {
      totalSpinBonus: number;
      totalDeposits: number;
      totalWithdrawals: number;
      totalWins: number;
      totalLosses: number;
      netGamblingResult: number;
    };
  }> {
    try {
      // Get all balances for the user across all currencies
      const balances = await this.calculateAllPlayerBalances({ userId });

      const summary = balances.reduce(
        (acc, balance) => {
          acc.totalSpinBonus += balance.totalSpinBonus;
          acc.totalDeposits += balance.totalDeposits;
          acc.totalWithdrawals += balance.totalWithdrawals;
          acc.totalWins += balance.totalWins;
          acc.totalLosses += balance.totalLosses;
          return acc;
        },
        {
          totalSpinBonus: 0,
          totalDeposits: 0,
          totalWithdrawals: 0,
          totalWins: 0,
          totalLosses: 0,
          netGamblingResult: 0,
        },
      );

      // Calculate net gambling result (wins - losses)
      summary.netGamblingResult = summary.totalWins - summary.totalLosses;

      // Calculate total balance across all currencies
      const totalBalance = balances.reduce(
        (sum, balance) => sum + balance.currentBalance,
        0,
      );

      return {
        totalBalance,
        currencyBalances: balances,
        summary,
      };
    } catch (error) {
      console.error("Error getting balance summary:", error);
      throw error;
    }
  },

  async getCurrencyBalance(
    userId: number,
    currencyId: number,
  ): Promise<PlayerBalance | null> {
    try {
      const balance = await this.calculatePlayerBalance(userId, currencyId);
      return balance;
    } catch (error) {
      console.error("Error getting currency balance:", error);
      throw error;
    }
  },
};
