"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderController = void 0;
const paymentProvider_model_1 = require("../models/paymentProvider.model");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.PaymentProviderController = {
    // Get all payment providers with optional filtering and pagination
    getAll: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const filters = req.query;
        const result = await paymentProvider_model_1.PaymentProviderModel.getAll(filters);
        res.status(200).json({
            status: true,
            data: result.data,
            pagination: result.pagination,
        });
    }),
    // Get payment provider by ID
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const provider = await paymentProvider_model_1.PaymentProviderModel.getById(Number(id));
        if (!provider || provider.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Payment provider not found",
            });
        }
        res.status(200).json({
            status: true,
            data: provider[0],
        });
    }),
    // Create new payment provider
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { name, contactInfo, commissionPercentage, status } = req.body;
        if (!name) {
            return res.status(400).json({
                status: false,
                message: "Provider name is required",
            });
        }
        // Validate commission percentage
        if (commissionPercentage !== undefined &&
            (commissionPercentage < 0 || commissionPercentage > 100)) {
            return res.status(400).json({
                status: false,
                message: "Commission percentage must be between 0 and 100",
            });
        }
        const newProvider = await paymentProvider_model_1.PaymentProviderModel.create({
            name,
            contactInfo,
            commissionPercentage: commissionPercentage || 0,
            status: status || "active",
        });
        res.status(201).json({
            status: true,
            data: newProvider,
            message: "Payment provider created successfully",
        });
    }),
    // Update payment provider
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const updateData = req.body;
        const existingProvider = await paymentProvider_model_1.PaymentProviderModel.getById(Number(id));
        if (!existingProvider || existingProvider.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Payment provider not found",
            });
        }
        const updatedProvider = await paymentProvider_model_1.PaymentProviderModel.update(Number(id), updateData);
        res.status(200).json({
            status: true,
            data: updatedProvider,
            message: "Payment provider updated successfully",
        });
    }),
    // Delete payment provider
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const existingProvider = await paymentProvider_model_1.PaymentProviderModel.getById(Number(id));
        if (!existingProvider || existingProvider.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Payment provider not found",
            });
        }
        await paymentProvider_model_1.PaymentProviderModel.delete(Number(id));
        res.status(200).json({
            status: true,
            message: "Payment provider deleted successfully",
        });
    }),
};
