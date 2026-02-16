"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayProviderController = void 0;
const paymentGatewayProvider_model_1 = require("../models/paymentGatewayProvider.model");
const paymentGateway_model_1 = require("../models/paymentGateway.model");
const paymentProvider_model_1 = require("../models/paymentProvider.model");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.PaymentGatewayProviderController = {
    // Get all gateway-provider relationships with optional filtering and pagination
    getAll: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const filters = req.query;
        const result = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.getAll(filters);
        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    }),
    // Get providers for a specific gateway
    getProvidersByGateway: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { gatewayId } = req.params;
        const existingGateway = await paymentGateway_model_1.PaymentGatewayModel.getById(Number(gatewayId));
        if (!existingGateway || existingGateway.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment gateway not found",
            });
        }
        const providers = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.getByGatewayId(Number(gatewayId));
        res.status(200).json({
            success: true,
            data: providers,
        });
    }),
    // Get gateways for a specific provider
    getGatewaysByProvider: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { providerId } = req.params;
        const filters = req.query;
        const existingProvider = await paymentProvider_model_1.PaymentProviderModel.getById(Number(providerId));
        if (!existingProvider || existingProvider.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment provider not found",
            });
        }
        const result = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.getByProviderId(Number(providerId), filters);
        res.status(200).json({
            success: true,
            data: result.data,
            pagination: result.pagination,
        });
    }),
    // Assign a provider to a gateway
    assignProviderToGateway: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { gatewayId, providerId, isRecommended, commission } = req.body;
        const { priority } = req.body;
        if (!gatewayId || !providerId) {
            return res.status(400).json({
                success: false,
                message: "Gateway ID and Provider ID are required",
            });
        }
        // Validate gateway exists
        const existingGateway = await paymentGateway_model_1.PaymentGatewayModel.getById(Number(gatewayId));
        if (!existingGateway || existingGateway.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment gateway not found",
            });
        }
        // Validate provider exists
        const existingProvider = await paymentProvider_model_1.PaymentProviderModel.getById(Number(providerId));
        if (!existingProvider || existingProvider.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Payment provider not found",
            });
        }
        // Check if relationship already exists
        const existingRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.getAll({
            gatewayId: Number(gatewayId),
            providerId: Number(providerId),
        });
        if (existingRelationship && existingRelationship.data.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Provider is already assigned to this gateway",
            });
        }
        const newRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.create({
            gatewayId: Number(gatewayId),
            providerId: Number(providerId),
            priority: priority || null,
            isRecommended: isRecommended || false,
            commission: commission || 0,
        });
        // If this relationship is set as recommended, update others to false
        if (isRecommended) {
            // Get the created relationship to find its ID
            const createdRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.getAll({
                gatewayId: Number(gatewayId),
            });
            if (createdRelationship.data.length > 0) {
                await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.updateOtherRecommendations(Number(gatewayId), createdRelationship.data[0].id);
            }
        }
        res.status(201).json({
            success: true,
            data: newRelationship,
            message: "Provider assigned to gateway successfully",
        });
    }),
    // Update relationship priority
    updatePriority: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { priority } = req.body;
        const existingRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.getAll({
            id: Number(id),
        });
        if (!existingRelationship || existingRelationship.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gateway-provider relationship not found",
            });
        }
        const updatedRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.update(Number(id), { priority });
        res.status(200).json({
            success: true,
            data: updatedRelationship,
            message: "Priority updated successfully",
        });
    }),
    // Update recommendation
    updateRcommendation: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { isRecommended } = req.body;
        const existingRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.getAll({
            id: Number(id),
        });
        if (!existingRelationship || existingRelationship.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gateway-provider relationship not found",
            });
        }
        const relationship = existingRelationship.data[0];
        // If setting as recommended, update others to false
        if (isRecommended) {
            await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.updateOtherRecommendations(relationship.gatewayId, Number(id));
        }
        const updatedRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.update(Number(id), { isRecommended });
        res.status(200).json({
            success: true,
            data: updatedRelationship,
            message: "Recommendation updated successfully",
        });
    }),
    // Update relationship status
    updateStatus: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { status } = req.body;
        // Validate status
        if (!status || !["active", "inactive"].includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Status must be 'active' or 'inactive'",
            });
        }
        const existingRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.getAll({
            id: Number(id),
        });
        if (!existingRelationship || existingRelationship.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gateway-provider relationship not found",
            });
        }
        const updatedRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.update(Number(id), { status });
        res.status(200).json({
            success: true,
            data: updatedRelationship,
            message: `Status updated to ${status} successfully`,
        });
    }),
    // Update recommendation
    updateGatewayProvider: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const body = req.body;
        const existingRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.getAll({
            id: Number(id),
        });
        if (!existingRelationship || existingRelationship.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gateway-provider relationship not found",
            });
        }
        const relationship = existingRelationship.data[0];
        // If setting isRecommended to true, update others to false
        if (body.isRecommended) {
            await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.updateOtherRecommendations(relationship.gatewayId, Number(id));
        }
        const updatedRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.update(Number(id), body);
        res.status(200).json({
            success: true,
            data: updatedRelationship,
            message: "Gateway provider updated successfully",
        });
    }),
    // Remove provider from gateway
    removeProviderFromGateway: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const existingRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.getAll({
            id: Number(id),
        });
        if (!existingRelationship || existingRelationship.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gateway-provider relationship not found",
            });
        }
        await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.delete(Number(id));
        res.status(200).json({
            success: true,
            message: "Provider removed from gateway successfully",
        });
    }),
    // Remove provider from gateway by gateway and provider IDs
    removeProviderFromGatewayByIds: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { gatewayId, providerId } = req.params;
        const existingRelationship = await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.getAll({
            gatewayId: Number(gatewayId),
            providerId: Number(providerId),
        });
        if (!existingRelationship || existingRelationship.data.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gateway-provider relationship not found",
            });
        }
        await paymentGatewayProvider_model_1.PaymentGatewayProviderModel.deleteByGatewayAndProvider(Number(gatewayId), Number(providerId));
        res.status(200).json({
            success: true,
            message: "Provider removed from gateway successfully",
        });
    }),
};
