import { Router } from "express";
import { createDeposit, getTransactions, updateTransactionStatus } from "../controllers/transactions.controller";
import { asyncHandler } from "../utils/asyncHandler";


const router = Router();

router.post("/deposit", asyncHandler(createDeposit));
router.get("/", asyncHandler(getTransactions));
router.post("/:id/status", asyncHandler(updateTransactionStatus));

export default router;
