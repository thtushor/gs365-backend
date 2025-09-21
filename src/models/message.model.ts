import { db } from "../db/connection";
import { messages, NewMessage } from "../db/schema/messages";
import { eq, and } from "drizzle-orm";
import { ChatModel } from "./chat.model"; // Import ChatModel

export class MessageModel {
  static async createMessage(newMessage: NewMessage) {
    const [message] = await db.insert(messages).values(newMessage);
    return message;
  }

  static async getMessagesByChatId(chatId: number) {
    return await db.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      with: {
        senderUser: true,
        senderAdmin: true,
      },
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });
  }

  static async markMessagesAsRead(chatId: number, senderType: "user" | "admin" | "system") {
    const [updatedMessages] = await db
      .update(messages)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(messages.chatId, chatId), eq(messages.senderType, senderType)));
    return updatedMessages;
  }

  static async getMessagesBySenderIdAndType(senderId: number, senderType: "user" | "admin") {
    return await db.query.messages.findMany({
      where: and(eq(messages.senderId, senderId), eq(messages.senderType, senderType)),
      with: {
        senderUser: true,
        senderAdmin: true,
      },
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });
  }

  static async getMessagesByUserOrAdminId(id: number, type: "user" | "admin") {
    let chats;
    if (type === "user") {
      chats = await ChatModel.getChatsByUserId(id);
    } else {
      chats = await ChatModel.getChatsByAdminId(id);
    }

    const chatIds = chats.map(chat => chat.id);

    if (chatIds.length === 0) {
      return [];
    }

    return await db.query.messages.findMany({
      where: (message, { inArray }) => inArray(message.chatId, chatIds),
      with: {
        senderUser: true,
        senderAdmin: true,
      },
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });
  }
}
