import { Request, Response } from "express";
import { TurnoverModel, TurnoverFilters } from "../models/turnover.model";

export const getAllTurnovers = async (req: Request, res: Response) => {
  try {
    const filters: TurnoverFilters = {
      userId: req.query.userId ? Number(req.query.userId) : undefined,
      type: req.query.type as "default" | "promotion" | undefined,
      status: req.query.status as "active" | "inactive" | undefined,
      turnoverName: req.query.turnoverName as string | undefined,
      keyword: req.query.keyword as string | undefined,
      transactionId: req.query.transactionId ? Number(req.query.transactionId) : undefined,
      page: req.query.page as string | number | undefined,
      pageSize: req.query.pageSize as string | number | undefined,
    };

    const result = await TurnoverModel.getAll(filters);
    return res.json({ status: true, data: result });
  } catch (error) {
    console.error("Error fetching turnovers:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch turnovers" });
  }
};

export const getTurnoverById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const turnoverId = Number(id);
    
    if (isNaN(turnoverId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid turnover ID" });
    }

    const result = await TurnoverModel.getById(turnoverId);
    
    if (!result || result.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "Turnover not found" });
    }

    return res.json({ status: true, data: result[0] });
  } catch (error) {
    console.error("Error fetching turnover by ID:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch turnover" });
  }
};

export const createTurnover = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      type,
      status,
      turnoverName,
      targetTurnover,
      remainingTurnover,
      transactionId,
    } = req.body;

    if (!userId || !type || !status || !turnoverName || !targetTurnover) {
      return res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
    }

    const result = await TurnoverModel.create({
      userId: Number(userId),
      type,
      status,
      turnoverName,
      targetTurnover: targetTurnover || "0",
      remainingTurnover: remainingTurnover || targetTurnover || "0",
      transactionId: transactionId ? Number(transactionId) : undefined,
    });

    return res.status(201).json({
      status: true,
      message: "Turnover created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating turnover:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to create turnover" });
  }
};

export const updateTurnover = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const turnoverId = Number(id);
    
    if (isNaN(turnoverId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid turnover ID" });
    }

    const {
      userId,
      type,
      status,
      turnoverName,
      targetTurnover,
      remainingTurnover,
      transactionId,
    } = req.body;

    const updateData: any = {};
    if (userId !== undefined) updateData.userId = Number(userId);
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (turnoverName !== undefined) updateData.turnoverName = turnoverName;
    if (targetTurnover !== undefined) updateData.targetTurnover = Number(targetTurnover);
    if (remainingTurnover !== undefined) updateData.remainingTurnover = Number(remainingTurnover);
    if (transactionId !== undefined) updateData.transactionId = Number(transactionId);

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "No fields to update" });
    }

    const result = await TurnoverModel.update(turnoverId, updateData);

    return res.json({
      status: true,
      message: "Turnover updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating turnover:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to update turnover" });
  }
};

export const deleteTurnover = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const turnoverId = Number(id);
    
    if (isNaN(turnoverId)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid turnover ID" });
    }

    const result = await TurnoverModel.delete(turnoverId);

    return res.json({
      status: true,
      message: "Turnover deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error deleting turnover:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to delete turnover" });
  }
};
