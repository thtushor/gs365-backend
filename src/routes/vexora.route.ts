import { Router } from "express";
import { checkoutController } from "../controllers/vexora/checkout.controller";
import { payinSubmitController } from "../controllers/vexora/payinSubmit.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Deposit / Checkout
router.post("/checkout", asyncHandler(checkoutController));

// (will be used in step 4)
router.post("/payin-submit", asyncHandler(payinSubmitController));

export default router;
