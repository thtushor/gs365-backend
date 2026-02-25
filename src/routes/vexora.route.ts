import { Router } from "express";
import { checkoutController } from "../controllers/vexora/checkout.controller";
import { payinSubmitController } from "../controllers/vexora/payinSubmit.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { checkPayinStatusController } from "../controllers/vexora/queryPayInResult.controller";

const router = Router();

// Deposit / Checkout
router.post("/checkout", asyncHandler(checkoutController));

// (will be used in step 4)
router.post("/payin-submit", asyncHandler(payinSubmitController));
router.post("/payin-status-check", asyncHandler(checkPayinStatusController));

export default router;
