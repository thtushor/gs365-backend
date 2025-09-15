import { Request, Response, NextFunction } from "express";
import { AutoReplyModel } from "../models/autoReply.model";
import { asyncHandler } from "../utils/asyncHandler";
import { NewAutoReply } from "../db/schema/autoReplies";

export class AutoReplyController {
  static createAutoReply = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const newAutoReply: NewAutoReply = req.body;
      const autoReply = await AutoReplyModel.createAutoReply(newAutoReply);
      res.status(201).json({
        success: true,
        message: "Auto-reply created successfully",
        data: autoReply,
      });
    }
  );

  static getAllAutoReplies = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const autoReplies = await AutoReplyModel.getAllAutoReplies();
      res.status(200).json({ success: true, data: autoReplies });
    }
  );

  static getAutoReplyById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = parseInt(req.params.id);
      const autoReply = await AutoReplyModel.getAutoReplyById(id);

      if (!autoReply) {
        return res.status(404).json({ success: false, message: "Auto-reply not found" });
      }

      res.status(200).json({ success: true, data: autoReply });
    }
  );

  static updateAutoReply = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = parseInt(req.params.id);
      const updatedFields: Partial<NewAutoReply> = req.body;
      const updatedAutoReply = await AutoReplyModel.updateAutoReply(
        id,
        updatedFields
      );

      if (!updatedAutoReply) {
        return res.status(404).json({ success: false, message: "Auto-reply not found" });
      }

      res.status(200).json({
        success: true,
        message: "Auto-reply updated successfully",
        data: updatedAutoReply,
      });
    }
  );

  static deleteAutoReply = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const id = parseInt(req.params.id);
      const deletedAutoReply = await AutoReplyModel.deleteAutoReply(id);

      if (!deletedAutoReply) {
        return res.status(404).json({ success: false, message: "Auto-reply not found" });
      }

      res.status(200).json({
        success: true,
        message: "Auto-reply deleted successfully",
        data: deletedAutoReply,
      });
    }
  );
}
