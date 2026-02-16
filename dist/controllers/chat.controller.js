"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const chat_model_1 = require("../models/chat.model");
const message_model_1 = require("../models/message.model");
const asyncHandler_1 = require("../utils/asyncHandler");
const chats_1 = require("../db/schema/chats");
const __1 = require("..");
const connection_1 = require("../db/connection");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
class ChatController {
}
exports.ChatController = ChatController;
_a = ChatController;
ChatController.createChat = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { userId, guestId, adminUserId, targetAffiliateId, attachmentUrl, senderType, initialMessageContent } = req.body;
    let newChat;
    if (userId || adminUserId || targetAffiliateId) {
        newChat = {
            userId: userId,
            adminUserId: targetAffiliateId ? targetAffiliateId : adminUserId,
            status: senderType === "user" ? "pending_admin_response" : senderType === "admin" ? "pending_user_response" : "open",
            type: senderType || "user",
        };
    }
    else if (guestId) {
        newChat = {
            guestId: guestId,
            adminUserId: targetAffiliateId ? targetAffiliateId : adminUserId,
            // status: "open",
            status: senderType === "guest" ? "pending_admin_response" : senderType === "admin" ? "pending_user_response" : "open",
            type: "guest",
        };
    }
    else {
        return res.status(400).json({ success: false, message: "Either userId or guestId must be provided" });
    }
    const chatId = await chat_model_1.ChatModel.createChat(newChat);
    if (initialMessageContent && chatId) {
        const initialMessage = {
            chatId: chatId,
            senderId: senderType === "admin" ? adminUserId : (userId || null),
            senderType: senderType || (userId ? "user" : "guest"),
            content: initialMessageContent || null,
            attachmentUrl: attachmentUrl || null,
            guestSenderId: guestId,
        };
        __1.io.to(chatId.toString()).emit("sendMessage", initialMessage);
        await message_model_1.MessageModel.createMessage(initialMessage);
    }
    res.status(201).json({
        success: true,
        message: "Chat created successfully",
        data: { id: chatId },
    });
});
ChatController.getChatById = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const chatId = parseInt(req.params.id);
    const chat = await chat_model_1.ChatModel.getChatById(chatId);
    if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
    }
    res.status(200).json({ success: true, data: chat });
});
ChatController.getChatsByUserId = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const userId = parseInt(req.params.userId);
    const chats = await chat_model_1.ChatModel.getChatsByUserId(userId);
    res.status(200).json({ success: true, data: chats });
});
ChatController.getChatsByGuestId = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { guestId } = req.params;
    const chats = await chat_model_1.ChatModel.getChatsByGuestId(guestId);
    res.status(200).json({ success: true, data: chats });
});
ChatController.updateChatStatus = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const chatId = parseInt(req.params.id);
    const { status } = req.body;
    if (![
        "open",
        "closed",
        "pending_admin_response",
        "pending_user_response",
    ].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid chat status" });
    }
    const updatedChat = await chat_model_1.ChatModel.updateChatStatus(chatId, status);
    if (!updatedChat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
    }
    res.status(200).json({
        success: true,
        message: "Chat status updated successfully",
        data: updatedChat,
    });
});
ChatController.assignAdminToChat = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const chatId = parseInt(req.params.id);
    const { adminUserId } = req.body;
    const updatedChat = await chat_model_1.ChatModel.assignAdminToChat(chatId, adminUserId);
    if (!updatedChat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
    }
    res.status(200).json({
        success: true,
        message: "Admin assigned to chat successfully",
        data: updatedChat,
    });
});
ChatController.getAllChats = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const chatUserType = req.query.chatUserType;
    const searchKey = req.query.searchKey;
    const chats = await chat_model_1.ChatModel.getAllChats(chatUserType, searchKey);
    res.status(200).json({ success: true, data: chats });
});
ChatController.getChatUnreadCount = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const { playerId, guestId, affiliateId } = req?.query;
        const result = await connection_1.db
            .select({
            countUser: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${chats_1.chats.userId})`,
            countAffiliate: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${schema_1.adminUsers.id})`,
            countGuest: (0, drizzle_orm_1.sql) `COUNT(DISTINCT ${chats_1.chats.guestId})`
        })
            .from(chats_1.chats)
            .leftJoin(schema_1.adminUsers, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, chats_1.chats.adminUserId), (0, drizzle_orm_1.inArray)(schema_1.adminUsers.role, playerId ? ["admin", "superAdmin"] : ["affiliate", "superAffiliate"])))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(chats_1.chats.status, (playerId || guestId || affiliateId) ? "pending_user_response" : "pending_admin_response"), playerId ? (0, drizzle_orm_1.eq)(chats_1.chats.userId, Number(playerId)) : guestId ? (0, drizzle_orm_1.eq)(chats_1.chats.guestId, String(guestId)) : affiliateId ? (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(chats_1.chats.adminUserId, Number(affiliateId)), (0, drizzle_orm_1.eq)(chats_1.chats.type, "admin")) : undefined))
            .limit(1);
        res.status(200).json({
            message: "Chat unread fetched successfully",
            status: true,
            data: result?.[0] || { countUser: 0, countAffiliate: 0 },
        });
    }
    catch (error) {
        res.status(200).json({
            message: "Chat unread fetched successfully",
            status: true,
            errors: error
        });
    }
});
ChatController.createChatAdmin = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    const { adminUserId, userId, initialMessageContent } = req.body;
    const newChat = {
        userId,
        adminUserId,
        status: "open",
        type: "admin"
    };
    const chatId = await chat_model_1.ChatModel.createChat(newChat);
    if (initialMessageContent && chatId) {
        const initialMessage = {
            chatId: chatId,
            senderId: adminUserId,
            senderType: "admin",
            content: initialMessageContent,
        };
        await message_model_1.MessageModel.createMessage(initialMessage);
    }
    res.status(201).json({
        success: true,
        message: "Admin chat created successfully",
        data: { id: chatId },
    });
});
