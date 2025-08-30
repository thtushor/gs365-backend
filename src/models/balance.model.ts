import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { currencies } from "../db/schema/currency";
import { promotions } from "../db/schema";

export interface PlayerBalance {
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
}

export interface BalanceFilters {
  userId?: number;
  currencyId?: number;
  status?: "all" | "approved" | "pending";
}

export const BalanceModel = {
  async calculatePlayerBalance(userId: number, currencyId?: number): Promise<PlayerBalance> {
    try {
      let whereConditions = [eq(transactions.userId, userId)];
      
      if (currencyId) {
        whereConditions.push(eq(transactions.currencyId, currencyId));
      }

      const result = await db
        .select({
          totalDeposits: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'deposit' 
              AND ${transactions.status} = 'approved' 
              THEN ${transactions.amount} ELSE 0 END), 0)
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
              THEN ${transactions.amount} ELSE 0 END), 0)
          `,
          pendingWithdrawals: sql<number>`
            COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdraw' 
              AND ${transactions.status} = 'pending' 
              THEN ${transactions.amount} ELSE 0 END), 0)
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
          totalWithdrawals: 0,
          totalWins: 0,
          totalLosses: 0,
          currentBalance: 0,
          pendingDeposits: 0,
          pendingWithdrawals: 0,
          approvedDeposits: 0,
          approvedWithdrawals: 0,
        };
      }

      const row = result[0];
      const totalDeposits = Number(row.totalDeposits);
      const totalWithdrawals = Number(row.totalWithdrawals);
      const totalWins = Number(row.totalWins);
      const totalLosses = Number(row.totalLosses);
      const pendingDeposits = Number(row.pendingDeposits);
      const pendingWithdrawals = Number(row.pendingWithdrawals);

      // Calculate current balance: deposits + wins - withdrawals - losses
      const currentBalance = totalDeposits + totalWins - totalWithdrawals - totalLosses;

      return {
        currencyCode: "N/A", // Will be updated if currency info is needed
        totalDeposits,
        totalWithdrawals,
        totalWins,
        totalLosses,
        currentBalance,
        pendingDeposits,
        pendingWithdrawals,
        approvedDeposits: totalDeposits,
        approvedWithdrawals: totalWithdrawals,
      };
    } catch (error) {
      console.error("Error calculating player balance:", error);
      throw error;
    }
  },

  async calculateAllPlayerBalances(filters: BalanceFilters = {}): Promise<PlayerBalance[]> {
    try {
      let whereConditions = [];
      
      if (filters.userId) {
        whereConditions.push(eq(transactions.userId, filters.userId));
      }
      
      if (filters.currencyId) {
        whereConditions.push(eq(transactions.currencyId, filters.currencyId));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const balanceQuery = sql`
        SELECT 
          t.user_id as userId,
          t.currency_id as currencyId,
          c.code as currencyCode,
          COALESCE(SUM(CASE WHEN t.type = 'deposit' AND t.status = 'approved' THEN t.amount ELSE 0 END), 0) as totalDeposits,
          COALESCE(SUM(CASE WHEN t.type = 'withdraw' AND t.status = 'approved' THEN t.amount ELSE 0 END), 0) as totalWithdrawals,
          COALESCE(SUM(CASE WHEN t.type = 'win' AND t.status = 'approved' THEN t.amount ELSE 0 END), 0) as totalWins,
          COALESCE(SUM(CASE WHEN t.type = 'loss' AND t.status = 'approved' THEN t.amount ELSE 0 END), 0) as totalLosses,
          COALESCE(SUM(CASE WHEN t.type = 'deposit' AND t.status = 'pending' THEN t.amount ELSE 0 END), 0) as pendingDeposits,
          COALESCE(SUM(CASE WHEN t.type = 'withdraw' AND t.status = 'pending' THEN t.amount ELSE 0 END), 0) as pendingWithdrawals
        FROM transactions t
        LEFT JOIN currencies c ON t.currency_id = c.id
        ${whereClause ? sql`WHERE ${whereClause}` : sql``}
        GROUP BY t.user_id, t.currency_id, c.code
        ORDER BY t.user_id, t.currency_id
      `;

      const result = await db.execute(balanceQuery);
      
      return result.map((row: any) => {
        const totalDeposits = Number(row.totalDeposits);
        const totalWithdrawals = Number(row.totalWithdrawals);
        const totalWins = Number(row.totalWins);
        const totalLosses = Number(row.totalLosses);
        const pendingDeposits = Number(row.pendingDeposits);
        const pendingWithdrawals = Number(row.pendingWithdrawals);

        // Calculate current balance: deposits + wins - withdrawals - losses
        const currentBalance = totalDeposits + totalWins - totalWithdrawals - totalLosses;

        return {
          userId: Number(row.userId),
          currencyId: Number(row.currencyId),
          currencyCode: row.currencyCode,
          totalDeposits,
          totalWithdrawals,
          totalWins,
          totalLosses,
          currentBalance,
          pendingDeposits,
          pendingWithdrawals,
          approvedDeposits: totalDeposits,
          approvedWithdrawals: totalWithdrawals,
        };
      });
    } catch (error) {
      console.error("Error calculating all player balances:", error);
      throw error;
    }
  },

  async getBalanceSummary(userId: number): Promise<{
    totalBalance: number;
    currencyBalances: PlayerBalance[];
    summary: {
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
      
      const summary = balances.reduce((acc, balance) => {
        acc.totalDeposits += balance.totalDeposits;
        acc.totalWithdrawals += balance.totalWithdrawals;
        acc.totalWins += balance.totalWins;
        acc.totalLosses += balance.totalLosses;
        return acc;
      }, {
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalWins: 0,
        totalLosses: 0,
        netGamblingResult: 0,
      });

      // Calculate net gambling result (wins - losses)
      summary.netGamblingResult = summary.totalWins - summary.totalLosses;
      
      // Calculate total balance across all currencies
      const totalBalance = balances.reduce((sum, balance) => sum + balance.currentBalance, 0);

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

  async getCurrencyBalance(userId: number, currencyId: number): Promise<PlayerBalance | null> {
    try {
      const balance = await this.calculatePlayerBalance(userId, currencyId);
      return balance;
    } catch (error) {
      console.error("Error getting currency balance:", error);
      throw error;
    }
  },
};
