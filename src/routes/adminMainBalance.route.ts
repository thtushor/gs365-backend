import { Router } from "express";
import { AdminMainBalanceController } from "../controllers/adminMainBalance.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// Admin Main Balance Routes

// Create a new admin main balance record
router.post("/", AdminMainBalanceController.create);

// Get all admin main balance records with filters and pagination
router.get("/", AdminMainBalanceController.getAll);

// Get current main balance and stats
router.get("/stats", AdminMainBalanceController.getStats);

// Get current main balance calculation
router.get("/current-balance", AdminMainBalanceController.getCurrentMainBalance);

// Get recent transactions
router.get("/recent", AdminMainBalanceController.getRecentTransactions);

// Get balance by type
router.get("/balance/:type", AdminMainBalanceController.getBalanceByType);

// Get admin main balance by ID
router.get("/:id", AdminMainBalanceController.getById);

// Update admin main balance record
router.put("/:id", AdminMainBalanceController.update);

// Delete admin main balance record
router.delete("/:id", AdminMainBalanceController.delete);

export default router;
