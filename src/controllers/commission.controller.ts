import { Request, Response } from "express";
import { CommissionModel, CommissionData, CommissionUpdateData } from "../models/commission.model";
import { asyncHandler } from "../utils/asyncHandler";

export class CommissionController {
  // Create new commission
  static createCommission = asyncHandler(async (req: Request, res: Response) => {
    const commissionData: CommissionData = {
      betResultId: req.body.betResultId,
      playerId: req.body.playerId,
      adminUserId: req.body.adminUserId,
      commissionAmount: req.body.commissionAmount.toString(),
      percentage: req.body.percentage.toString(),
      status: req.body.status || "pending",
      notes: req.body.notes,
      createdBy: req.body.createdBy,
    };

    const newCommission = await CommissionModel.createCommission(commissionData);

    res.status(201).json({
      success: true,
      message: "Commission created successfully",
      data: newCommission,
    });
  });

  // Get commission by ID
  static getCommissionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const commission = await CommissionModel.getCommissionById(parseInt(id));

    if (!commission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    res.status(200).json({
      success: true,
      data: commission,
    });
  });

  // Get all commissions with pagination
  static getAllCommissions = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await CommissionModel.getAllCommissions({
      search,
      adminUserId: Number(req?.query?.adminUserId),
      playerId: Number(req?.query?.playerId),
      page: Number(page),
      pageSize: Number(limit)
    });

    res.status(200).json({
      status: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  // Get commissions by admin user ID
  static getCommissionsByAdminUser = asyncHandler(async (req: Request, res: Response) => {
    const { adminUserId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await CommissionModel.getCommissionsByAdminUser(
      parseInt(adminUserId),
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  // Get commissions by player ID
  static getCommissionsByPlayer = asyncHandler(async (req: Request, res: Response) => {
    const { playerId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await CommissionModel.getCommissionsByPlayer(
      parseInt(playerId),
      page,
      limit
    );

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  // Get commissions by bet result ID
  static getCommissionsByBetResult = asyncHandler(async (req: Request, res: Response) => {
    const { betResultId } = req.params;
    const commissions = await CommissionModel.getCommissionsByBetResult(parseInt(betResultId));

    res.status(200).json({
      success: true,
      data: commissions,
    });
  });

  // Get commissions by status
  static getCommissionsByStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await CommissionModel.getCommissionsByStatus(status, page, limit);

    res.status(200).json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  });

  // Update commission
  static updateCommission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: CommissionUpdateData = {
      commissionAmount: req.body.commissionAmount?.toString(),
      percentage: req.body.percentage?.toString(),
      status: req.body.status,
      notes: req.body.notes,
      updatedBy: req.body.updatedBy,
    };

    const updatedCommission = await CommissionModel.updateCommission(parseInt(id), updateData);

    if (!updatedCommission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Commission updated successfully",
      data: updatedCommission,
    });
  });

  // Delete commission
  static deleteCommission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedCommission = await CommissionModel.deleteCommission(parseInt(id));

    if (!deletedCommission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Commission deleted successfully",
      data: deletedCommission,
    });
  });

  // Get commission statistics
  static getCommissionStats = asyncHandler(async (req: Request, res: Response) => {
    const stats = await CommissionModel.getCommissionStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // Get commission statistics by admin user
  static getCommissionStatsByAdminUser = asyncHandler(async (req: Request, res: Response) => {
    const { adminUserId } = req.params;
    const stats = await CommissionModel.getCommissionStatsByAdminUser(parseInt(adminUserId));

    res.status(200).json({
      success: true,
      data: stats,
    });
  });

  // Approve commission
  static approveCommission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: CommissionUpdateData = {
      status: "approved",
      updatedBy: req.body.updatedBy,
    };

    const updatedCommission = await CommissionModel.updateCommission(parseInt(id), updateData);

    if (!updatedCommission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Commission approved successfully",
      data: updatedCommission,
    });
  });

  // Reject commission
  static rejectCommission = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: CommissionUpdateData = {
      status: "rejected",
      notes: req.body.notes,
      updatedBy: req.body.updatedBy,
    };

    const updatedCommission = await CommissionModel.updateCommission(parseInt(id), updateData);

    if (!updatedCommission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Commission rejected successfully",
      data: updatedCommission,
    });
  });

  // Mark commission as paid
  static markCommissionAsPaid = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: CommissionUpdateData = {
      status: "paid",
      updatedBy: req.body.updatedBy,
    };

    const updatedCommission = await CommissionModel.updateCommission(parseInt(id), updateData);

    if (!updatedCommission) {
      return res.status(404).json({
        success: false,
        message: "Commission not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Commission marked as paid successfully",
      data: updatedCommission,
    });
  });
}
