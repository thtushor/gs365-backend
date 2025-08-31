import { Router } from "express";
import {
  createAffiliateWithdraw,
  createDeposit,
  getTransactions,
  updateAffiliateWithdrawStatus,
  updateTransactionStatus,
} from "../controllers/transactions.controller";
import { asyncHandler } from "../utils/asyncHandler";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();


router.use(verifyToken);

router.post("/deposit", asyncHandler(createDeposit));
router.post("/affiliate-withdraw", asyncHandler(createAffiliateWithdraw));
router.get("/", asyncHandler(getTransactions));
router.post("/:id/status",asyncHandler(updateTransactionStatus));
router.post(
  "/affiliate-withdraw/:id/status",
  asyncHandler(updateAffiliateWithdrawStatus)
);

export default router;
