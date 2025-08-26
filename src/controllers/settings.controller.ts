import { Request, Response } from "express";
import { SettingsModel } from "../models/settings.model";

export const getAllSettings = async (req: Request, res: Response) => {
  try {
    const result = await SettingsModel.getAll();
    return res.json({ status: true, data: result });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch settings" });
  }
};

export const getSettingsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const settingsId = Number(id);
    
    if (isNaN(settingsId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid settings ID" });
    }

    const result = await SettingsModel.getById(settingsId);
    
    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Settings not found" });
    }

    return res.json({ status: true, data: result[0] });
  } catch (error) {
    console.error("Error fetching settings by ID:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch settings" });
  }
};

export const getCurrentSettings = async (req: Request, res: Response) => {
  try {
    const result = await SettingsModel.getFirst();
    
    if (!result) {
      return res
        .status(404)
        .json({ status: false, message: "No settings found" });
    }

    return res.json({ status: true, data: result });
  } catch (error) {
    console.error("Error fetching current settings:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch current settings" });
  }
};

export const createSettings = async (req: Request, res: Response) => {
  try {
    const { defaultTurnover,adminBalance } = req.body;

    if (defaultTurnover === undefined || defaultTurnover === null) {
      return res
        .status(400)
        .json({ status: false, message: "defaultTurnover is required" });
    }

    const result = await SettingsModel.create({
      defaultTurnover: Number(defaultTurnover),
      adminBalance: Number(adminBalance).toString()
    });

    return res.status(201).json({
      status: true,
      message: "Settings created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating settings:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to create settings" });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const settingsId = Number(id);
    
    if (isNaN(settingsId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid settings ID" });
    }

    const { defaultTurnover } = req.body;

    if (defaultTurnover === undefined || defaultTurnover === null) {
      return res
        .status(400)
        .json({ status: false, message: "defaultTurnover is required" });
    }

    const result = await SettingsModel.update(settingsId, {
      defaultTurnover: Number(defaultTurnover),
    });

    return res.json({
      status: true,
      message: "Settings updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to update settings" });
  }
};

export const updateCurrentSettings = async (req: Request, res: Response) => {
  try {
    const { defaultTurnover } = req.body;

    if (defaultTurnover === undefined || defaultTurnover === null) {
      return res
        .status(400)
        .json({ status: false, message: "defaultTurnover is required" });
    }

    const result = await SettingsModel.updateFirst({
      defaultTurnover: Number(defaultTurnover),
    });

    return res.json({
      status: true,
      message: "Settings updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating current settings:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to update settings" });
  }
};

export const deleteSettings = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const settingsId = Number(id);
    
    if (isNaN(settingsId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid settings ID" });
    }

    const result = await SettingsModel.delete(settingsId);

    return res.json({
      status: true,
      message: "Settings deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting settings:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to delete settings" });
  }
};

export const getDefaultTurnover = async (req: Request, res: Response) => {
  try {
    const defaultTurnover = await SettingsModel.getDefaultTurnover();
    
    return res.json({ 
      status: true, 
      data: { defaultTurnover } 
    });
  } catch (error) {
    console.error("Error fetching default turnover:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch default turnover" });
  }
};

export const setDefaultTurnover = async (req: Request, res: Response) => {
  try {
    const { defaultTurnover } = req.body;

    if (defaultTurnover === undefined || defaultTurnover === null) {
      return res
        .status(400)
        .json({ status: false, message: "defaultTurnover is required" });
    }

    const result = await SettingsModel.setDefaultTurnover(Number(defaultTurnover));

    return res.json({
      status: true,
      message: "Default turnover updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error setting default turnover:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to set default turnover" });
  }
};
