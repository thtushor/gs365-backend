"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageController = void 0;
const message_model_1 = require("../models/message.model");
const chat_model_1 = require("../models/chat.model");
const autoReply_model_1 = require("../models/autoReply.model");
const asyncHandler_1 = require("../utils/asyncHandler");
const messages_1 = require("../db/schema/messages");
const index_1 = require("../index"); // Import the Socket.IO instance
const schema_1 = require("../db/schema");
const connection_1 = require("../db/connection");
const drizzle_orm_1 = require("drizzle-orm");
class MessageController {
}
exports.MessageController = MessageController;
_a = MessageController;
MessageController.sendMessage = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { chatId, senderId, guestSenderId, senderType, content, attachmentUrl } = req.body;
    const newMessage = {
        chatId,
        senderId,
        guestSenderId,
        senderType,
        content,
        attachmentUrl,
    };
    const message = await message_model_1.MessageModel.createMessage(newMessage);
    // Emit message via Socket.IO
    index_1.io.emit("sendMessage", newMessage);
    // Update chat status based on sender
    if (senderType === "user" || senderType === "guest") {
        await chat_model_1.ChatModel.updateChatStatus(chatId, "pending_admin_response");
        // Check for auto-reply
        const autoReply = await autoReply_model_1.AutoReplyModel.getAutoReplyByKeyword(content);
        if (autoReply && autoReply.isActive) {
            const autoReplyMessage = {
                chatId,
                senderId: 0, // System sender
                senderType: "system",
                content: autoReply.replyMessage,
            };
            const systemMessage = await message_model_1.MessageModel.createMessage(autoReplyMessage);
            // io.to(chatId.toString()).emit("newMessage", systemMessage); // Emit auto-reply
            index_1.io.emit("sendMessage", systemMessage);
        }
    }
    else if (senderType === "admin") {
        const adminData = await connection_1.db.select().from(schema_1.adminUsers).where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, Number(senderId))).limit(1);
        const status = adminData[0]?.role === "affiliate" || adminData[0]?.role === "superAffiliate" ? "pending_admin_response" : "pending_user_response";
        await chat_model_1.ChatModel.updateChatStatus(chatId, status);
    }
    res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
    });
});
MessageController.getChatMessages = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const chatId = parseInt(req.params.chatId);
    const messages = await message_model_1.MessageModel.getMessagesByChatId(chatId);
    res.status(200).json({ success: true, data: messages });
});
MessageController.markMessagesAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const chatId = parseInt(req.params.chatId);
    const { senderType } = req.body; // The type of sender whose messages are being marked as read
    if (!Object.values(messages_1.MessageSenderType).includes(senderType)) {
        return res.status(400).json({ success: false, message: "Invalid sender type" });
    }
    await message_model_1.MessageModel.markMessagesAsRead(chatId, senderType);
    res.status(200).json({ success: true, message: "Messages marked as read" });
});
MessageController.getMessagesBySender = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const senderId = parseInt(req.params.senderId);
    const senderType = req.params.senderType;
    if (!["user", "admin"].includes(senderType)) {
        return res.status(400).json({ success: false, message: "Invalid sender type" });
    }
    const messages = await message_model_1.MessageModel.getMessagesBySenderIdAndType(senderId, senderType);
    res.status(200).json({ success: true, data: messages });
});
MessageController.getMessagesByUserIdOrAdminId = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const type = req.params.type;
    if (!["user", "admin", "guest"].includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid type. Must be 'user' or 'admin' or 'guest'." });
    }
    const messages = await message_model_1.MessageModel.getMessagesByUserOrAdminId(req.params.id, type);
    res.status(200).json({ success: true, data: messages });
});
MessageController.getMessagesByGuestSenderId = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const guestSenderId = req.params.guestSenderId;
    const messages = await message_model_1.MessageModel.getMessagesByUserOrAdminId(guestSenderId, "guest");
    res.status(200).json({ success: true, data: messages });
});
