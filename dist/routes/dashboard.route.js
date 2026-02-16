"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const dashboard_controller_1 = require("../controllers/dashboard.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// GET /api/dashboard - Get dashboard statistics
router.get("/", verifyToken_1.verifyToken, dashboard_controller_1.getDashboardStats);
exports.default = router;
