"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoReplyController = void 0;
const autoReply_model_1 = require("../models/autoReply.model");
const asyncHandler_1 = require("../utils/asyncHandler");
class AutoReplyController {
}
exports.AutoReplyController = AutoReplyController;
_a = AutoReplyController;
AutoReplyController.createAutoReply = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const newAutoReply = req.body;
    const autoReply = await autoReply_model_1.AutoReplyModel.createAutoReply(newAutoReply);
    res.status(201).json({
        success: true,
        message: "Auto-reply created successfully",
        data: autoReply,
    });
});
AutoReplyController.getAllAutoReplies = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const autoReplies = await autoReply_model_1.AutoReplyModel.getAllAutoReplies();
    res.status(200).json({ success: true, data: autoReplies });
});
AutoReplyController.getAutoReplyById = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const id = parseInt(req.params.id);
    const autoReply = await autoReply_model_1.AutoReplyModel.getAutoReplyById(id);
    if (!autoReply) {
        return res.status(404).json({ success: false, message: "Auto-reply not found" });
    }
    res.status(200).json({ success: true, data: autoReply });
});
AutoReplyController.updateAutoReply = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const id = parseInt(req.params.id);
    const updatedFields = req.body;
    const updatedAutoReply = await autoReply_model_1.AutoReplyModel.updateAutoReply(id, updatedFields);
    if (!updatedAutoReply) {
        return res.status(404).json({ success: false, message: "Auto-reply not found" });
    }
    res.status(200).json({
        success: true,
        message: "Auto-reply updated successfully",
        data: updatedAutoReply,
    });
});
AutoReplyController.deleteAutoReply = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const id = parseInt(req.params.id);
    const deletedAutoReply = await autoReply_model_1.AutoReplyModel.deleteAutoReply(id);
    if (!deletedAutoReply) {
        return res.status(404).json({ success: false, message: "Auto-reply not found" });
    }
    res.status(200).json({
        success: true,
        message: "Auto-reply deleted successfully",
        data: deletedAutoReply,
    });
});
