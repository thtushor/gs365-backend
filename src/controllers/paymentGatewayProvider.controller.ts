import { Request, Response } from "express";
import { PaymentGatewayProviderModel } from "../models/paymentGatewayProvider.model";
import { PaymentGatewayModel } from "../models/paymentGateway.model";
import { PaymentProviderModel } from "../models/paymentProvider.model";
import { asyncHandler } from "../utils/asyncHandler";

export const PaymentGatewayProviderController = {
  // Get all gateway-provider relationships with optional filtering and pagination
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const filters = req.query;
    const result = await PaymentGatewayProviderModel.getAll(filters);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }),

  // Get providers for a specific gateway
  getProvidersByGateway: asyncHandler(async (req: Request, res: Response) => {
    const { gatewayId } = req.params;

    const existingGateway = await PaymentGatewayModel.getById(
      Number(gatewayId)
    );
    if (!existingGateway || existingGateway.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment gateway not found",
      });
    }

    const providers = await PaymentGatewayProviderModel.getByGatewayId(
      Number(gatewayId)
    );

    res.status(200).json({
      success: true,
      data: providers,
    });
  }),

  // Get gateways for a specific provider
  getGatewaysByProvider: asyncHandler(async (req: Request, res: Response) => {
    const { providerId } = req.params;
    const filters = req.query;

    const existingProvider = await PaymentProviderModel.getById(
      Number(providerId)
    );
    if (!existingProvider || existingProvider.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment provider not found",
      });
    }

    const result = await PaymentGatewayProviderModel.getByProviderId(
      Number(providerId),
      filters
    );

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  }),

  // Assign a provider to a gateway
  assignProviderToGateway: asyncHandler(async (req: Request, res: Response) => {
    const { gatewayId, providerId, isRecommended, commission } = req.body;
    const { priority } = req.body;

    if (!gatewayId || !providerId) {
      return res.status(400).json({
        success: false,
        message: "Gateway ID and Provider ID are required",
      });
    }

    // Validate gateway exists
    const existingGateway = await PaymentGatewayModel.getById(
      Number(gatewayId)
    );
    if (!existingGateway || existingGateway.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment gateway not found",
      });
    }

    // Validate provider exists
    const existingProvider = await PaymentProviderModel.getById(
      Number(providerId)
    );
    if (!existingProvider || existingProvider.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment provider not found",
      });
    }

    // Check if relationship already exists
    const existingRelationship = await PaymentGatewayProviderModel.getAll({
      gatewayId: Number(gatewayId),
      providerId: Number(providerId),
    });

    if (existingRelationship && existingRelationship.data.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Provider is already assigned to this gateway",
      });
    }

    const newRelationship = await PaymentGatewayProviderModel.create({
      gatewayId: Number(gatewayId),
      providerId: Number(providerId),
      priority: priority || null,
      isRecommended: isRecommended || false,
      commission: commission,
    });

    // If this relationship is set as recommended, update others to false
    if (isRecommended) {
      // Get the created relationship to find its ID
      const createdRelationship = await PaymentGatewayProviderModel.getAll({
        gatewayId: Number(gatewayId),
      });

      if (createdRelationship.data.length > 0) {
        await PaymentGatewayProviderModel.updateOtherRecommendations(
          Number(gatewayId),
          createdRelationship.data[0].id
        );
      }
    }

    res.status(201).json({
      success: true,
      data: newRelationship,
      message: "Provider assigned to gateway successfully",
    });
  }),

  // Update relationship priority
  updatePriority: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { priority } = req.body;

    const existingRelationship = await PaymentGatewayProviderModel.getAll({
      id: Number(id),
    });
    if (!existingRelationship || existingRelationship.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gateway-provider relationship not found",
      });
    }

    const updatedRelationship = await PaymentGatewayProviderModel.update(
      Number(id),
      { priority }
    );

    res.status(200).json({
      success: true,
      data: updatedRelationship,
      message: "Priority updated successfully",
    });
  }),
  // Update recommendation
  updateRcommendation: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { isRecommended } = req.body;

    const existingRelationship = await PaymentGatewayProviderModel.getAll({
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
      await PaymentGatewayProviderModel.updateOtherRecommendations(
        relationship.gatewayId,
        Number(id)
      );
    }

    const updatedRelationship = await PaymentGatewayProviderModel.update(
      Number(id),
      { isRecommended }
    );

    res.status(200).json({
      success: true,
      data: updatedRelationship,
      message: "Recommendation updated successfully",
    });
  }),
  // Update relationship status
  updateStatus: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'active' or 'inactive'",
      });
    }

    const existingRelationship = await PaymentGatewayProviderModel.getAll({
      id: Number(id),
    });
    if (!existingRelationship || existingRelationship.data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Gateway-provider relationship not found",
      });
    }

    const updatedRelationship = await PaymentGatewayProviderModel.update(
      Number(id),
      { status }
    );

    res.status(200).json({
      success: true,
      data: updatedRelationship,
      message: `Status updated to ${status} successfully`,
    });
  }),

  // Update recommendation
  updateGatewayProvider: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body;

    const existingRelationship = await PaymentGatewayProviderModel.getAll({
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
      await PaymentGatewayProviderModel.updateOtherRecommendations(
        relationship.gatewayId,
        Number(id)
      );
    }

    const updatedRelationship = await PaymentGatewayProviderModel.update(
      Number(id),
      body
    );

    res.status(200).json({
      success: true,
      data: updatedRelationship,
      message: "Gateway provider updated successfully",
    });
  }),

  // Remove provider from gateway
  removeProviderFromGateway: asyncHandler(
    async (req: Request, res: Response) => {
      const { id } = req.params;

      const existingRelationship = await PaymentGatewayProviderModel.getAll({
        id: Number(id),
      });
      if (!existingRelationship || existingRelationship.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Gateway-provider relationship not found",
        });
      }

      await PaymentGatewayProviderModel.delete(Number(id));

      res.status(200).json({
        success: true,
        message: "Provider removed from gateway successfully",
      });
    }
  ),

  // Remove provider from gateway by gateway and provider IDs
  removeProviderFromGatewayByIds: asyncHandler(
    async (req: Request, res: Response) => {
      const { gatewayId, providerId } = req.params;

      const existingRelationship = await PaymentGatewayProviderModel.getAll({
        gatewayId: Number(gatewayId),
        providerId: Number(providerId),
      });

      if (!existingRelationship || existingRelationship.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Gateway-provider relationship not found",
        });
      }

      await PaymentGatewayProviderModel.deleteByGatewayAndProvider(
        Number(gatewayId),
        Number(providerId)
      );

      res.status(200).json({
        success: true,
        message: "Provider removed from gateway successfully",
      });
    }
  ),
};
