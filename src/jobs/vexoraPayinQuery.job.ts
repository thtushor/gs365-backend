import { eq, and, isNotNull } from "drizzle-orm";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { paymentProvider } from "../db/schema/paymentProvider";
import { TransactionService } from "../services/transaction.service";
import { vexoraSandboxClient } from "../services/vexora/vexoraSandbox.service";
import { generateVexoraSign } from "../services/vexora/sign.service";
import { getTimestamp } from "../utils/timestamp";
import { ICronJob } from "./types";

export const vexoraPayinQueryJob: ICronJob = {
    name: "Vexora PayIn Query",
    schedule: "* * * * *", // Every minute
    execute: async () => {
        console.log("[Vexora Cron] Fetching pending transactions...");
        const pendingTransactions = await db
            .select({
                id: transactions.id,
                tradeNo: transactions.customTransactionId,
                status: transactions.status,
            })
            .from(transactions)
            .innerJoin(paymentProvider, eq(transactions.providerId, paymentProvider.id))
            .where(
                and(
                    eq(transactions.status, "pending"),
                    eq(paymentProvider.tag, "VEXORA"),
                    eq(paymentProvider.isAutomated, true),
                    isNotNull(transactions.customTransactionId)
                )
            );

        console.log(`[Vexora Cron] Found ${pendingTransactions.length} pending transactions with customTransactionId.`);

        if (pendingTransactions.length === 0) {
            console.log("[Vexora Cron] No pending transactions to process.");
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

                console.log(`[Vexora Cron] Response for tradeNo ${tx.tradeNo}:`, data);

                if (data?.code === "8000") {
                    console.log(`[CRON] Auto-rejecting transaction ${tx.id} (tradeNo: ${tx.tradeNo}) - Code 8000: ${data.msg}`);
                    await TransactionService.updateStatus(tx.id, "rejected", `Auto-rejected by Vexora Cron: ${data.msg || 'Request Failed'}`, null);
                } else if (data?.code === "0000") {
                    const status = data?.data?.status;
                    if (status === "0000" || status === "0001") {
                        console.log(`[CRON] Auto-approving transaction ${tx.id} (tradeNo: ${tx.tradeNo})`);
                        await TransactionService.updateStatus(tx.id, "approved", "Auto-approved by Vexora Cron", null);
                    } else if (status === "00029") {
                        console.log(`[CRON] Auto-failing transaction ${tx.id} (tradeNo: ${tx.tradeNo}) - Status 00029`);
                        await TransactionService.updateStatus(tx.id, "rejected", "Auto-rejected by Vexora Cron: Transaction Failed", null);
                    } else if (status === "0015") {
                        console.log(`[CRON] Transaction ${tx.id} (tradeNo: ${tx.tradeNo}) is still in progress (0015).`);
                    }
                } else if (data?.code === "5000") {
                    console.warn(`[CRON] System Exception (5000) for tradeNo ${tx.tradeNo}. Staying pending.`);
                }
            } catch (error: any) {
                console.error(`[CRON] Error querying tradeNo ${tx.tradeNo}:`, error?.response?.data || error?.message);
            }
        }
    }
};
