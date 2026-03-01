import { eq, and } from "drizzle-orm";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { settings } from "../db/schema/settings";
import { turnover } from "../db/schema/turnover";
import { promotions } from "../db/schema/promotions";
import { adminMainBalance } from "../db/schema";
import { AdminMainBalanceModel } from "../models/adminMainBalance.model";

export class TransactionService {
    /**
     * Updates a transaction status, applying all necessary side effects 
     * (turnover, promotions, admin main balances, etc).
     */
    static async updateStatus(
        id: number,
        status: "approved" | "pending" | "rejected",
        notes?: string | null,
        processedBy?: number | null
    ) {
        const validStatuses = ["approved", "pending", "rejected"] as const;
        if (!status || !(validStatuses as readonly string[]).includes(status)) {
            throw new Error(
                "Invalid or missing status. Allowed: approved, pending, rejected"
            );
        }

        const [existing] = await db
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

        await db
            .update(transactions)
            .set(updatePayload)
            .where(eq(transactions.id, id));

        // --- APPROVED FLOW ---
        if (status === "approved") {
            const baseAmount = Number(existing.amount);
            const userIdExisting = Number(existing.userId);

            // Settings lookup
            const [settingsRow] = await db.select().from(settings).limit(1);
            const defaultTurnoverMultiply = Number(settingsRow?.defaultTurnover ?? 1);
            const defaultTarget = baseAmount * defaultTurnoverMultiply;

            // --- Default turnover ---
            if (existing.type === "deposit") {
                const [existingDefaultTurnover] = await db
                    .select()
                    .from(turnover)
                    .where(
                        and(eq(turnover.transactionId, id), eq(turnover.type, "default"))
                    );

                if (existingDefaultTurnover) {
                    // Update
                    await db
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
                    await db.insert(turnover).values({
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
                const [promo] = await db
                    .select()
                    .from(promotions)
                    .where(eq(promotions.id, existing.promotionId));

                if (promo) {
                    const bonusAmount = (baseAmount * Number(promo.bonus)) / 100;
                    const promoTarget = bonusAmount * Number(promo.turnoverMultiply ?? 1);

                    const [existingPromoTurnover] = await db
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
                        await db
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
                        await db.insert(turnover).values({
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
                    await db
                        .update(transactions)
                        .set({ bonusAmount: bonusAmount.toString() })
                        .where(eq(transactions.id, id));

                    // --- Admin main balance for promotion ---
                    const [existingPromoBalance] =
                        await db.query.adminMainBalance.findMany({
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
                        });
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
                        });
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

            const [existingMainBalance] = await db.query.adminMainBalance.findMany({
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
                });
            } else {
                await AdminMainBalanceModel.create({
                    amount: baseAmount,
                    type: type as any,
                    status: "approved",
                    transactionId: id,
                    currencyId: existing.currencyId!,
                    notes: `Player ${type} - Transaction ID: ${existing.customTransactionId}`,
                });
            }
        }

        // --- REJECTED / PENDING ---
        if (["rejected", "pending"].includes(status)) {
            await db
                .update(turnover)
                .set({ status: "inactive" })
                .where(eq(turnover.transactionId, id));
        }

        // Always sync AdminMainBalance statuses
        await AdminMainBalanceModel.updateByTransactionId(id, {
            status: status as any,
        });

        const [updated] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.id, id));

        return updated;
    }
}
