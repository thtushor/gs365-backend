import { Request, Response } from "express";
import { PaymentGatewayModel } from "../models/paymentGateway.model";
import { PaymentProviderModel } from "../models/paymentProvider.model";
import { paymentGateway } from "../db/schema/paymentGateway";
import { eq, and, sql, like } from "drizzle-orm";
// import { vexoraSandboxClient } from "../../services/vexora/vexoraSandbox.service";
// import { generateVexoraSign } from "../../services/vexora/sign.service";
// import { getTimestamp } from "../../utils/timestamp";
import { db } from "../db/connection";
import { vexoraPayins } from "../db/schema";
import crypto from "crypto";
import { vexoraSandboxClient } from "../services/vexora/vexoraSandbox.service";
import { generateVexoraSign } from "../services/vexora/sign.service";
import { getTimestamp } from "../utils/timestamp";

// Helper to build where conditions for search/filter
function buildWhereCondition(query: any) {
  const whereCondition = [];
  if (query.status)
    whereCondition.push(eq(paymentGateway.status, query.status));
  if (query.countryId)
    whereCondition.push(eq(paymentGateway.countryId, query.countryCode));
  if (query.methodId)
    whereCondition.push(eq(paymentGateway.methodId, Number(query.methodId)));
  if (query.name)
    whereCondition.push(like(paymentGateway.name, `%${query.name}%`));
  if (query.network)
    whereCondition.push(like(paymentGateway.network, `%${query.network}%`));
  return whereCondition;
}

export const getAllPaymentGateways = async (req: Request, res: Response) => {
  try {
    const pageSize = parseInt((req.query.pageSize as string) || "10", 10);
    const page = parseInt((req.query.page as string) || "1", 10);
    const filter = req.query;

    // Get all filtered
    const allRows = await PaymentGatewayModel.getAll(filter);
    const totalCount = allRows.length;
    // Paginate
    const offset = (page - 1) * pageSize;
    const rows = allRows.slice(offset, offset + pageSize);

    res.json({
      data: rows,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch payment gateways", errors: err });
  }
};

export const getPaymentGatewayById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const row = await PaymentGatewayModel.getById(id);
    if (!row.length)
      return res
        .status(404)
        .json({ status: false, message: "Payment gateway not found" });
    res.json({
      data: row[0],
      status: true,
      message: "Payment gateway fetched!",
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch payment gateway",
      errors: err,
    });
  }
};

export const createPaymentGateway = async (req: Request, res: Response) => {
  try {
    await PaymentGatewayModel.create(req.body);
    res.status(201).json({ message: "Payment gateway created" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to create payment gateway", errors: err });
  }
};

export const updatePaymentGateway = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await PaymentGatewayModel.update(id, req.body);
    if (!result)
      return res.status(404).json({ error: "Payment gateway not found" });
    res.json({ message: "Payment gateway updated", status: true });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update payment gateway", errors: err });
  }
};

export const deletePaymentGateway = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const result = await PaymentGatewayModel.delete(id);
    if (!result)
      return res.status(404).json({ error: "Payment gateway not found" });
    res.json({ message: "Payment gateway deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to delete payment gateway", errors: err });
  }
};

export const initializeAutomatedPayment = async (
  req: Request,
  res: Response
) => {
  try {
    const { gatewayId, providerId, amount } = req.body;

    if (!gatewayId || !providerId || amount === undefined) {
      return res.status(400).json({
        status: false,
        message: "gatewayId, providerId and amount are required",
      });
    }

    const [gateway] = await PaymentGatewayModel.getById(Number(gatewayId));
    const [provider] = await PaymentProviderModel.getById(Number(providerId));

    if (!gateway || !provider) {
      return res.status(404).json({
        status: false,
        message: "Gateway or Provider not found",
      });
    }

    if (provider.isAutomated && provider.tag === "VEXORA") {
      // Generate Trade Number
      const tradeNo = req.body.tradeNo || `VEX_${crypto.randomBytes(4).toString("hex").toUpperCase()}_${Date.now()}`;
      const timestamp = getTimestamp();

      // Setup payload properties for Vexora request
      const payload: Record<string, any> = {
        timestamp,
        tradeNo,
        amount: amount.toString(), // ensure amount is string
        wayCode: gateway.name.toUpperCase(), // assuming wayCode matches gateway name like "BKASH"
        notifyUrl: "https://yourdomain.com/webhook/vexora", // TODO: Update to real domain
        returnUrl: "https://yourdomain.com/success", // TODO: Update to real domain
        remark: `Deposit via ${gateway.name}`,
      };

      // Generate cryptographic sign
      const sign = generateVexoraSign(payload);

      const requestBody = {
        ...payload,
        sign,
      };

      console.log("Vexora Request:", requestBody);

      // Call Vexora Sandbox Checkout API
      const response = (await vexoraSandboxClient.post(
        "/v1/vexora/checkout",
        requestBody
      )) as any;

      const { data: vexoraData } = response;

      // Save to DB
      await db.insert(vexoraPayins).values({
        tradeNo,
        platFormTradeNo: vexoraData?.data?.platFormTradeNo ?? null,
        amount: amount.toString(),
        wayCode: gateway.name.toUpperCase(),
        status: vexoraData?.data?.status ?? "UNKNOWN",
        paymentLink: vexoraData?.data?.paymentLink ?? null,
        remark: payload.remark,
        rawResponse: vexoraData,
      });

      return res.json({
        success: true,
        request: requestBody,
        response: vexoraData,
      });
    }

    // Default fallback for manual or other automated payment tags
    return res.json({
      status: true,
      data: {
        gateway,
        provider,
        amount,
      },
      message: "Automated payment initialization data fetched",
    });
  } catch (err: any) {
    console.error("Vexora Checkout Error:", err?.response?.data || err);
    res.status(500).json({
      status: false,
      message: "Failed to initialize automated payment",
      error: err?.response?.data || err?.message,
    });
  }
};
