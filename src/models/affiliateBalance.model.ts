import { eq, sql } from "drizzle-orm";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { commission, betResults } from "../db/schema";

export interface AffiliateBalance {
    lifetimeProfit: number;
    lifetimeLoss: number;
    lifetimeWithdraw: number;
    currentBalance: number;
    pendingWithdrawal: number;
}

export interface DetailedAffiliateStats {
    totalProfit: number;
    totalLoss: number;
    totalCommission: number;
    settledProfit: number;
    settledLoss: number;
    settledCommission: number;
    totalWithdraw: number;
    settledWithdraw: number;
    pendingWithdraw: number;
    rejectedWithdraw: number;
}

export class AffiliateBalanceModel {
    /**
     * Calculates balance and statistics for a specific affiliate.
     * 
     * Formula:
     * - Lifetime Profit: Total commission where bet result is 'loss' AND commission status is 'approved'
     * - Lifetime Loss: Total commission where bet result is 'win' AND commission status is 'approved'
     * - Lifetime Withdraw: Total approved withdrawals for the affiliate
     * - Current Balance: Lifetime Profit - Lifetime Loss - Lifetime Withdraw
     * - Pending Withdrawal: Total transactions for the affiliate that are currently 'pending'
     * 
     * @param affiliateId The ID of the affiliate (admin user)
     * @returns AffiliateBalance object containing calculated stats
     */
    static async calculateAffiliateBalance(affiliateId: number): Promise<AffiliateBalance> {
        try {
            // 1. Calculate Lifetime Profit and Loss from commissions
            const [commissionStats] = await db
                .select({
                    profit: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${commission.commissionAmount} ELSE 0 END), 0)`,
                    loss: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${commission.commissionAmount} ELSE 0 END)), 0)`,
                })
                .from(commission)
                .leftJoin(betResults, eq(commission.betResultId, betResults.id))
                .where(
                    sql`${commission.adminUserId} = ${affiliateId} AND ${commission.status} = 'approved'`
                );

            const lifetimeProfit = Number(commissionStats?.profit || 0);
            const lifetimeLoss = Number(commissionStats?.loss || 0);

            // 2. Calculate Lifetime Withdraw and Pending Withdrawals from transactions
            const [txStats] = await db
                .select({
                    totalWithdraw: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdraw' AND ${transactions.status} = 'approved' AND ${transactions.settledByTransactionId} IS NULL THEN ${transactions.amount} ELSE 0 END), 0)`,
                    pendingWithdraw: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.status} = 'pending' THEN ${transactions.amount} ELSE 0 END), 0)`,
                })
                .from(transactions)
                .where(eq(transactions.affiliateId, affiliateId));

            const lifetimeWithdraw = Number(txStats?.totalWithdraw || 0);
            const pendingWithdrawal = Number(txStats?.pendingWithdraw || 0);

            // 3. Calculate Current Balance (Available for withdrawal)
            // Subtract both approved and pending withdrawals to prevent double-withdrawing
            const currentBalance = lifetimeProfit - lifetimeLoss - lifetimeWithdraw - pendingWithdrawal;

            return {
                lifetimeProfit,
                lifetimeLoss,
                lifetimeWithdraw,
                currentBalance,
                pendingWithdrawal,
            };
        } catch (error) {
            console.error("Error calculating affiliate balance:", error);
            throw error;
        }
    }

    /**
     * Fetches detailed statistics for an affiliate including commissions and withdrawals.
     * 
     * @param affiliateId The ID of the affiliate
     * @returns Detailed statistics object
     */
    static async getDetailedAffiliateStats(affiliateId: number): Promise<DetailedAffiliateStats> {
        try {
            // 1. Commission Statistics
            const [commissionStats] = await db
                .select({
                    totalProfit: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'loss' THEN ${commission.commissionAmount} ELSE 0 END), 0)`,
                    totalLoss: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${commission.commissionAmount} ELSE 0 END)), 0)`,
                    settledProfit: sql<number>`COALESCE(SUM(CASE WHEN ${commission.status} = 'settled' AND ${betResults.betStatus} = 'loss' THEN ${commission.commissionAmount} ELSE 0 END), 0)`,
                    settledLoss: sql<number>`COALESCE(ABS(SUM(CASE WHEN ${commission.status} = 'settled' AND ${betResults.betStatus} = 'win' THEN ${commission.commissionAmount} ELSE 0 END)), 0)`,
                })
                .from(commission)
                .leftJoin(betResults, eq(commission.betResultId, betResults.id))
                .where(eq(commission.adminUserId, affiliateId));

            const totalProfit = Number(commissionStats?.totalProfit || 0);
            const totalLoss = Number(commissionStats?.totalLoss || 0);
            const settledProfit = Number(commissionStats?.settledProfit || 0);
            const settledLoss = Number(commissionStats?.settledLoss || 0);

            // 2. Withdrawal Statistics
            const [withdrawStats] = await db
                .select({
                    totalWithdraw: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.status} = 'approved' THEN ${transactions.amount} ELSE 0 END), 0)`,
                    settledWithdraw: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.status} = 'approved' AND ${transactions.settledByTransactionId} IS NOT NULL THEN ${transactions.amount} ELSE 0 END), 0)`,
                    pendingWithdraw: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.status} = 'pending' THEN ${transactions.amount} ELSE 0 END), 0)`,
                    rejectedWithdraw: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.status} = 'rejected' THEN ${transactions.amount} ELSE 0 END), 0)`,
                })
                .from(transactions)
                .where(
                    sql`${transactions.affiliateId} = ${affiliateId} AND ${transactions.type} = 'withdraw'`
                );

            return {
                totalProfit,
                totalLoss,
                totalCommission: totalProfit - totalLoss,
                settledProfit,
                settledLoss,
                settledCommission: settledProfit - settledLoss,
                totalWithdraw: Number(withdrawStats?.totalWithdraw || 0),
                settledWithdraw: Number(withdrawStats?.settledWithdraw || 0),
                pendingWithdraw: Number(withdrawStats?.pendingWithdraw || 0),
                rejectedWithdraw: Number(withdrawStats?.rejectedWithdraw || 0),
            };
        } catch (error) {
            console.error("Error fetching detailed affiliate stats:", error);
            throw error;
        }
    }
}
