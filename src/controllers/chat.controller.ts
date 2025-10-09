import { Request, Response, NextFunction } from "express";
import { ChatModel } from "../models/chat.model";
import { MessageModel } from "../models/message.model";
import { asyncHandler } from "../utils/asyncHandler";
import { NewChat, ChatStatus, chats } from "../db/schema/chats";
import { NewMessage, MessageSenderType } from "../db/schema/messages";
import { io } from "..";
import { db } from "../db/connection";
import { and, eq, inArray, sql, sum } from "drizzle-orm";
import { adminUsers } from "../db/schema";

export class ChatController {
  static createChat = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { userId, guestId, adminUserId, targetAffiliateId, attachmentUrl, senderType, initialMessageContent } = req.body;

      let newChat: NewChat;

      if (userId || adminUserId || targetAffiliateId) {
        newChat = {
          userId: userId,
          adminUserId: targetAffiliateId ? targetAffiliateId : adminUserId,
          status: senderType === "user" ? "pending_admin_response" : senderType === "admin" ? "pending_user_response" : "open",
          type: senderType || "user",
        };
      } else if (guestId) {
        newChat = {
          guestId: guestId,
          adminUserId: targetAffiliateId ? targetAffiliateId : adminUserId,
          // status: "open",
          status: senderType === "guest" ? "pending_admin_response" : senderType === "admin" ? "pending_user_response" : "open",
          type: "guest",
        };
      } else {
        return res.status(400).json({ success: false, message: "Either userId or guestId must be provided" });
      }

      const chatId = await ChatModel.createChat(newChat);

      if (initialMessageContent && chatId) {
        const initialMessage: NewMessage = {
          chatId: chatId,
          senderId: senderType === "admin" ? adminUserId : (userId || null),
          senderType: senderType || (userId ? "user" : "guest"),
          content: initialMessageContent || null,
          attachmentUrl: attachmentUrl || null,
          guestSenderId: guestId,
        };
        io.to(chatId.toString()).emit("sendMessage", initialMessage)
        await MessageModel.createMessage(initialMessage);
      }

      res.status(201).json({
        success: true,
        message: "Chat created successfully",
        data: { id: chatId },
      });
    }
  );

  static getChatById = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const chatId = parseInt(req.params.id);
      const chat = await ChatModel.getChatById(chatId);

      if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }

      res.status(200).json({ success: true, data: chat });
    }
  );

  static getChatsByUserId = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const userId = parseInt(req.params.userId);
      const chats = await ChatModel.getChatsByUserId(userId);

      res.status(200).json({ success: true, data: chats });
    }
  );

  static getChatsByGuestId = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { guestId } = req.params;
      const chats = await ChatModel.getChatsByGuestId(guestId);

      res.status(200).json({ success: true, data: chats });
    }
  );

  static updateChatStatus = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
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

      const updatedChat = await ChatModel.updateChatStatus(chatId, status);

      if (!updatedChat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }

      res.status(200).json({
        success: true,
        message: "Chat status updated successfully",
        data: updatedChat,
      });
    }
  );

  static assignAdminToChat = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const chatId = parseInt(req.params.id);
      const { adminUserId } = req.body;

      const updatedChat = await ChatModel.assignAdminToChat(chatId, adminUserId);

      if (!updatedChat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
      }

      res.status(200).json({
        success: true,
        message: "Admin assigned to chat successfully",
        data: updatedChat,
      });
    }
  );

  static getAllChats = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const chatUserType = req.query.chatUserType as "admin" | "user" | "guest" | undefined;
      const searchKey = req.query.searchKey as string | undefined;
      const chats = await ChatModel.getAllChats(chatUserType, searchKey);
      res.status(200).json({ success: true, data: chats });
    }
  );

  static getChatUnreadCount = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {

    try {
      const { playerId, guestId } = req?.query;
      const result = await db
        .select({
          countUser: sql<number>`COUNT(DISTINCT ${chats.userId})`,
          countAffiliate: sql<number>`COUNT(DISTINCT ${adminUsers.id})`,
          countGuest: sql<number>`COUNT(DISTINCT ${chats.guestId})`
        })
        .from(chats)
        .leftJoin(adminUsers, and(eq(adminUsers.id, chats.adminUserId), inArray(adminUsers.role, playerId ? ["admin", "superAdmin"] : ["affiliate", "superAffiliate"])))
        .where(and(eq(chats.status, (playerId || guestId) ? "pending_user_response" : "pending_admin_response"), playerId ? eq(chats.userId, Number(playerId)) : guestId ? eq(chats.guestId, String(guestId)) : undefined))
        .limit(1);

      res.status(200).json({
        message: "Chat unread fetched successfully",
        status: true,
        data: result?.[0] || { countUser: 0, countAffiliate: 0 },
      });
    } catch (error) {
      res.status(200).json({
        message: "Chat unread fetched successfully",
        status: true,
        errors: error
      })
    }

  })

  static createChatAdmin = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { adminUserId, userId, initialMessageContent } = req.body;

      const newChat: NewChat = {
        userId,
        adminUserId,
        status: "open",
        type: "admin"
      };

      const chatId = await ChatModel.createChat(newChat);

      if (initialMessageContent && chatId) {
        const initialMessage: NewMessage = {
          chatId: chatId,
          senderId: adminUserId,
          senderType: "admin",
          content: initialMessageContent,
        };
        await MessageModel.createMessage(initialMessage);
      }

      res.status(201).json({
        success: true,
        message: "Admin chat created successfully",
        data: { id: chatId },
      });
    }
  );
}
