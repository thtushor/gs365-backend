import cron from "node-cron";
import { eq, and, isNotNull } from "drizzle-orm";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { TransactionService } from "../services/transaction.service";
import { vexoraSandboxClient } from "../services/vexora/vexoraSandbox.service";
import { generateVexoraSign } from "../services/vexora/sign.service";
import { getTimestamp } from "../utils/timestamp";

export const scheduleVexoraPayinQueryJob = () => {
    // every 1 minute
    cron.schedule("* * * * *", async () => {
        try {
            const pendingTransactions = await db
                .select()
                .from(transactions)
                .where(
                    and(
                        eq(transactions.status, "pending"),
                        isNotNull(transactions.tradeNo)
                    )
                );

            if (pendingTransactions.length === 0) {
                return;
            }

            for (const tx of pendingTransactions) {
                try {
                    const timestamp = getTimestamp();
                    const payload = {
                        tradeNo: tx.tradeNo,
                        timestamp,
                    };

                    const sign = generateVexoraSign(payload);
                    const requestBody = { ...payload, sign };

                    const { data } = await vexoraSandboxClient.post(
                        "/v1/vexora/queryPayInResult",
                        requestBody
                    );

                    if (data?.code === "0000" && data?.data?.status === "0000") {
                        console.log(`[CRON] Auto-approving transaction ${tx.id} (tradeNo: ${tx.tradeNo})`);
                        await TransactionService.updateStatus(tx.id, "approved", "Auto-approved by Vexora Cron", null);
                    } else if (data?.code === "0000" && data?.data?.status === "0008") {
                        // 0008 might be failed/closed, but the prompt only asked for auto-approval.
                        console.log(`[CRON] Auto-failed transaction ${tx.id} (tradeNo: ${tx.tradeNo})`);
                        await TransactionService.updateStatus(tx.id, "rejected", "Auto-rejected by Vexora Cron", null);
                    }
                } catch (error: any) {
                    console.error(`[CRON] Error querying tradeNo ${tx.tradeNo}:`, error?.response?.data || error?.message);
                }
            }
        } catch (error) {
            console.error("[CRON] Main Vexora PayIn Query Job Error:", error);
        }
    });
    console.log("[CRON] Vexora PayIn Query Job scheduled");
};
