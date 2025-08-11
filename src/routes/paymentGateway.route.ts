import { Router } from "express";
import * as paymentGatewayController from "../controllers/paymentGateway.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(paymentGatewayController.getAllPaymentGateways));
router.get(
  "/:id",
  asyncHandler(paymentGatewayController.getPaymentGatewayById)
);
router.post("/", asyncHandler(paymentGatewayController.createPaymentGateway));
router.post(
  "/update/:id",
  asyncHandler(paymentGatewayController.updatePaymentGateway)
);
router.post(
  "/delete/:id",
  asyncHandler(paymentGatewayController.deletePaymentGateway)
);

export default router;
