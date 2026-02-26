// controllers/vexora/queryBalance.controller.ts
import { Request, Response } from "express";
import { vexoraSandboxClient } from "../../services/vexora/vexoraSandbox.service";
import { generateVexoraSign } from "../../services/vexora/sign.service";
import { getTimestamp } from "../../utils/timestamp";

export const queryBalanceController = async (req: Request, res: Response) => {
  try {
    const timestamp = getTimestamp();

    const payload: Record<string, any> = {
      timestamp,
    };

    const sign = generateVexoraSign(payload);

    const requestBody = {
      ...payload,
      sign,
    };

    const { data } = await vexoraSandboxClient.post(
      "/v1/vexora/queryBalance",
      requestBody,
    );

    return res.json({
      success: true,
      request: requestBody,
      response: data,
      available: data?.data?.availableAmount,
      freeze: data?.data?.freezeAmount,
      unsettled: data?.data?.unsettledAmount,
    });
  } catch (error: any) {
    console.error(
      "Vexora balance query error:",
      error?.response?.data || error,
    );

    return res.status(500).json({
      success: false,
      message: "Balance query failed",
      error: error?.response?.data || error?.message,
    });
  }
};
