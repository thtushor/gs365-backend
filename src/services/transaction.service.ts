import { eq, and, sql } from "drizzle-orm";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { settings } from "../db/schema/settings";
import { turnover } from "../db/schema/turnover";
import { promotions } from "../db/schema/promotions";
import { adminMainBalance, paymentProvider, paymentGatewayProvider, paymentGatewayProviderAccount, notifications, paymentGateway } from "../db/schema";
import { AdminMainBalanceModel } from "../models/adminMainBalance.model";
import { AutomatedPaymentService } from "./payment/AutomatedPaymentService";
import { getVexoraWayCode } from "../utils/vexoraMapping";
import { io } from "..";

export class TransactionService {
    /**
     * Updates a transaction status, applying all necessary side effects 
     * (turnover, promotions, admin main balances, etc).
     */
    static async updateStatus(
        id: number,
        status: "approved" | "pending" | "rejected",
        notes?: string | null,
        processedBy?: number | null,
        providerId?: number | null,
        rejectReasonId?: number | null,
        rejectReason?: string | null
    ) {
        return await db.transaction(async (tx) => {
            const validStatuses = ["approved", "pending", "rejected"] as const;
            if (!status || !(validStatuses as readonly string[]).includes(status)) {
                throw new Error(
                    "Invalid or missing status. Allowed: approved, pending, rejected"
                );
            }

            const [existing] = await tx
                .select()
                .from(transactions)
                .where(eq(transactions.id, id));
            if (!existing) {
                throw new Error("Transaction not found");
            }

            const updatePayload: any = {
                status: status as any,
                processedAt: new Date(),
            };
            if (processedBy) updatePayload.processedBy = Number(processedBy);
            if (typeof notes === "string") updatePayload.notes = notes;
            if (rejectReasonId) updatePayload.rejectReasonId = Number(rejectReasonId);
            if (rejectReason) updatePayload.rejectReason = rejectReason;

            let targetProvider: any = null;
            if (providerId) {
                const [providerExists] = await tx
                    .select()
                    .from(paymentProvider)
                    .where(eq(paymentProvider.id, providerId))
                    .limit(1);
                if (!providerExists) {
                    throw new Error("Payment provider not found");
                }
                targetProvider = providerExists;
                updatePayload.providerId = providerId;
            } else if (existing.providerId) {
                const [providerExists] = await tx
                    .select()
                    .from(paymentProvider)
                    .where(eq(paymentProvider.id, existing.providerId))
                    .limit(1);
                targetProvider = providerExists;
            }

            // Logic: Automatically update gateway status if it's a manual provider. 
            // If it's automated, we keep them isolated.
            if (!targetProvider || !targetProvider.isAutomated) {
                updatePayload.gatewayStatus = status as any;
            }

            await tx
                .update(transactions)
                .set(updatePayload)
                .where(eq(transactions.id, id));

            // --- NOTIFICATIONS SYSTEM ---
            // Rule 10: skip if partially successful (which the user says should be shown as pending)
            if (["approved", "rejected"].includes(status) && existing.status !== status) {
                try {
                    const isDeposit = existing.type === "deposit";
                    const isWithdraw = existing.type === "withdraw";
                    const isAdminProcessed = !!processedBy;
                    const isSystemProcessed = !processedBy;

                    // --- PLAYER NOTIFICATIONS ---
                    let playerTitle = "";
                    let playerDescription = "";
                    let shouldNotifyPlayer = false;

                    if (isWithdraw) {
                        // Rule 1 & Rule 2
                        shouldNotifyPlayer = true;
                        playerTitle = `Withdrawal ${status.charAt(0).toUpperCase() + status.slice(1)}`;
                        if (status === "approved") {
                            playerDescription = `Your withdrawal request of <strong>${existing.amount}</strong> has been <strong>approved</strong>.`;
                        } else {
                            // Include Rejection Reason + Refund Notice
                            const reason = rejectReason || notes || "No specific reason provided.";
                            playerDescription = `Your withdrawal request of <strong>${existing.amount}</strong> has been <strong>rejected</strong>.<br/>Reason: ${reason}<br/>Your amount has been refunded.`;
                        }
                    } else if (isDeposit) {
                        // Rule 8 & Rule 9
                        shouldNotifyPlayer = true;
                        playerTitle = `Deposit ${status.charAt(0).toUpperCase() + status.slice(1)}`;
                        if (status === "approved") {
                            playerDescription = `Your deposit request of <strong>${existing.amount}</strong> has been <strong>approved</strong>. Funds have been credited to your account.`;
                        } else {
                            playerDescription = `Your deposit request of <strong>${existing.amount}</strong> has been <strong>${status}</strong>.`;
                        }
                    }

                    if (shouldNotifyPlayer) {
                        const [notifResult] = await tx.insert(notifications).values({
                            notificationType: "admin_others", // players listen for these
                            title: playerTitle,
                            description: playerDescription,
                            playerIds: String(existing.userId),
                            link: `/players/${existing.userId}/profile/transactions`,
                            startDate: new Date(),
                            endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                            status: "active",
                            createdBy: Number(processedBy || 0),
                        } as any);

                        const notificationId = (notifResult as any).insertId || (notifResult as any).id;
                        io.emit(`user-notifications-${existing.userId}`, {
                            userId: Number(existing.userId),
                            event: "transaction_update",
                            notificationId,
                            refresh: true,
                        });
                    }

                    // --- ADMIN NOTIFICATIONS ---
                    // Rule 5 & Rule 6
                    if (isWithdraw && (status === "approved" || status === "rejected")) {
                        const isAutoCancel = status === "rejected" && notes?.toLowerCase().includes("auto-cancelled");
                        const adminTitle = isAutoCancel
                            ? `Withdrawal Auto-Cancelled: #${existing.customTransactionId}`
                            : `Withdrawal ${status.charAt(0).toUpperCase() + status.slice(1)}: #${existing.customTransactionId}`;

                        const adminDescription = `Withdrawal request for user #${existing.userId} has been ${status}.<br/>Amount: ${existing.amount}<br/>Method: ${isAutoCancel ? "System Timeout" : (isSystemProcessed ? "Gateway Response" : "Manual Admin Action")}`;

                        io.emit("admin-notifications", {
                            notificationType: "admin_player_transaction",
                            title: adminTitle,
                            description: adminDescription,
                        });
                    }

                } catch (notifErr) {
                    console.error("[TransactionService] Notification failed:", notifErr);
                }
            }

            // Handle Side Effects for Approved
            if (status === "approved") {
                // ... (rest of the side effects handled below in the original file)
                // Handle automated disbursement for Vexora
                // if (existing.type === "withdraw" && existing.status !== "approved") {
                if (existing.type === "withdraw") {
                    let providerToUse = targetProvider;

                    let gatewayToUse: any = null;
                    // If no manual providerId sent, fall back to the one linked via gateway
                    if (existing.paymentGatewayId) {
                        const [gatewayProviderData] = await tx
                            .select({
                                provider: paymentProvider,
                                gateway: paymentGateway,
                            })
                            .from(paymentGatewayProvider)
                            .leftJoin(
                                paymentProvider,
                                eq(paymentGatewayProvider.providerId, paymentProvider.id)
                            )
                            .leftJoin(
                                paymentGateway,
                                eq(paymentGateway.id, paymentGatewayProvider.gatewayId)
                            )
                            .where(eq(paymentGatewayProvider.gatewayId, existing.paymentGatewayId))
                            .limit(1);

                        if (!providerToUse) providerToUse = gatewayProviderData?.provider;
                        gatewayToUse = gatewayProviderData?.gateway;
                    }

                    console.log(`[TransactionService] Provider to use:`, providerToUse);
                    console.log(`[TransactionService] Gateway to use:`, gatewayToUse);

                    if (providerToUse?.isAutomated && providerToUse?.tag === "VEXORA") {
                        const wayCode = getVexoraWayCode(gatewayToUse?.name || "");
                        const walletId = existing.walletAddress || existing.accountNumber;

                        console.log(`[TransactionService] Way code:`, wayCode);
                        console.log(`[TransactionService] Wallet ID:`, walletId);

                        if (wayCode && walletId) {
                            try {
                                console.log(`[DISBURSE] Initiating automated disbursement for TXN ${existing.customTransactionId} via ${providerToUse.tag} (ID: ${providerToUse.id})`);
                                const disburseRes = await AutomatedPaymentService.disburse({
                                    provider: providerToUse,
                                    tradeNo: existing.customTransactionId!,
                                    amount: Number(existing.amount),
                                    wayCode: wayCode,
                                    walletId: walletId,
                                    remark: existing.notes || `Withdrawal for User ${existing.userId}`,
                                });

                                console.log(`[TransactionService] Disbursement response:`, disburseRes);

                                const vData = disburseRes.response;
                                // Vexora docs: 0000 is successful. Anything else is an error.
                                if (vData?.code !== "0000") {
                                    const msg = vData?.msg || "Unknown Vexora error";
                                    if (vData?.code === "5000") {
                                        throw new Error(`Vexora System Exception (5000): ${msg}. Status remains pending. Do NOT mark as failed manually.`);
                                    }
                                    throw new Error(`Vexora Error (${vData?.code || '8000'}): ${msg}`);
                                }

                                if (disburseRes.success) {
                                    const pTradeNo = disburseRes.response?.data?.platFormTradeNo;
                                    const tradeNo = disburseRes.response?.data?.tradeNo;
                                    await tx.update(transactions)
                                        .set({
                                            platFormTradeNo: pTradeNo,
                                            customTransactionId: tradeNo,
                                            notes: `${existing.notes || ''}\n[Vexora Disburse: ${pTradeNo}]`.trim()
                                        })
                                        .where(eq(transactions.id, id));
                                    console.log(`[DISBURSE] TXN ${existing.customTransactionId} disburse sent. PlatformTradeNo: ${pTradeNo}`);
                                }
                            } catch (error: any) {
                                console.error(`[DISBURSE] Automated disbursement failed for TXN ${existing.customTransactionId}:`, error.message);
                                // If it already has the Vexora prefix (from our manual throws above), re-throw
                                if (error.message.startsWith("Vexora ")) throw error;
                                // Otherwise, wrap connection/network errors to ensure they are visible in UI
                                throw new Error(`Vexora Request Failed: ${error.message}`);
                            }
                        } else {
                            console.warn(`[DISBURSE] Skipping automated disbursement for TXN ${existing.customTransactionId}: Missing wayCode (${wayCode}) or walletId (${walletId})`);
                        }
                    }
                }
                const baseAmount = Number(existing.amount);
                const userIdExisting = Number(existing.userId);

                // Settings lookup
                const [settingsRow] = await tx.select().from(settings).limit(1);
                const defaultTurnoverMultiply = Number(settingsRow?.defaultTurnover ?? 1);
                const defaultTarget = baseAmount * defaultTurnoverMultiply;

                // --- Default turnover ---
                if (existing.type === "deposit") {
                    const [existingDefaultTurnover] = await tx
                        .select()
                        .from(turnover)
                        .where(
                            and(eq(turnover.transactionId, id), eq(turnover.type, "default"))
                        );

                    if (existingDefaultTurnover) {
                        // Update
                        await tx
                            .update(turnover)
                            .set({
                                userId: userIdExisting,
                                status: "active",
                                depositAmount: baseAmount.toString(),
                                targetTurnover: defaultTarget.toString(),
                                remainingTurnover: defaultTarget.toString(),
                                turnoverName: `Deposited for TXN ${existing.customTransactionId}`,
                            })
                            .where(eq(turnover.id, existingDefaultTurnover.id));
                    } else {
                        // Insert
                        await tx.insert(turnover).values({
                            userId: userIdExisting,
                            transactionId: id,
                            type: "default",
                            status: "active",
                            turnoverName: `Deposited for TXN ${existing.customTransactionId}`,
                            depositAmount: baseAmount.toString(),
                            targetTurnover: defaultTarget.toString(),
                            remainingTurnover: defaultTarget.toString(),
                        } as any);
                    }
                }

                // --- Promotion turnover & bonus ---
                if (existing.promotionId && existing.type === "deposit") {
                    const [promo] = await tx
                        .select()
                        .from(promotions)
                        .where(eq(promotions.id, existing.promotionId));

                    if (promo) {
                        const bonusAmount = (baseAmount * Number(promo.bonus)) / 100;
                        const promoTarget = bonusAmount * Number(promo.turnoverMultiply ?? 1);

                        const [existingPromoTurnover] = await tx
                            .select()
                            .from(turnover)
                            .where(
                                and(
                                    eq(turnover.transactionId, id),
                                    eq(turnover.type, "promotion")
                                )
                            );

                        if (existingPromoTurnover) {
                            // Update
                            await tx
                                .update(turnover)
                                .set({
                                    userId: userIdExisting,
                                    status: "active",
                                    depositAmount: baseAmount.toString(),
                                    targetTurnover: promoTarget.toString(),
                                    remainingTurnover: promoTarget.toString(),
                                    turnoverName: `Promotion: ${promo.promotionName}`,
                                })
                                .where(eq(turnover.id, existingPromoTurnover.id));
                        } else {
                            // Insert
                            await tx.insert(turnover).values({
                                userId: userIdExisting,
                                transactionId: id,
                                type: "promotion",
                                status: "active",
                                turnoverName: `Promotion: ${promo.promotionName}`,
                                depositAmount: baseAmount.toString(),
                                targetTurnover: promoTarget.toString(),
                                remainingTurnover: promoTarget.toString(),
                            } as any);
                        }

                        // Always update transaction bonus amount
                        await tx
                            .update(transactions)
                            .set({ bonusAmount: bonusAmount.toString() })
                            .where(eq(transactions.id, id));

                        // --- Admin main balance for promotion ---
                        const [existingPromoBalance] =
                            await tx.query.adminMainBalance.findMany({
                                where: and(
                                    eq(adminMainBalance.transactionId, id),
                                    eq(adminMainBalance.type, "promotion")
                                ),
                            });

                        if (existingPromoBalance) {
                            await AdminMainBalanceModel.update(existingPromoBalance.id, {
                                amount: bonusAmount,
                                status: "approved",
                                promotionId: promo.id,
                                promotionName: promo.promotionName,
                                currencyId: existing.currencyId!,
                                notes: `Promotion bonus - ${promo.promotionName} (${promo.bonus}%)`,
                            }, tx);
                        } else {
                            await AdminMainBalanceModel.create({
                                amount: bonusAmount,
                                type: "promotion",
                                status: "approved",
                                promotionId: promo.id,
                                promotionName: promo.promotionName,
                                transactionId: id,
                                currencyId: existing.currencyId!,
                                notes: `Promotion bonus - ${promo.promotionName} (${promo.bonus}%)`,
                            }, tx);
                        }
                    }
                }

                // --- Admin main balance for deposit/withdraw ---
                const type =
                    existing?.type === "deposit"
                        ? "player_deposit"
                        : existing.type === "withdraw"
                            ? "player_withdraw"
                            : "promotion";

                const [existingMainBalance] = await tx.query.adminMainBalance.findMany({
                    where: and(
                        eq(adminMainBalance.transactionId, id),
                        eq(adminMainBalance.type, type as any)
                    ),
                });

                if (existingMainBalance) {
                    await AdminMainBalanceModel.update(existingMainBalance.id, {
                        amount: baseAmount,
                        status: "approved",
                        currencyId: existing.currencyId!,
                        notes: `Player ${type} - Transaction ID: ${existing.customTransactionId}`,
                    }, tx);
                } else {
                    await AdminMainBalanceModel.create({
                        amount: baseAmount,
                        type: type as any,
                        status: "approved",
                        transactionId: id,
                        currencyId: existing.currencyId!,
                        notes: `Player ${type} - Transaction ID: ${existing.customTransactionId}`,
                    }, tx);
                }
            }

            // --- REJECTED / PENDING ---
            if (["rejected", "pending"].includes(status)) {
                await tx
                    .update(turnover)
                    .set({ status: "inactive" })
                    .where(eq(turnover.transactionId, id));
            }

            // Always sync AdminMainBalance statuses
            await AdminMainBalanceModel.updateByTransactionId(id, {
                status: status as any,
            }, tx);

            const [updated] = await tx
                .select()
                .from(transactions)
                .where(eq(transactions.id, id));

            return updated;
        });
    }
}
