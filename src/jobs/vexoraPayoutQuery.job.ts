import { eq, and, isNotNull, like, notLike } from "drizzle-orm";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { notifications } from "../db/schema/notifications";
import { paymentProvider } from "../db/schema/paymentProvider";
import { TransactionService } from "../services/transaction.service";
import { vexoraSandboxClient } from "../services/vexora/vexoraSandbox.service";
import { generateVexoraSign } from "../services/vexora/sign.service";
import { getTimestamp } from "../utils/timestamp";
import { ICronJob } from "./types";
import { io } from "..";

export const vexoraPayoutQueryJob: ICronJob = {
    name: "Vexora Payout Query",
    schedule: "*/2 * * * *", // Every 2 minutes
    execute: async () => {
        console.log("[Vexora Payout Cron] Fetching active withdrawals...");

        // Find withdrawals that are approved but not yet finalized by Vexora
        const pendingPayouts = await db
            .select({
                id: transactions.id,
                tradeNo: transactions.customTransactionId,
                notes: transactions.notes,
                userId: transactions.userId,
                amount: transactions.amount,
            })
            .from(transactions)
            .innerJoin(paymentProvider, eq(transactions.providerId, paymentProvider.id))
            .where(
                and(
                    eq(transactions.type, "withdraw"),
                    eq(transactions.status, "approved"),
                    eq(paymentProvider.tag, "VEXORA"),
                    isNotNull(transactions.customTransactionId),
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
                                gatewayStatus: "approved",
                            })
                            .where(eq(transactions.id, tx.id));

                        // Notify via status update (note: notification logic is now handled here directly)
                        await TransactionService.updateStatus(tx.id, "approved", `${tx.notes || ''}\n[Vexora: Completed]`.trim(), null);

                        // --- Automatic Notification to Player ---
                        try {
                            const [newNotif] = await db.insert(notifications).values({
                                notificationType: "admin_others",
                                title: `Withdrawal Completed`,
                                description: `Your withdrawal request of <strong>${tx.amount}</strong> has been successfully completed. (ID: ${tx.tradeNo})`,
                                playerIds: String(tx.userId),
                                link: `/players/${tx.userId}/profile/transactions`,
                                startDate: new Date(),
                                endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                                status: "active",
                                createdBy: 0,
                            } as any);

                            const nId = (newNotif as any).insertId || (newNotif as any).id;
                            io.emit(`user-notifications-${tx.userId}`, {
                                userId: Number(tx.userId),
                                event: "notification_created",
                                notificationId: nId,
                                refresh: true,
                            });
                        } catch (notifErr) {
                            console.error(`[Vexora Payout Cron] Failed to send notification for TXN ${tx.id}:`, notifErr);
                        }
                    } else if (status === "00029") {
                        console.log(`[Vexora Payout Cron] Payout ${tx.tradeNo} failed (00029). Reverting transaction.`);
                        // await db.update(transactions).set({ gatewayStatus: "rejected" }).where(eq(transactions.id, tx.id));
                        // await TransactionService.updateStatus(tx.id, "rejected", "Auto-rejected: Vexora Payout Failed (Status 00029)", null);
                    } else if (status === "0015") {
                        console.log(`[Vexora Payout Cron] Payout ${tx.tradeNo} still in progress (0015).`);
                        // UPDATE ONLY GATEWAY STATUS
                        await db.update(transactions).set({ gatewayStatus: "pending" }).where(eq(transactions.id, tx.id));
                    }
                } else if (data?.code === "8000") {
                    console.log(`[Vexora Payout Cron] Payout ${tx.tradeNo} failed (8000). Reverting transaction.`);
                    // await db.update(transactions).set({ gatewayStatus: "rejected" }).where(eq(transactions.id, tx.id));
                    // await TransactionService.updateStatus(tx.id, "rejected", `Auto-rejected: Vexora Payout Failed (${data.msg})`, null);
                } else if (data?.code === "5000") {
                    console.warn(`[Vexora Payout Cron] System Exception (5000) for ${tx.tradeNo}. Retrying later.`);
                }
            } catch (error: any) {
                console.error(`[Vexora Payout Cron] Error querying tradeNo ${tx.tradeNo}:`, error?.response?.data || error?.message);
            }
        }
    }
};
