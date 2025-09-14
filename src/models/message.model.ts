import { db } from "../db/connection";
import { messages, NewMessage } from "../db/schema/messages";
import { eq, and } from "drizzle-orm";

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
}
