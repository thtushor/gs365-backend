import { Router } from "express";
import { PaymentGatewayProviderController } from "../controllers/paymentGatewayProvider.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET /api/gateway-providers - Get all gateway-provider relationships
router.get("/", PaymentGatewayProviderController.getAll);

// GET /api/gateway-providers/gateway/:gatewayId - Get providers for a specific gateway
router.get(
  "/gateway/:gatewayId",
  PaymentGatewayProviderController.getProvidersByGateway
);

// GET /api/gateway-providers/provider/:providerId - Get gateways for a specific provider
router.get(
  "/provider/:providerId",
  PaymentGatewayProviderController.getGatewaysByProvider
);

// POST /api/gateway-providers - Assign a provider to a gateway
router.post("/", PaymentGatewayProviderController.assignProviderToGateway);

// post /api/gateway-providers/:id/priority - Update relationship priority
router.post("/:id/priority", PaymentGatewayProviderController.updatePriority);
router.post("/:id/recommendation", PaymentGatewayProviderController.updateRcommendation);
router.post("/:id/update", PaymentGatewayProviderController.updateGatewayProvider);

// PUT /api/gateway-providers/:id/status - Update relationship status
router.post("/:id/status", PaymentGatewayProviderController.updateStatus);

// DELETE /api/gateway-providers/:id - Remove provider from gateway by relationship ID
router.post(
  "/delete-provider-from-gateway/:id",
  PaymentGatewayProviderController.removeProviderFromGateway
);

// DELETE /api/gateway-providers/:gatewayId/:providerId - Remove provider from gateway by IDs
router.post(
  "/delete-provider-from-gateway/:gatewayId/:providerId",
  PaymentGatewayProviderController.removeProviderFromGatewayByIds
);

export default router;
