import { Router } from "express";
import { PaymentGatewayProviderAccountController } from "../controllers/paymentGatewayProviderAccount.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Apply authentication middleware to all routes
router.use(verifyToken);

// GET /api/gateway-provider-accounts - Get all accounts
router.get("/", asyncHandler(PaymentGatewayProviderAccountController.getAll));

// GET /api/gateway-provider-accounts/:id - Get account by ID
router.get(
  "/:id",
  asyncHandler(PaymentGatewayProviderAccountController.getById)
);

// GET /api/gateway-provider-accounts/provider/:paymentGatewayProviderId - Get accounts by paymentGatewayProviderId
router.get(
  "/provider/:paymentGatewayProviderId",
  asyncHandler(PaymentGatewayProviderAccountController.getByProviderId)
);

// POST /api/gateway-provider-accounts - Create account
router.post("/", asyncHandler(PaymentGatewayProviderAccountController.create));

// POST /api/gateway-provider-accounts/:id - Update account
router.post(
  "/:id/update",
  asyncHandler(PaymentGatewayProviderAccountController.update)
);

// POST /api/gateway-provider-accounts/:id - Delete account
router.post(
  "/:id/delete",
  asyncHandler(PaymentGatewayProviderAccountController.delete)
);

export default router;
