import { Request, Response } from "express";
import { eq, and } from "drizzle-orm";
import { db } from "../../db/connection";
import { transactions } from "../../db/schema/transactions";
import { TransactionService } from "../../services/transaction.service";
import { generateVexoraSign } from "../../services/vexora/sign.service";
import { vexoraWebhooks } from "../../db/schema/vexora.schema";

/**
 * Handles Vexora asynchronous notifications (Webhooks)
 * Used for both PayIn and Payout results
 */
export const vexoraNotifyController = async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        console.log("[VEXORA Webhook] Received notification:", payload);

        // 1. Log the webhook request
        await db.insert(vexoraWebhooks).values({
            tradeNo: payload.tradeNo,
            platFormTradeNo: payload.platFormTradeNo,
            status: payload.status,
            payload: payload,
        });

        // 2. Verify signature
        const receivedSign = payload.sign;
        const calculatedSign = generateVexoraSign(payload);

        if (receivedSign !== calculatedSign) {
            console.error("[VEXORA Webhook] Invalid signature detected.");
            // Vexora usually expects "success" even if signature fails to stop retries, 
            // but for security we should log it.
            return res.status(400).send("invalid signature");
        }

        const { tradeNo, status } = payload;

        // 3. Find transaction
        const [tx] = await db
            .select()
            .from(transactions)
            .where(eq(transactions.customTransactionId, tradeNo))
            .limit(1);

        if (!tx) {
            console.warn(`[VEXORA Webhook] Transaction ${tradeNo} not found.`);
            return res.send("success"); // Return success to stop retries
        }

        // 4. Update status based on Vexora status codes
        // 0000 = Success, 0001 = Partially Success
        if (status === "0000" || status === "0001") {
            if (tx.status !== "approved") {
                console.log(`[VEXORA Webhook] Approving TXN ${tradeNo} via notification`);
                await TransactionService.updateStatus(tx.id, "approved", "Approved via Vexora Webhook", null);
            }
        }
        // 00029 = Failed, 8000 = Request Failed
        else if (status === "00029" || status === "8000") {
            if (tx.status !== "rejected") {
                console.log(`[VEXORA Webhook] Rejecting TXN ${tradeNo} via notification (Status: ${status})`);
                await TransactionService.updateStatus(tx.id, "rejected", `Rejected via Vexora Webhook: Status ${status}`, null);
            }
        }

        return res.send("success");
    } catch (error: any) {
        console.error("[VEXORA Webhook] Error processing notification:", error.message);
        return res.status(500).send("error");
    }
};

/**
 * Handles the redirect after payment completion (Return URL)
 */
export const vexoraReturnController = async (req: Request, res: Response) => {
    try {
        const { tradeNo } = req.query; // Usually passed in query string on redirect
        console.log(`[VEXORA Return] User returned for TXN ${tradeNo}`);

        // Note: Return URL is just a client-side redirect. 
        // We should primarily rely on Notify URL, but we can do a quick check here too.

        if (tradeNo) {
            const [tx] = await db
                .select()
                .from(transactions)
                .where(eq(transactions.customTransactionId, tradeNo as string))
                .limit(1);

            if (tx && tx.status === "pending") {
                // Optional: Trigger a manual poll check here if needed to speed up UI transition
                console.log(`[VEXORA Return] TXN ${tradeNo} is still pending. Wait for webhook or cron.`);
            }
        }

        // Redirect user to the frontend success page
        return res.redirect("https://gamestar365.com/success");
    } catch (error: any) {
        console.error("[VEXORA Return] Error:", error.message);
        return res.redirect("https://gamestar365.com/failed");
    }
};
