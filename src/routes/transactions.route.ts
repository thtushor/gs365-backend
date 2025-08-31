import { Router } from "express";
import {
  createAffiliateWithdraw,
  createDeposit,
  createWithdraw,
  getTransactions,
  updateAffiliateWithdrawStatus,
  updateTransactionStatus,
  checkWithdrawCapability,
} from "../controllers/transactions.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.use(verifyToken);

router.post("/deposit", asyncHandler(createDeposit));
router.post("/withdraw", asyncHandler(createWithdraw));
router.post("/affiliate-withdraw", asyncHandler(createAffiliateWithdraw));
router.get("/", asyncHandler(getTransactions));
router.post("/:id/status",asyncHandler(updateTransactionStatus));
router.post(
  "/affiliate-withdraw/:id/status",
  asyncHandler(updateAffiliateWithdrawStatus)
);
router.get("/withdraw-capability/:userId", asyncHandler(checkWithdrawCapability));

export default router;
