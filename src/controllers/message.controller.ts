import { Request, Response, NextFunction } from "express";
import { MessageModel } from "../models/message.model";
import { ChatModel } from "../models/chat.model";
import { AutoReplyModel } from "../models/autoReply.model";
import { asyncHandler } from "../utils/asyncHandler";
import { NewMessage, MessageSenderType } from "../db/schema/messages";
import { ChatStatus } from "../db/schema/chats";
import { io } from "../index"; // Import the Socket.IO instance

export class MessageController {
  static sendMessage = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const { chatId, senderId, guestSenderId, senderType, content, attachmentUrl } = req.body;

      const newMessage: NewMessage = {
        chatId,
        senderId,
        guestSenderId,
        senderType,
        content,
        attachmentUrl,
      };

      const message = await MessageModel.createMessage(newMessage);

      // Emit message via Socket.IO
      io.to(chatId).emit("newMessage", message);

      // Update chat status based on sender
      if (senderType === "user" || senderType === "guest") {
        await ChatModel.updateChatStatus(chatId, "pending_admin_response");
        // Check for auto-reply
        const autoReply = await AutoReplyModel.getAutoReplyByKeyword(content);
        if (autoReply && autoReply.isActive) {
          const autoReplyMessage: NewMessage = {
            chatId,
            senderId: 0, // System sender
            senderType: "system",
            content: autoReply.replyMessage,
          };
          const systemMessage = await MessageModel.createMessage(autoReplyMessage);
          io.to(chatId.toString()).emit("newMessage", systemMessage); // Emit auto-reply
        }
      } else if (senderType === "admin") {
        await ChatModel.updateChatStatus(chatId, "pending_user_response");
      }

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: message,
      });
    }
  );

  static getChatMessages = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const chatId = parseInt(req.params.chatId);
      const messages = await MessageModel.getMessagesByChatId(chatId);

      res.status(200).json({ success: true, data: messages });
    }
  );

  static markMessagesAsRead = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const chatId = parseInt(req.params.chatId);
      const { senderType } = req.body; // The type of sender whose messages are being marked as read

      if (!Object.values(MessageSenderType).includes(senderType)) {
        return res.status(400).json({ success: false, message: "Invalid sender type" });
      }

      await MessageModel.markMessagesAsRead(chatId, senderType);

      res.status(200).json({ success: true, message: "Messages marked as read" });
    }
  );

  static getMessagesBySender = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const senderId = parseInt(req.params.senderId);
      const senderType = req.params.senderType as "user" | "admin";

      if (!["user", "admin"].includes(senderType)) {
        return res.status(400).json({ success: false, message: "Invalid sender type" });
      }

      const messages = await MessageModel.getMessagesBySenderIdAndType(senderId, senderType);

      res.status(200).json({ success: true, data: messages });
    }
  );

  static getMessagesByUserIdOrAdminId = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      
      const type = req.params.type as "user" | "admin"|"guest";

      if (!["user", "admin","guest"].includes(type)) {
        return res.status(400).json({ success: false, message: "Invalid type. Must be 'user' or 'admin' or 'guest'." });
      }

      const messages = await MessageModel.getMessagesByUserOrAdminId(req.params.id as number|string, type);

      res.status(200).json({ success: true, data: messages });
    }
  );

  static getMessagesByGuestSenderId = asyncHandler(
    async (req: Request, res: Response, next: NextFunction) => {
      const guestSenderId = req.params.guestSenderId;
      const messages = await MessageModel.getMessagesByGuestSenderId(guestSenderId);

      res.status(200).json({ success: true, data: messages });
    }
  );
}
