import { Request, Response } from "express";
import {
  createUserLoginHistory,
  getUserLoginHistoryByUserId,
  getAllUserLoginHistory,
  deleteUserLoginHistory,
  UserLoginHistoryFilters,
} from "../models/userLoginHistory.model";
import { JwtPayload } from "../utils/jwt";

export const createUserLoginHistoryController = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      ipAddress,
      userAgent,
      deviceType,
      deviceName,
      osVersion,
      browser,
      browserVersion,
    } = req.body;

    if (!userId || !ipAddress) {
      return res.status(400).json({
        status: false,
        message: "Missing required fields: userId, ipAddress",
      });
    }

    const loginHistory = await createUserLoginHistory({
      userId,
      ipAddress,
      userAgent,
      deviceType,
      deviceName,
      osVersion,
      browser,
      browserVersion,
    });

    return res.status(201).json({
      status: true,
      message: "Login history recorded successfully",
      data: loginHistory,
    });
  } catch (error) {
    console.error("Error creating login history:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to record login history",
    });
  }
};

export const getUserLoginHistoryByUserIdController = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const {
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
      });
    }

    const filters: UserLoginHistoryFilters = {
      startDate: startDate as string,
      endDate: endDate as string,
      page: Number(page),
      pageSize: Number(pageSize),
    };

    const result = await getUserLoginHistoryByUserId(Number(userId), filters);

    return res.json({
      status: true,
      message: "Login history fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching login history:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch login history",
    });
  }
};

export const getAllUserLoginHistoryController = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      startDate,
      endDate,
      page = 1,
      pageSize = 10,
    } = req.query;

    const filters: UserLoginHistoryFilters = {
      userId: userId ? Number(userId) : undefined,
      startDate: startDate as string,
      endDate: endDate as string,
      page: Number(page),
      pageSize: Number(pageSize),
    };

    const result = await getAllUserLoginHistory(filters);

    return res.json({
      status: true,
      message: "All login history fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching all login history:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch login history",
    });
  }
};

export const deleteUserLoginHistoryController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        status: false,
        message: "Login history ID is required",
      });
    }

    const result = await deleteUserLoginHistory(Number(id));

    return res.json({
      status: true,
      message: "Login history deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting login history:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to delete login history",
    });
  }
};