import { eq, and, isNotNull, like, notLike } from "drizzle-orm";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { TransactionService } from "../services/transaction.service";
import { vexoraSandboxClient } from "../services/vexora/vexoraSandbox.service";
import { generateVexoraSign } from "../services/vexora/sign.service";
import { getTimestamp } from "../utils/timestamp";
import { ICronJob } from "./types";

export const vexoraPayoutQueryJob: ICronJob = {
    name: "Vexora Payout Query",
    schedule: "*/2 * * * *", // Every 2 minutes
    execute: async () => {
        console.log("[Vexora Payout Cron] Fetching active withdrawals...");

        // Find withdrawals that are approved but not yet finalized by Vexora
        const pendingPayouts = await db
            .select()
            .from(transactions)
            .where(
                and(
                    eq(transactions.type, "withdraw"),
                    eq(transactions.status, "approved"),
                    isNotNull(transactions.tradeNo),
                    like(transactions.tradeNo, "VEX_%"),
                    notLike(transactions.notes, "%[Vexora: Completed]%") // Don't check finished ones
                )
            );

        console.log(`[Vexora Payout Cron] Found ${pendingPayouts.length} withdrawals to check.`);

        if (pendingPayouts.length === 0) {
            return;
        }

        for (const tx of pendingPayouts) {
            try {
                const timestamp = getTimestamp();
                const payload = {
                    tradeNo: tx.tradeNo,
                    timestamp,
                };

                const sign = generateVexoraSign(payload);
                const requestBody = { ...payload, sign };

                const { data } = await vexoraSandboxClient.post(
                    "/v1/vexora/queryPayOutResult",
                    requestBody
                );

                console.log(`[Vexora Payout Cron] Response for tradeNo ${tx.tradeNo}:`, data);

                if (data?.code === "0000") {
                    const status = data?.data?.status;

                    if (status === "0000" || status === "0001") {
                        console.log(`[Vexora Payout Cron] Payout ${tx.tradeNo} confirmed success.`);
                        // Add completion note so we don't check it again
                        await db.update(transactions)
                            .set({
                                notes: `${tx.notes || ''}\n[Vexora: Completed]`.trim(),
                                status: "approved",
                            })
                            .where(eq(transactions.id, tx.id));
                    } else if (status === "00029") {
                        console.log(`[Vexora Payout Cron] Payout ${tx.tradeNo} failed (00029). Reverting transaction.`);
                        await TransactionService.updateStatus(tx.id, "rejected", "Auto-rejected: Vexora Payout Failed (Status 00029)", null);
                    } else if (status === "0015") {
                        console.log(`[Vexora Payout Cron] Payout ${tx.tradeNo} still in progress (0015).`);
                    }
                } else if (data?.code === "8000") {
                    console.log(`[Vexora Payout Cron] Payout ${tx.tradeNo} failed (8000). Reverting transaction.`);
                    await TransactionService.updateStatus(tx.id, "rejected", `Auto-rejected: Vexora Payout Failed (${data.msg})`, null);
                } else if (data?.code === "5000") {
                    console.warn(`[Vexora Payout Cron] System Exception (5000) for ${tx.tradeNo}. Retrying later.`);
                }
            } catch (error: any) {
                console.error(`[Vexora Payout Cron] Error querying tradeNo ${tx.tradeNo}:`, error?.response?.data || error?.message);
            }
        }
    }
};
