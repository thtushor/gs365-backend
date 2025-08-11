import { Router } from "express";
import {
  getAllPaymentMethodTypes,
  getPaymentMethodTypeById,
  createPaymentMethodType,
  updatePaymentMethodType,
  deletePaymentMethodType,
} from "../controllers/paymentMethodsTypes.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", asyncHandler(getAllPaymentMethodTypes));
router.get("/:id", asyncHandler(getPaymentMethodTypeById));
router.post("/", asyncHandler(createPaymentMethodType));
router.post("/update/:id", asyncHandler(updatePaymentMethodType));
router.post("/delete/:id", asyncHandler(deletePaymentMethodType));

export default router;
