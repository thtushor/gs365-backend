import { Request, Response } from "express";
import { AdminMainBalanceModel, AdminMainBalanceData, AdminMainBalanceFilters, PaginationParams } from "../models/adminMainBalance.model";
import { asyncHandler } from "../utils/asyncHandler";

export const AdminMainBalanceController = {
  // Create a new admin main balance record
  create: asyncHandler(async (req: Request, res: Response) => {
    try {
      const {
        amount,
        type,
        status,
        promotionId,
        transactionId,
        promotionName,
        currencyId,
        createdByPlayer,
        createdByAdmin,
        notes,
      } = req.body;

      // Validate required fields
      if (!amount || !type || !currencyId) {
        return res.status(400).json({
          success: false,
          message: "amount, type, and currencyId are required",
        });
      }

      // Validate type
      const validTypes = ["admin_deposit", "player_deposit", "promotion", "player_withdraw", "admin_withdraw"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "type must be one of: admin_deposit, player_deposit, promotion, player_withdraw, admin_withdraw",
        });
      }

      // Validate status if provided
      if (status) {
        const validStatuses = ["approved", "pending", "rejected"];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: "status must be one of: approved, pending, rejected",
          });
        }
      }

      // Validate amount
      if (amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "amount must be greater than 0",
        });
      }

      const data: AdminMainBalanceData = {
        amount: Number(amount),
        type: type as any,
        status: status ? (status as any) : undefined,
        promotionId: promotionId ? Number(promotionId) : undefined,
        transactionId: transactionId ? Number(transactionId) : undefined,
        promotionName: promotionName || undefined,
        currencyId: currencyId ? Number(currencyId) : undefined,
        createdByPlayer: createdByPlayer ? Number(createdByPlayer) : undefined,
        createdByAdmin: createdByAdmin ? Number(createdByAdmin) : undefined,
        notes: notes || undefined,
      };

      const id = await AdminMainBalanceModel.create(data);

      res.status(201).json({
        success: true,
        message: "Admin main balance record created successfully",
        data: { id },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to create admin main balance record",
        error: error.message,
      });
    }
  }),

  // Get admin main balance by ID
  getById: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID is required",
        });
      }

      const record = await AdminMainBalanceModel.getById(Number(id));

      if (!record) {
        return res.status(404).json({
          success: false,
          message: "Admin main balance record not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Admin main balance record retrieved successfully",
        data: record,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve admin main balance record",
        error: error.message,
      });
    }
  }),

  // Update admin main balance record
  update: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID is required",
        });
      }

      // Validate type if provided
      if (updateData.type) {
        const validTypes = ["admin_deposit", "player_deposit", "promotion", "player_withdraw", "admin_withdraw"];
        if (!validTypes.includes(updateData.type)) {
          return res.status(400).json({
            success: false,
            message: "type must be one of: admin_deposit, player_deposit, promotion, player_withdraw, admin_withdraw",
          });
        }
      }

      // Validate status if provided
      if (updateData.status) {
        const validStatuses = ["approved", "pending", "rejected"];
        if (!validStatuses.includes(updateData.status)) {
          return res.status(400).json({
            success: false,
            message: "status must be one of: approved, pending, rejected",
          });
        }
      }

      // Validate amount if provided
      if (updateData.amount && updateData.amount <= 0) {
        return res.status(400).json({
          success: false,
          message: "amount must be greater than 0",
        });
      }

      const success = await AdminMainBalanceModel.update(Number(id), updateData);

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Admin main balance record not found or no changes made",
        });
      }

      res.status(200).json({
        success: true,
        message: "Admin main balance record updated successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to update admin main balance record",
        error: error.message,
      });
    }
  }),

  // Delete admin main balance record
  delete: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "ID is required",
        });
      }

      const success = await AdminMainBalanceModel.delete(Number(id));

      if (!success) {
        return res.status(404).json({
          success: false,
          message: "Admin main balance record not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Admin main balance record deleted successfully",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to delete admin main balance record",
        error: error.message,
      });
    }
  }),

  // Get all admin main balance records with filters and pagination
  getAll: asyncHandler(async (req: Request, res: Response) => {
    try {
      const {
        type,
        status,
        promotionId,
        transactionId,
        createdByPlayer,
        createdByAdmin,
        currencyId,
        startDate,
        endDate,
        search,
        page,
        pageSize,
        sortBy,
        sortOrder,
      } = req.query;

      const filters: AdminMainBalanceFilters = {};
      const pagination: PaginationParams = {};

      // Build filters
      if (type) filters.type = type as string;
      if (status) filters.status = status as string;
      if (promotionId) filters.promotionId = Number(promotionId);
      if (transactionId) filters.transactionId = Number(transactionId);
      if (createdByPlayer) filters.createdByPlayer = Number(createdByPlayer);
      if (createdByAdmin) filters.createdByAdmin = Number(createdByAdmin);
      if (currencyId) filters.currencyId = Number(currencyId);
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;
      if (search) filters.search = search as string;

      // Build pagination
      if (page) pagination.page = Number(page);
      if (pageSize) pagination.pageSize = Number(pageSize);
      if (sortBy) pagination.sortBy = sortBy as string;
      if (sortOrder) pagination.sortOrder = sortOrder as "asc" | "desc";

      const result = await AdminMainBalanceModel.getAll(filters, pagination);

      res.status(200).json({
        success: true,
        message: "Admin main balance records retrieved successfully",
        data: result.data,
        pagination: result.pagination,
        stats: result.stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve admin main balance records",
        error: error.message,
      });
    }
  }),

  // Get current main balance and stats
  getStats: asyncHandler(async (req: Request, res: Response) => {
    try {
      const {
        currencyId,
        status,
        startDate,
        endDate,
      } = req.query;

      const filters: AdminMainBalanceFilters = {};

      if (currencyId) filters.currencyId = Number(currencyId);
      if (status) filters.status = status as string;
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;

      const stats = await AdminMainBalanceModel.calculateStats(filters);

      res.status(200).json({
        success: true,
        message: "Admin main balance stats retrieved successfully",
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve admin main balance stats",
        error: error.message,
      });
    }
  }),

  // Get balance by type
  getBalanceByType: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { type } = req.params;
      const {
        currencyId,
        startDate,
        endDate,
      } = req.query;

      if (!type) {
        return res.status(400).json({
          success: false,
          message: "Type is required",
        });
      }

      const validTypes = ["admin_deposit", "player_deposit", "promotion", "player_withdraw", "admin_withdraw"];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "type must be one of: admin_deposit, player_deposit, promotion, player_withdraw, admin_withdraw",
        });
      }

      const filters: AdminMainBalanceFilters = {};

      if (currencyId) filters.currencyId = Number(currencyId);
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;

      const balance = await AdminMainBalanceModel.getBalanceByType(type as any, filters);

      res.status(200).json({
        success: true,
        message: `${type} balance retrieved successfully`,
        data: {
          type,
          balance,
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve balance by type",
        error: error.message,
      });
    }
  }),

  // Get recent transactions
  getRecentTransactions: asyncHandler(async (req: Request, res: Response) => {
    try {
      const { pageSize = 10 } = req.query;

      const transactions = await AdminMainBalanceModel.getRecentTransactions(Number(pageSize));

      res.status(200).json({
        success: true,
        message: "Recent transactions retrieved successfully",
        data: transactions,
        count: transactions.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve recent transactions",
        error: error.message,
      });
    }
  }),

  // Get current main balance calculation
  getCurrentMainBalance: asyncHandler(async (req: Request, res: Response) => {
    try {
      const {
        currencyId,
        status,
        startDate,
        endDate,
      } = req.query;

      const filters: AdminMainBalanceFilters = {};

      if (currencyId) filters.currencyId = Number(currencyId);
      if (status) filters.status = status as string;
      if (startDate) filters.startDate = startDate as string;
      if (endDate) filters.endDate = endDate as string;

      const stats = await AdminMainBalanceModel.calculateStats(filters);

      res.status(200).json({
        success: true,
        message: "Current main balance calculated successfully",
        data: {
          currentMainBalance: stats.currentMainBalance,
          calculation: {
            totalAdminDeposit: stats.totalAdminDeposit,
            totalPlayerDeposit: stats.totalPlayerDeposit,
            totalPromotion: stats.totalPromotion,
            totalPlayerWithdraw: stats.totalPlayerWithdraw,
            totalAdminWithdraw: stats.totalAdminWithdraw,
            formula: "current main balance = total admin deposit - total player deposit - total promotion + total player withdraw + total admin withdraw"
          }
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: "Failed to calculate current main balance",
        error: error.message,
      });
    }
  }),
};
