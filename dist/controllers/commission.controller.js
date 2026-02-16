"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionController = void 0;
const commission_model_1 = require("../models/commission.model");
const asyncHandler_1 = require("../utils/asyncHandler");
class CommissionController {
}
exports.CommissionController = CommissionController;
_a = CommissionController;
// Create new commission
CommissionController.createCommission = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const commissionData = {
        betResultId: req.body.betResultId,
        playerId: req.body.playerId,
        adminUserId: req.body.adminUserId,
        commissionAmount: req.body.commissionAmount.toString(),
        percentage: req.body.percentage.toString(),
        status: req.body.status || "pending",
        notes: req.body.notes,
        createdBy: req.body.createdBy,
    };
    const newCommission = await commission_model_1.CommissionModel.createCommission(commissionData);
    res.status(201).json({
        success: true,
        message: "Commission created successfully",
        data: newCommission,
    });
});
// Get commission by ID
CommissionController.getCommissionById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const commission = await commission_model_1.CommissionModel.getCommissionById(parseInt(id));
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
// Get total commission by Affiliate ID
// Get commission by ID
CommissionController.getTotalCommission = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { affiliateId } = req.params;
    if (!affiliateId) {
        return res.status(400).json({
            success: false,
            message: "Affiliate ID is required",
        });
    }
    const commission = await commission_model_1.CommissionModel.getTotalCommissionWinLossByAffiliate(parseInt(affiliateId));
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
CommissionController.getAllCommissions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const result = await commission_model_1.CommissionModel.getAllCommissions({
        search,
        adminUserId: Number(req?.query?.adminUserId),
        playerId: Number(req?.query?.playerId),
        page: Number(page),
        pageSize: Number(limit),
    });
    res.status(200).json({
        status: true,
        data: result.data,
        pagination: result.pagination,
    });
});
// Get commissions by admin user ID
CommissionController.getCommissionsByAdminUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { adminUserId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await commission_model_1.CommissionModel.getCommissionsByAdminUser(parseInt(adminUserId), page, limit);
    res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
    });
});
// Get commissions by player ID
CommissionController.getCommissionsByPlayer = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { playerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await commission_model_1.CommissionModel.getCommissionsByPlayer(parseInt(playerId), page, limit);
    res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
    });
});
// Get commissions by bet result ID
CommissionController.getCommissionsByBetResult = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { betResultId } = req.params;
    const commissions = await commission_model_1.CommissionModel.getCommissionsByBetResult(parseInt(betResultId));
    res.status(200).json({
        success: true,
        data: commissions,
    });
});
// Get commissions by status
CommissionController.getCommissionsByStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { status } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await commission_model_1.CommissionModel.getCommissionsByStatus(status, page, limit);
    res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
    });
});
// Update commission
CommissionController.updateCommission = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = {
        commissionAmount: req.body.commissionAmount?.toString(),
        percentage: req.body.percentage?.toString(),
        status: req.body.status,
        notes: req.body.notes,
        updatedBy: req.body.updatedBy,
    };
    const updatedCommission = await commission_model_1.CommissionModel.updateCommission(parseInt(id), updateData);
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
CommissionController.deleteCommission = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const deletedCommission = await commission_model_1.CommissionModel.deleteCommission(parseInt(id));
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
CommissionController.getCommissionStats = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const stats = await commission_model_1.CommissionModel.getCommissionStats();
    res.status(200).json({
        success: true,
        data: stats,
    });
});
// Get commission statistics by admin user
CommissionController.getCommissionStatsByAdminUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { adminUserId } = req.params;
    const stats = await commission_model_1.CommissionModel.getCommissionStatsByAdminUser(parseInt(adminUserId));
    res.status(200).json({
        success: true,
        data: stats,
    });
});
// Approve commission
CommissionController.approveCommission = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = {
        status: "approved",
        updatedBy: req.body.updatedBy,
    };
    const updatedCommission = await commission_model_1.CommissionModel.updateCommission(parseInt(id), updateData);
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
CommissionController.rejectCommission = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = {
        status: "rejected",
        notes: req.body.notes,
        updatedBy: req.body.updatedBy,
    };
    const updatedCommission = await commission_model_1.CommissionModel.updateCommission(parseInt(id), updateData);
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
CommissionController.markCommissionAsPaid = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const updateData = {
        status: "paid",
        updatedBy: req.body.updatedBy,
    };
    const updatedCommission = await commission_model_1.CommissionModel.updateCommission(parseInt(id), updateData);
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
