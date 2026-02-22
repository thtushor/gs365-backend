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

export class AffiliateBalanceModel {
    /**
     * Calculates balance and statistics for a specific affiliate.
     * 
     * Formula:
     * - Lifetime Profit: Total commission where bet result is 'loss'
     * - Lifetime Loss: Total commission where bet result is 'win'
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
                    loss: sql<number>`COALESCE(SUM(CASE WHEN ${betResults.betStatus} = 'win' THEN ${commission.commissionAmount} ELSE 0 END), 0)`,
                })
                .from(commission)
                .leftJoin(betResults, eq(commission.betResultId, betResults.id))
                .where(eq(commission.adminUserId, affiliateId));

            const lifetimeProfit = Number(commissionStats?.profit || 0);
            const lifetimeLoss = Number(commissionStats?.loss || 0);

            // 2. Calculate Lifetime Withdraw and Pending Withdrawals from transactions
            const [txStats] = await db
                .select({
                    totalWithdraw: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.type} = 'withdraw' AND ${transactions.status} = 'approved' THEN ${transactions.amount} ELSE 0 END), 0)`,
                    pendingWithdraw: sql<number>`COALESCE(SUM(CASE WHEN ${transactions.status} = 'pending' THEN ${transactions.amount} ELSE 0 END), 0)`,
                })
                .from(transactions)
                .where(eq(transactions.affiliateId, affiliateId));

            const lifetimeWithdraw = Number(txStats?.totalWithdraw || 0);
            const pendingWithdrawal = Number(txStats?.pendingWithdraw || 0);

            // 3. Calculate Current Balance
            const currentBalance = lifetimeProfit - lifetimeLoss - lifetimeWithdraw;

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
}
