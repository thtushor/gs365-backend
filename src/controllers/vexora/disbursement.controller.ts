// controllers/vexora/disbursement.controller.ts
import { Request, Response } from "express";
import { db } from "../../db/connection";
import { vexoraPayouts } from "../../db/schema";
import { vexoraSandboxClient } from "../../services/vexora/vexoraSandbox.service";
import { generateVexoraSign } from "../../services/vexora/sign.service";
import { getTimestamp } from "../../utils/timestamp";

export const disbursementController = async (req: Request, res: Response) => {
  try {
    const { tradeNo, amount, wayCode, walletId, notifyUrl, remark } = req.body;

    if (!tradeNo || !amount || !wayCode || !walletId) {
      return res.status(400).json({
        success: false,
        message: "tradeNo, amount, wayCode, and walletId are required",
      });
    }

    const timestamp = getTimestamp();

    // Fields in alphabetical order (important for sign!)
    const payload: Record<string, any> = {
      amount: String(amount), // must be string
      notifyUrl: notifyUrl || "https://yourdomain.com/notify-payout",
      remark: remark || "",
      timestamp,
      tradeNo,
      walletId,
      wayCode, // BKASH, NAGAD, etc.
    };

    const sign = generateVexoraSign(payload);

    const requestBody = {
      ...payload,
      sign,
    };

    const { data } = await vexoraSandboxClient.post(
      "/v1/vexora/disbursements",
      requestBody,
    );

    // Save initial record
    await db.insert(vexoraPayouts).values({
      tradeNo,
      platFormTradeNo: data?.data?.platFormTradeNo ?? null,
      walletId,
      wayCode,
      amount: String(amount),
      status: data?.data?.status ?? "PENDING",
      remark: remark || null,
      rawResponse: data,
    });

    return res.json({
      success: true,
      request: requestBody,
      response: data,
      note: "Payout request submitted. Final result via webhook or status check.",
    });
  } catch (error: any) {
    console.error("Vexora disbursement error:", error?.response?.data || error);

    return res.status(500).json({
      success: false,
      message: "Disbursement request failed",
      error: error?.response?.data || error?.message,
    });
  }
};
