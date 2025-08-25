import { Router } from "express";
import { CommissionController } from "../controllers/commission.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Create new commission
router.post("/", CommissionController.createCommission);

// Get commission by ID
router.get("/:id", CommissionController.getCommissionById);

// get total commission by affiliate ID
router.get(
  "/total-commission/:affiliateId",
  CommissionController.getTotalCommission
);

// Get all commissions with pagination and search
router.get("/", CommissionController.getAllCommissions);

// Get commissions by admin user ID
router.get(
  "/admin/:adminUserId",
  CommissionController.getCommissionsByAdminUser
);

// Get commissions by player ID
router.get("/player/:playerId", CommissionController.getCommissionsByPlayer);

// Get commissions by bet result ID
router.get(
  "/bet-result/:betResultId",
  CommissionController.getCommissionsByBetResult
);

// Get commissions by status
router.get("/status/:status", CommissionController.getCommissionsByStatus);

// Update commission
router.put("/:id", CommissionController.updateCommission);

// Delete commission
router.delete("/:id", CommissionController.deleteCommission);

// Get commission statistics
router.get("/stats/overview", CommissionController.getCommissionStats);

// Get commission statistics by admin user
router.get(
  "/stats/admin/:adminUserId",
  CommissionController.getCommissionStatsByAdminUser
);

// Approve commission
router.patch("/:id/approve", CommissionController.approveCommission);

// Reject commission
router.patch("/:id/reject", CommissionController.rejectCommission);

// Mark commission as paid
router.patch("/:id/mark-paid", CommissionController.markCommissionAsPaid);

export default router;
