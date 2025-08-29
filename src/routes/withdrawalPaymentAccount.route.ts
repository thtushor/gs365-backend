import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import {
  createWithdrawalPaymentAccount,
  getWithdrawalPaymentAccountById,
  getWithdrawalPaymentAccounts,
  getWithdrawalPaymentAccountsByUserId,
  getPrimaryWithdrawalPaymentAccount,
  updateWithdrawalPaymentAccount,
  deleteWithdrawalPaymentAccount,
  deactivateWithdrawalPaymentAccount,
  setAccountAsPrimary,
  updateVerificationStatus,
  getAccountStats,
} from "../controllers/withdrawalPaymentAccount.controller";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// CRUD Operations
router.post("/", createWithdrawalPaymentAccount); // Create new account
router.get("/", getWithdrawalPaymentAccounts); // Get all accounts with filters
router.get("/stats", getAccountStats); // Get account statistics
router.get("/:id", getWithdrawalPaymentAccountById); // Get account by ID
router.put("/:id", updateWithdrawalPaymentAccount); // Update account
router.delete("/:id", deleteWithdrawalPaymentAccount); // Delete account

// User-specific operations
router.get("/user/:userId", getWithdrawalPaymentAccountsByUserId); // Get accounts by user ID
router.get("/user/:userId/primary", getPrimaryWithdrawalPaymentAccount); // Get primary account for user

// Business logic operations
router.patch("/:id/deactivate", deactivateWithdrawalPaymentAccount); // Soft delete (deactivate)
router.patch("/:id/set-primary", setAccountAsPrimary); // Set account as primary
router.patch("/:id/verification-status", updateVerificationStatus); // Update verification status

export default router;
