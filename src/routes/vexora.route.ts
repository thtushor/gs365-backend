import { Router } from "express";
import { checkoutController } from "../controllers/vexora/checkout.controller";
import { payinSubmitController } from "../controllers/vexora/payinSubmit.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { checkPayinStatusController } from "../controllers/vexora/queryPayInResult.controller";
import { queryBalanceController } from "../controllers/vexora/queryBalance.controller";
import { checkPayoutStatusController } from "../controllers/vexora/checkPayoutStatus.controller";
import { disbursementController } from "../controllers/vexora/disbursement.controller";
import { vexoraNotifyController, vexoraReturnController } from "../controllers/vexora/webhook.controller";

const router = Router();

// Callbacks & Redirects
router.post("/notify", asyncHandler(vexoraNotifyController));
router.post("/notify-payout", asyncHandler(vexoraNotifyController));
router.get("/success", asyncHandler(vexoraReturnController));

// Deposit / Checkout
router.post("/checkout", asyncHandler(checkoutController));

// (will be used in step 4)
router.post("/payin-submit", asyncHandler(payinSubmitController));
router.post("/payin-status-check", asyncHandler(checkPayinStatusController));

// Disbursement / Payout
router.post("/disbursement", asyncHandler(disbursementController));
router.post("/payout-status-check", asyncHandler(checkPayoutStatusController));
router.post("/balance", asyncHandler(queryBalanceController));

export default router;
