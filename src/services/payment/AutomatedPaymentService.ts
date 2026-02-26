import { VexoraService } from "../vexora/vexora.service";
import { getVexoraWayCode } from "../../utils/vexoraMapping";

export interface AutomatedDepositParams {
    providerName: string;
    amount: number;
    network: string;
    customTransactionId: string;
    givenTransactionId?: string;
    notes?: string;
    username: string;
}

export const AutomatedPaymentService = {
    async handleDeposit(params: AutomatedDepositParams) {
        const name = params.providerName.toLowerCase();

        if (name === "vexora") {
            const wayCode = getVexoraWayCode(params.network);
            if (!wayCode) {
                throw new Error(`Unsupported network for Vexora: ${params.network}`);
            }

            // 1. Checkout
            const checkoutRes = await VexoraService.checkout({
                tradeNo: params.customTransactionId,
                amount: params.amount.toString(),
                wayCode: wayCode,
                remark: params.notes || `Deposit from ${params.username}`,
            });

            if (checkoutRes.code !== "0000" || !checkoutRes.success) {
                throw new Error(`Vexora Checkout Failed: ${checkoutRes.msg}`);
            }

            const platFormTradeNo = checkoutRes.data.platFormTradeNo;

            // 2. Payin Submit
            const submitRes = await VexoraService.payinSubmit({
                platFormTradeNo,
                trxId: params.givenTransactionId || "",
            });

            if (submitRes.code !== "0000" || !submitRes.success) {
                throw new Error(`Vexora Payin Submit Failed: ${submitRes.msg}`);
            }

            return {
                platFormTradeNo,
                response: checkoutRes.data,
            };
        }

        // Add more providers here
        throw new Error(`Provider ${params.providerName} logic not implemented`);
    }
};
