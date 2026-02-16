"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../middlewares/verifyToken");
const withdrawalPaymentAccount_controller_1 = require("../controllers/withdrawalPaymentAccount.controller");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(verifyToken_1.verifyToken);
// CRUD Operations
router.post("/", withdrawalPaymentAccount_controller_1.createWithdrawalPaymentAccount); // Create new account
router.get("/", withdrawalPaymentAccount_controller_1.getWithdrawalPaymentAccounts); // Get all accounts with filters
router.get("/stats", withdrawalPaymentAccount_controller_1.getAccountStats); // Get account statistics
router.get("/:id", withdrawalPaymentAccount_controller_1.getWithdrawalPaymentAccountById); // Get account by ID
router.put("/:id", withdrawalPaymentAccount_controller_1.updateWithdrawalPaymentAccount); // Update account
router.delete("/:id", withdrawalPaymentAccount_controller_1.deleteWithdrawalPaymentAccount); // Delete account
// User-specific operations
router.get("/user/:userId", withdrawalPaymentAccount_controller_1.getWithdrawalPaymentAccountsByUserId); // Get accounts by user ID
router.get("/user/:userId/primary", withdrawalPaymentAccount_controller_1.getPrimaryWithdrawalPaymentAccount); // Get primary account for user
// Business logic operations
router.patch("/:id/deactivate", withdrawalPaymentAccount_controller_1.deactivateWithdrawalPaymentAccount); // Soft delete (deactivate)
router.patch("/:id/set-primary", withdrawalPaymentAccount_controller_1.setAccountAsPrimary); // Set account as primary
router.patch("/:id/verification-status", withdrawalPaymentAccount_controller_1.updateVerificationStatus); // Update verification status
exports.default = router;
