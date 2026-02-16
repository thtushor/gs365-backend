"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminMainBalance_controller_1 = require("../controllers/adminMainBalance.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(verifyToken_1.verifyToken);
// Admin Main Balance Routes
// Create a new admin main balance record
router.post("/", adminMainBalance_controller_1.AdminMainBalanceController.create);
// Get all admin main balance records with filters and pagination
router.get("/", adminMainBalance_controller_1.AdminMainBalanceController.getAll);
// Get current main balance and stats
router.get("/stats", adminMainBalance_controller_1.AdminMainBalanceController.getStats);
// Get current main balance calculation
router.get("/current-balance", adminMainBalance_controller_1.AdminMainBalanceController.getCurrentMainBalance);
// Get recent transactions
router.get("/recent", adminMainBalance_controller_1.AdminMainBalanceController.getRecentTransactions);
// Get balance by type
router.get("/balance/:type", adminMainBalance_controller_1.AdminMainBalanceController.getBalanceByType);
// Get admin main balance by ID
router.get("/:id", adminMainBalance_controller_1.AdminMainBalanceController.getById);
// Update admin main balance record
router.put("/:id", adminMainBalance_controller_1.AdminMainBalanceController.update);
// Delete admin main balance record
router.delete("/:id", adminMainBalance_controller_1.AdminMainBalanceController.delete);
exports.default = router;
