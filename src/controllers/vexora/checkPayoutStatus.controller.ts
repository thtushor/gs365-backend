// controllers/vexora/checkPayoutStatus.controller.ts
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db } from "../../db/connection";
import { vexoraPayouts } from "../../db/schema";
import { vexoraSandboxClient } from "../../services/vexora/vexoraSandbox.service";
import { generateVexoraSign } from "../../services/vexora/sign.service";
import { getTimestamp } from "../../utils/timestamp";

export const checkPayoutStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { tradeNo } = req.body;

    if (!tradeNo) {
      return res.status(400).json({
        success: false,
        message: "tradeNo is required",
      });
    }

    const timestamp = getTimestamp();

    const payload: Record<string, any> = {
      timestamp,
      tradeNo,
    };

    const sign = generateVexoraSign(payload);

    const requestBody = {
      ...payload,
      sign,
    };

    const { data } = await vexoraSandboxClient.post(
      "/v1/vexora/queryPayOutResult",
      requestBody,
    );

    // Update DB with latest status
    await db
      .update(vexoraPayouts)
      .set({
        platFormTradeNo: data?.data?.platFormTradeNo ?? undefined,
        status: data?.data?.status ?? null,
        rawResponse: data,
        updatedAt: new Date(),
      })
      .where(eq(vexoraPayouts.tradeNo, tradeNo));

    return res.json({
      success: true,
      request: requestBody,
      response: data,
    });
  } catch (error: any) {
    console.error(
      "Vexora payout status check error:",
      error?.response?.data || error,
    );

    return res.status(500).json({
      success: false,
      message: "Payout status check failed",
      error: error?.response?.data || error?.message,
    });
  }
};
