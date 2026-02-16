"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentGatewayProvider_controller_1 = require("../controllers/paymentGatewayProvider.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(verifyToken_1.verifyToken);
// GET /api/gateway-providers - Get all gateway-provider relationships
router.get("/", paymentGatewayProvider_controller_1.PaymentGatewayProviderController.getAll);
// GET /api/gateway-providers/gateway/:gatewayId - Get providers for a specific gateway
router.get("/gateway/:gatewayId", paymentGatewayProvider_controller_1.PaymentGatewayProviderController.getProvidersByGateway);
// GET /api/gateway-providers/provider/:providerId - Get gateways for a specific provider
router.get("/provider/:providerId", paymentGatewayProvider_controller_1.PaymentGatewayProviderController.getGatewaysByProvider);
// POST /api/gateway-providers - Assign a provider to a gateway
router.post("/", paymentGatewayProvider_controller_1.PaymentGatewayProviderController.assignProviderToGateway);
// post /api/gateway-providers/:id/priority - Update relationship priority
router.post("/:id/priority", paymentGatewayProvider_controller_1.PaymentGatewayProviderController.updatePriority);
router.post("/:id/recommendation", paymentGatewayProvider_controller_1.PaymentGatewayProviderController.updateRcommendation);
router.post("/:id/update", paymentGatewayProvider_controller_1.PaymentGatewayProviderController.updateGatewayProvider);
// PUT /api/gateway-providers/:id/status - Update relationship status
router.post("/:id/status", paymentGatewayProvider_controller_1.PaymentGatewayProviderController.updateStatus);
// DELETE /api/gateway-providers/:id - Remove provider from gateway by relationship ID
router.post("/delete-provider-from-gateway/:id", paymentGatewayProvider_controller_1.PaymentGatewayProviderController.removeProviderFromGateway);
// DELETE /api/gateway-providers/:gatewayId/:providerId - Remove provider from gateway by IDs
router.post("/delete-provider-from-gateway/:gatewayId/:providerId", paymentGatewayProvider_controller_1.PaymentGatewayProviderController.removeProviderFromGatewayByIds);
exports.default = router;
