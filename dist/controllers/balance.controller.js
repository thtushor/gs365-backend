"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyBalanceSummary = exports.getMyBalance = exports.getAllPlayerBalances = exports.getCurrencyBalance = exports.getPlayerBalanceSummary = exports.getPlayerBalance = void 0;
const balance_model_1 = require("../models/balance.model");
const getPlayerBalance = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currencyId } = req.query;
        const userIdNum = Number(userId);
        if (isNaN(userIdNum)) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid user ID" });
        }
        const currencyIdNum = currencyId ? Number(currencyId) : undefined;
        if (currencyId && isNaN(currencyIdNum)) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid currency ID" });
        }
        const balance = await balance_model_1.BalanceModel.calculatePlayerBalance(userIdNum, currencyIdNum);
        return res.json({
            status: true,
            data: balance,
            message: "Player balance calculated successfully"
        });
    }
    catch (error) {
        console.error("Error getting player balance:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to calculate player balance" });
    }
};
exports.getPlayerBalance = getPlayerBalance;
const getPlayerBalanceSummary = async (req, res) => {
    try {
        const { userId } = req.params;
        const userIdNum = Number(userId);
        if (isNaN(userIdNum)) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid user ID" });
        }
        const summary = await balance_model_1.BalanceModel.getBalanceSummary(userIdNum);
        return res.json({
            status: true,
            data: summary,
            message: "Player balance summary retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error getting player balance summary:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to get player balance summary" });
    }
};
exports.getPlayerBalanceSummary = getPlayerBalanceSummary;
const getCurrencyBalance = async (req, res) => {
    try {
        const { userId, currencyId } = req.params;
        const userIdNum = Number(userId);
        const currencyIdNum = Number(currencyId);
        if (isNaN(userIdNum) || isNaN(currencyIdNum)) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid user ID or currency ID" });
        }
        const balance = await balance_model_1.BalanceModel.getCurrencyBalance(userIdNum, currencyIdNum);
        if (!balance) {
            return res
                .status(404)
                .json({ status: false, message: "No balance found for this user and currency" });
        }
        return res.json({
            status: true,
            data: balance,
            message: "Currency balance retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error getting currency balance:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to get currency balance" });
    }
};
exports.getCurrencyBalance = getCurrencyBalance;
const getAllPlayerBalances = async (req, res) => {
    try {
        const { userId, currencyId, status } = req.query;
        const filters = {};
        if (userId) {
            const userIdNum = Number(userId);
            if (isNaN(userIdNum)) {
                return res
                    .status(400)
                    .json({ status: false, message: "Invalid user ID" });
            }
            filters.userId = userIdNum;
        }
        if (currencyId) {
            const currencyIdNum = Number(currencyId);
            if (isNaN(currencyIdNum)) {
                return res
                    .status(400)
                    .json({ status: false, message: "Invalid currency ID" });
            }
            filters.currencyId = currencyIdNum;
        }
        if (status && ['all', 'approved', 'pending'].includes(status)) {
            filters.status = status;
        }
        const balances = await balance_model_1.BalanceModel.calculateAllPlayerBalances(filters);
        return res.json({
            status: true,
            data: balances,
            message: "All player balances retrieved successfully",
            count: balances.length
        });
    }
    catch (error) {
        console.error("Error getting all player balances:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to get all player balances" });
    }
};
exports.getAllPlayerBalances = getAllPlayerBalances;
const getMyBalance = async (req, res) => {
    try {
        // Extract user ID from JWT token (assuming it's added by verifyToken middleware)
        const userId = req.user?.id;
        if (!userId) {
            return res
                .status(401)
                .json({ status: false, message: "User not authenticated" });
        }
        const { currencyId } = req.query;
        const currencyIdNum = currencyId ? Number(currencyId) : undefined;
        if (currencyId && isNaN(currencyIdNum)) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid currency ID" });
        }
        const balance = await balance_model_1.BalanceModel.calculatePlayerBalance(userId, currencyIdNum);
        return res.json({
            status: true,
            data: balance,
            message: "Your balance retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error getting my balance:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to get your balance" });
    }
};
exports.getMyBalance = getMyBalance;
const getMyBalanceSummary = async (req, res) => {
    try {
        // Extract user ID from JWT token (assuming it's added by verifyToken middleware)
        const userId = req.user?.id;
        if (!userId) {
            return res
                .status(401)
                .json({ status: false, message: "User not authenticated" });
        }
        const summary = await balance_model_1.BalanceModel.getBalanceSummary(userId);
        return res.json({
            status: true,
            data: summary,
            message: "Your balance summary retrieved successfully"
        });
    }
    catch (error) {
        console.error("Error getting my balance summary:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to get your balance summary" });
    }
};
exports.getMyBalanceSummary = getMyBalanceSummary;
