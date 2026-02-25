import { Request, Response } from "express";
import { db } from "../../db/connection";
import { vexoraPayins } from "../../db/schema";
import { vexoraSandboxClient } from "../../services/vexora/vexoraSandbox.service";
import { generateVexoraSign } from "../../services/vexora/sign.service";
import { getTimestamp } from "../../utils/timestamp";

export const checkoutController = async (req: Request, res: Response) => {
  try {
    const { amount, wayCode, tradeNo, notifyUrl, returnUrl, remark } = req.body;

    const timestamp = getTimestamp();

    // Payload WITHOUT sign
    const payload: Record<string, any> = {
      timestamp,
      tradeNo,
      amount,
      wayCode,
      notifyUrl: notifyUrl || "https://gamestar365.com/notify", // Replace with your actual notify URL
      returnUrl: returnUrl || "https://gamestar365.com/success", // Replace with your actual return URL
      remark,
    };

    // Generate sign
    const sign = generateVexoraSign(payload);

    const requestBody = {
      ...payload,
      sign,
    };

    console.log(requestBody);

    // Call Vexora sandbox
    const { data } = (await vexoraSandboxClient.post(
      "/v1/vexora/checkout",
      requestBody,
    )) as any;

    // Save to DB (demo-safe)
    await db.insert(vexoraPayins).values({
      tradeNo,
      platFormTradeNo: data?.data?.platFormTradeNo ?? null,
      amount,
      wayCode,
      status: data?.data?.status ?? "UNKNOWN",
      paymentLink: data?.data?.paymentLink ?? null,
      remark,
      rawResponse: data,
    });

    return res.json({
      success: true,
      request: requestBody,
      response: data,
    });
  } catch (error: any) {
    console.error("Vexora checkout error:", error?.response?.data || error);

    return res.status(500).json({
      success: false,
      message: "Checkout failed",
      error: error?.response?.data || error?.message,
    });
  }
};
