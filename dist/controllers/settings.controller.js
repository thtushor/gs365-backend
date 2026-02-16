"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setDefaultTurnover = exports.getDefaultTurnover = exports.deleteSettings = exports.updateCurrentSettings = exports.updateSettings = exports.createSettings = exports.getCurrentSettings = exports.getSettingsById = exports.getAllSettings = void 0;
const settings_model_1 = require("../models/settings.model");
const getAllSettings = async (req, res) => {
    try {
        const result = await settings_model_1.SettingsModel.getAll();
        return res.json({ status: true, data: result });
    }
    catch (error) {
        console.error("Error fetching settings:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to fetch settings" });
    }
};
exports.getAllSettings = getAllSettings;
const getSettingsById = async (req, res) => {
    try {
        const { id } = req.params;
        const settingsId = Number(id);
        if (isNaN(settingsId)) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid settings ID" });
        }
        const result = await settings_model_1.SettingsModel.getById(settingsId);
        if (!result || result.length === 0) {
            return res
                .status(404)
                .json({ status: false, message: "Settings not found" });
        }
        return res.json({ status: true, data: result[0] });
    }
    catch (error) {
        console.error("Error fetching settings by ID:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to fetch settings" });
    }
};
exports.getSettingsById = getSettingsById;
const getCurrentSettings = async (req, res) => {
    try {
        const result = await settings_model_1.SettingsModel.getFirst();
        if (!result) {
            return res
                .status(404)
                .json({ status: false, message: "No settings found" });
        }
        return res.json({ status: true, data: result });
    }
    catch (error) {
        console.error("Error fetching current settings:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to fetch current settings" });
    }
};
exports.getCurrentSettings = getCurrentSettings;
const createSettings = async (req, res) => {
    try {
        const { defaultTurnover, adminBalance, ...rest } = req.body;
        if (defaultTurnover === undefined || defaultTurnover === null) {
            return res
                .status(400)
                .json({ status: false, message: "defaultTurnover is required" });
        }
        const result = await settings_model_1.SettingsModel.create({
            defaultTurnover: Number(defaultTurnover),
            adminBalance: Number(adminBalance).toString(),
            ...rest
        });
        return res.status(201).json({
            status: true,
            message: "Settings created successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error creating settings:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to create settings" });
    }
};
exports.createSettings = createSettings;
const updateSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const settingsId = Number(id);
        if (isNaN(settingsId)) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid settings ID" });
        }
        const { defaultTurnover, adminBalance, ...rest } = req.body;
        if (defaultTurnover === undefined || defaultTurnover === null) {
            return res
                .status(400)
                .json({ status: false, message: "defaultTurnover is required" });
        }
        const result = await settings_model_1.SettingsModel.update(settingsId, {
            defaultTurnover: Number(defaultTurnover),
            adminBalance: Number(adminBalance || 0).toString(),
            ...rest
        });
        return res.json({
            status: true,
            message: "Settings updated successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error updating settings:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to update settings" });
    }
};
exports.updateSettings = updateSettings;
const updateCurrentSettings = async (req, res) => {
    try {
        const { defaultTurnover } = req.body;
        if (defaultTurnover === undefined || defaultTurnover === null) {
            return res
                .status(400)
                .json({ status: false, message: "defaultTurnover is required" });
        }
        const result = await settings_model_1.SettingsModel.updateFirst({
            defaultTurnover: Number(defaultTurnover),
        });
        return res.json({
            status: true,
            message: "Settings updated successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error updating current settings:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to update settings" });
    }
};
exports.updateCurrentSettings = updateCurrentSettings;
const deleteSettings = async (req, res) => {
    try {
        const { id } = req.params;
        const settingsId = Number(id);
        if (isNaN(settingsId)) {
            return res
                .status(400)
                .json({ status: false, message: "Invalid settings ID" });
        }
        const result = await settings_model_1.SettingsModel.delete(settingsId);
        return res.json({
            status: true,
            message: "Settings deleted successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error deleting settings:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to delete settings" });
    }
};
exports.deleteSettings = deleteSettings;
const getDefaultTurnover = async (req, res) => {
    try {
        const defaultTurnover = await settings_model_1.SettingsModel.getDefaultTurnover();
        return res.json({
            status: true,
            data: { defaultTurnover }
        });
    }
    catch (error) {
        console.error("Error fetching default turnover:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to fetch default turnover" });
    }
};
exports.getDefaultTurnover = getDefaultTurnover;
const setDefaultTurnover = async (req, res) => {
    try {
        const { defaultTurnover } = req.body;
        if (defaultTurnover === undefined || defaultTurnover === null) {
            return res
                .status(400)
                .json({ status: false, message: "defaultTurnover is required" });
        }
        const result = await settings_model_1.SettingsModel.setDefaultTurnover(Number(defaultTurnover));
        return res.json({
            status: true,
            message: "Default turnover updated successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error setting default turnover:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to set default turnover" });
    }
};
exports.setDefaultTurnover = setDefaultTurnover;
