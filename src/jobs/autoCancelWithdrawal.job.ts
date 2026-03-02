import { and, eq, sql, isNotNull } from "drizzle-orm";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { settings } from "../db/schema/settings";
import { TransactionService } from "../services/transaction.service";
import { ICronJob } from "./types";

const timeoutMap: Record<string, number> = {
    "30 min": 30,
    "1 hour": 60,
    "2 hours": 120,
    "3 hours": 180,
    "5 hours": 300,
    "7 hours": 420,
    "12 hours": 720,
    "24 hours": 1440,
};

export const autoCancelWithdrawalJob: ICronJob = {
    name: "Auto-Cancel Pending Withdrawals",
    schedule: "*/5 * * * *", // Run every 5 minutes
    execute: async () => {
        const [settingsRow] = await db.select().from(settings).limit(1);
        if (!settingsRow || !settingsRow.withdrawalTimeout || settingsRow.withdrawalTimeout === "Disabled") {
            return;
        }

        const timeoutMinutes = timeoutMap[settingsRow.withdrawalTimeout];
        if (!timeoutMinutes) return;

        const now = new Date();
        const cutoff = new Date(now.getTime() - timeoutMinutes * 60 * 1000);

        // Find pending player withdrawals older than cutoff
        const pendingWithdrawals = await db
            .select({ id: transactions.id })
            .from(transactions)
            .where(
                and(
                    eq(transactions.type, "withdraw"),
                    eq(transactions.status, "pending"),
                    isNotNull(transactions.userId),
                    sql`${transactions.createdAt} < ${cutoff}`
                )
            );

        if (pendingWithdrawals.length === 0) return;

        console.log(`[CRON] Found ${pendingWithdrawals.length} pending withdrawals to auto-cancel.`);

        for (const txn of pendingWithdrawals) {
            try {
                // For players, use TransactionService which handles side effects
                await TransactionService.updateStatus(
                    txn.id,
                    "rejected",
                    `Auto-cancelled by system (Timeout: ${settingsRow.withdrawalTimeout})`,
                    null
                );
                console.log(`[CRON] Auto-cancelled withdrawal ID: ${txn.id}`);
            } catch (error) {
                console.error(`[CRON] Failed to auto-cancel withdrawal ID: ${txn.id}`, error);
            }
        }
    },
};
