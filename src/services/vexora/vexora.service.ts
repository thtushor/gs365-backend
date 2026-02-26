import { vexoraSandboxClient } from "./vexoraSandbox.service";
import { generateVexoraSign } from "./sign.service";
import { getTimestamp } from "../../utils/timestamp";

export interface VexoraCheckoutParams {
    amount: string;
    wayCode: string;
    tradeNo: string;
    notifyUrl?: string;
    returnUrl?: string;
    remark?: string;
}

export interface VexoraPayinSubmitParams {
    platFormTradeNo: string;
    trxId: string;
}

export const VexoraService = {
    async checkout(params: VexoraCheckoutParams) {
        const timestamp = getTimestamp();
        const payload: Record<string, any> = {
            timestamp,
            tradeNo: params.tradeNo,
            amount: params.amount,
            wayCode: params.wayCode,
            notifyUrl: params.notifyUrl || "https://gamestar365.com/api/demo/vexora/notify",
            returnUrl: params.returnUrl || "https://gamestar365.com/success",
            remark: params.remark || "deposit",
        };

        const sign = generateVexoraSign(payload);
        const requestBody = { ...payload, sign };

        const { data } = await vexoraSandboxClient.post("/v1/vexora/checkout", requestBody);
        return data;
    },

    async payinSubmit(params: VexoraPayinSubmitParams) {
        const timestamp = getTimestamp();
        const payload: Record<string, any> = {
            timestamp,
            platFormTradeNo: params.platFormTradeNo,
            trxId: params.trxId,
        };

        const sign = generateVexoraSign(payload);
        const requestBody = { ...payload, sign };

        const { data } = await vexoraSandboxClient.post("/v1/vexora/payinSubmit", requestBody);
        return data;
    },

    async queryStatus(tradeNo: string) {
        const timestamp = getTimestamp();
        const payload: Record<string, any> = {
            tradeNo,
            timestamp,
        };

        const sign = generateVexoraSign(payload);
        const requestBody = { ...payload, sign };

        const { data } = await vexoraSandboxClient.post("/v1/vexora/queryPayInResult", requestBody);
        return data;
    }
};
