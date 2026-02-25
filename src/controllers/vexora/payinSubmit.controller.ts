import { Request, Response } from "express";

import { eq } from "drizzle-orm";
import { vexoraPayins } from "../../db/schema";
import { db } from "../../db/connection";
import { vexoraSandboxClient } from "../../services/vexora/vexoraSandbox.service";
import { generateVexoraSign } from "../../services/vexora/sign.service";
import { getTimestamp } from "../../utils/timestamp";

export const payinSubmitController = async (req: Request, res: Response) => {
  try {
    const { platFormTradeNo, trxId } = req.body;

    const timestamp = getTimestamp();

    const payload: Record<string, any> = {
      timestamp,
      platFormTradeNo,
      trxId,
    };

    const sign = generateVexoraSign(payload);

    const requestBody = {
      ...payload,
      sign,
    };

    // Call Vexora sandbox
    const { data } = await vexoraSandboxClient.post(
      "/v1/vexora/payinSubmit",
      requestBody,
    );

    // Update DB (do NOT finalize status yet)
    await db
      .update(vexoraPayins)
      .set({
        rawResponse: data,
        updatedAt: new Date(),
      })
      .where(eq(vexoraPayins.platFormTradeNo, platFormTradeNo));

    return res.json({
      success: true,
      request: requestBody,
      response: data,
      note: "Submission successful. Final transaction result will come via webhook or query API.",
    });
  } catch (error: any) {
    console.error("Vexora payin submit error:", error?.response?.data || error);

    return res.status(500).json({
      success: false,
      message: "Pay-in submit failed",
      error: error?.response?.data || error?.message,
    });
  }
};
