import { Request, Response } from "express";
import { RejectReasonModel } from "../models/rejectReason.model";

export const getAllRejectReasons = async (req: Request, res: Response) => {
    try {
        const result = await RejectReasonModel.getAll();
        return res.json({ status: true, data: result });
    } catch (error) {
        console.error("Error fetching reject reasons:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to fetch reject reasons" });
    }
};

export const createRejectReason = async (req: Request, res: Response) => {
    try {
        const { reason, description } = req.body;
        if (!reason) {
            return res
                .status(400)
                .json({ status: false, message: "Reason is required" });
        }
        const result = await RejectReasonModel.create({ reason, description });
        return res.status(201).json({
            status: true,
            message: "Reject reason created successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error creating reject reason:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to create reject reason" });
    }
};

export const updateRejectReason = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason, description } = req.body;
        if (!id) {
            return res.status(400).json({ status: false, message: "ID is required" });
        }
        const result = await RejectReasonModel.update(Number(id), {
            reason,
            description,
        });
        return res.json({
            status: true,
            message: "Reject reason updated successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error updating reject reason:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to update reject reason" });
    }
};

export const deleteRejectReason = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ status: false, message: "ID is required" });
        }
        const result = await RejectReasonModel.delete(Number(id));
        return res.json({
            status: true,
            message: "Reject reason deleted successfully",
            data: result,
        });
    } catch (error) {
        console.error("Error deleting reject reason:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to delete reject reason" });
    }
};
