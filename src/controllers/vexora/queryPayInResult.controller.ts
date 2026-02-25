import { Request, Response } from "express";
import { eq } from "drizzle-orm";

import { db } from "../../db/connection";
import { vexoraPayins } from "../../db/schema";
import { vexoraSandboxClient } from "../../services/vexora/vexoraSandbox.service";
import { generateVexoraSign } from "../../services/vexora/sign.service";
import { getTimestamp } from "../../utils/timestamp";

export const checkPayinStatusController = async (
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
      tradeNo,
      timestamp,
    };

    const sign = generateVexoraSign(payload);

    const requestBody = {
      ...payload,
      sign,
    };

    // Call Vexora Query API
    const { data } = await vexoraSandboxClient.post(
      "/v1/vexora/queryPayInResult",
      requestBody,
    );

    // Update DB with latest query result
    // await db
    //   .update(vexoraPayins)
    //   .set({
    //     queryResponse: data,
    //     status: data?.data?.status ?? null,
    //     updatedAt: new Date(),
    //   })
    //   .where(eq(vexoraPayins.tradeNo, tradeNo));

    return res.json({
      success: true,
      request: requestBody,
      response: data,
    });
  } catch (error: any) {
    console.error(
      "Vexora check payin status error:",
      error?.response?.data || error,
    );

    return res.status(500).json({
      success: false,
      message: "Check pay-in status failed",
      error: error?.response?.data || error?.message,
    });
  }
};
