"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const commission_controller_1 = require("../controllers/commission.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(verifyToken_1.verifyToken);
// Create new commission
router.post("/", commission_controller_1.CommissionController.createCommission);
// Get commission by ID
router.get("/:id", commission_controller_1.CommissionController.getCommissionById);
// get total commission by affiliate ID
router.get("/total-commission/:affiliateId", commission_controller_1.CommissionController.getTotalCommission);
// Get all commissions with pagination and search
router.get("/", commission_controller_1.CommissionController.getAllCommissions);
// Get commissions by admin user ID
router.get("/admin/:adminUserId", commission_controller_1.CommissionController.getCommissionsByAdminUser);
// Get commissions by player ID
router.get("/player/:playerId", commission_controller_1.CommissionController.getCommissionsByPlayer);
// Get commissions by bet result ID
router.get("/bet-result/:betResultId", commission_controller_1.CommissionController.getCommissionsByBetResult);
// Get commissions by status
router.get("/status/:status", commission_controller_1.CommissionController.getCommissionsByStatus);
// Update commission
router.put("/:id", commission_controller_1.CommissionController.updateCommission);
// Delete commission
router.delete("/:id", commission_controller_1.CommissionController.deleteCommission);
// Get commission statistics
router.get("/stats/overview", commission_controller_1.CommissionController.getCommissionStats);
// Get commission statistics by admin user
router.get("/stats/admin/:adminUserId", commission_controller_1.CommissionController.getCommissionStatsByAdminUser);
// Approve commission
router.patch("/:id/approve", commission_controller_1.CommissionController.approveCommission);
// Reject commission
router.patch("/:id/reject", commission_controller_1.CommissionController.rejectCommission);
// Mark commission as paid
router.patch("/:id/mark-paid", commission_controller_1.CommissionController.markCommissionAsPaid);
exports.default = router;
