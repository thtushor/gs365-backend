"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentProvider_controller_1 = require("../controllers/paymentProvider.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes
router.use(verifyToken_1.verifyToken);
// GET /api/payment-providers - Get all payment providers
router.get("/", paymentProvider_controller_1.PaymentProviderController.getAll);
// GET /api/payment-providers/:id - Get payment provider by ID
router.get("/:id", paymentProvider_controller_1.PaymentProviderController.getById);
// POST /api/payment-providers - Create new payment provider
router.post("/", paymentProvider_controller_1.PaymentProviderController.create);
// POST /api/payment-providers/:id - Update payment provider
router.post("/update/:id", paymentProvider_controller_1.PaymentProviderController.update);
// POST /api/payment-providers/:id - Delete payment provider
router.post("/delete/:id", paymentProvider_controller_1.PaymentProviderController.delete);
exports.default = router;
