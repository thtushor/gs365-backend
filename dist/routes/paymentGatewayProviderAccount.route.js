"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentGatewayProviderAccount_controller_1 = require("../controllers/paymentGatewayProviderAccount.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(verifyToken_1.verifyToken);
// GET /api/gateway-provider-accounts - Get all accounts
router.get("/", (0, asyncHandler_1.asyncHandler)(paymentGatewayProviderAccount_controller_1.PaymentGatewayProviderAccountController.getAll));
// GET /api/gateway-provider-accounts/:id - Get account by ID
router.get("/:id", (0, asyncHandler_1.asyncHandler)(paymentGatewayProviderAccount_controller_1.PaymentGatewayProviderAccountController.getById));
// GET /api/gateway-provider-accounts/provider/:paymentGatewayProviderId - Get accounts by paymentGatewayProviderId
router.get("/provider/:paymentGatewayProviderId", (0, asyncHandler_1.asyncHandler)(paymentGatewayProviderAccount_controller_1.PaymentGatewayProviderAccountController.getByProviderId));
// POST /api/gateway-provider-accounts - Create account
router.post("/", (0, asyncHandler_1.asyncHandler)(paymentGatewayProviderAccount_controller_1.PaymentGatewayProviderAccountController.create));
// POST /api/gateway-provider-accounts/:id - Update account
router.post("/:id/update", (0, asyncHandler_1.asyncHandler)(paymentGatewayProviderAccount_controller_1.PaymentGatewayProviderAccountController.update));
// POST /api/gateway-provider-accounts/:id - Delete account
router.post("/:id/delete", (0, asyncHandler_1.asyncHandler)(paymentGatewayProviderAccount_controller_1.PaymentGatewayProviderAccountController.delete));
exports.default = router;
