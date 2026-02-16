"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserLoginHistoryController = exports.getAllUserLoginHistoryController = exports.getUserLoginHistoryByUserIdController = exports.createUserLoginHistoryController = void 0;
const userLoginHistory_model_1 = require("../models/userLoginHistory.model");
const createUserLoginHistoryController = async (req, res) => {
    try {
        const { userId, ipAddress, userAgent, deviceType, deviceName, osVersion, browser, browserVersion, } = req.body;
        if (!userId || !ipAddress) {
            return res.status(400).json({
                status: false,
                message: "Missing required fields: userId, ipAddress",
            });
        }
        const loginHistory = await (0, userLoginHistory_model_1.createUserLoginHistory)({
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
    }
    catch (error) {
        console.error("Error creating login history:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to record login history",
        });
    }
};
exports.createUserLoginHistoryController = createUserLoginHistoryController;
const getUserLoginHistoryByUserIdController = async (req, res) => {
    try {
        const { userId } = req.params;
        const { startDate, endDate, page = 1, pageSize = 10, } = req.query;
        if (!userId) {
            return res.status(400).json({
                status: false,
                message: "User ID is required",
            });
        }
        const filters = {
            startDate: startDate,
            endDate: endDate,
            page: Number(page),
            pageSize: Number(pageSize),
        };
        const result = await (0, userLoginHistory_model_1.getUserLoginHistoryByUserId)(Number(userId), filters);
        return res.json({
            status: true,
            message: "Login history fetched successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error fetching login history:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to fetch login history",
        });
    }
};
exports.getUserLoginHistoryByUserIdController = getUserLoginHistoryByUserIdController;
const getAllUserLoginHistoryController = async (req, res) => {
    try {
        const { userId, startDate, endDate, page = 1, pageSize = 10, } = req.query;
        const filters = {
            userId: userId ? Number(userId) : undefined,
            startDate: startDate,
            endDate: endDate,
            page: Number(page),
            pageSize: Number(pageSize),
        };
        const result = await (0, userLoginHistory_model_1.getAllUserLoginHistory)(filters);
        return res.json({
            status: true,
            message: "All login history fetched successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error fetching all login history:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to fetch login history",
        });
    }
};
exports.getAllUserLoginHistoryController = getAllUserLoginHistoryController;
const deleteUserLoginHistoryController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                status: false,
                message: "Login history ID is required",
            });
        }
        const result = await (0, userLoginHistory_model_1.deleteUserLoginHistory)(Number(id));
        return res.json({
            status: true,
            message: "Login history deleted successfully",
        });
    }
    catch (error) {
        console.error("Error deleting login history:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to delete login history",
        });
    }
};
exports.deleteUserLoginHistoryController = deleteUserLoginHistoryController;
