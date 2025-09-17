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
      const { chatId, senderId, senderType, content, attachmentUrl } = req.body;

      const newMessage: NewMessage = {
        chatId,
        senderId,
        senderType,
        content,
        attachmentUrl,
      };

      const message = await MessageModel.createMessage(newMessage);

      // Emit message via Socket.IO
      io.to(chatId.toString()).emit("newMessage", message);

      // Update chat status based on sender
      if (senderType === "user") {
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
}
