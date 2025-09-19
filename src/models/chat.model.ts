import { db } from "../db/connection";
import { chats, NewChat } from "../db/schema/chats";
import { users } from "../db/schema/users"; // Import users schema
import { eq } from "drizzle-orm";

export class ChatModel {
  static async createChat(newChat: NewChat) {
    const [chat] = await db.insert(chats).values(newChat);
    return chat.insertId;
  }

  static async getChatById(chatId: number) {
    return await db.query.chats.findFirst({
      where: eq(chats.id, chatId),
      with: {
        user: true,
        adminUser: true,
        messages: true,
      },
    });
  }

  static async getChatsByUserId(userId: number) {
    return await db.query.chats.findMany({
      where: eq(chats.userId, userId),
      with: {
        user: true,
        adminUser: true,
        messages: true,
      },
    });
  }

  static async updateChatStatus(chatId: number, status: typeof chats.$inferSelect.status) {
    const [updatedChat] = await db
      .update(chats)
      .set({ status, updatedAt: new Date() })
      .where(eq(chats.id, chatId));
    return updatedChat;
  }

  static async assignAdminToChat(chatId: number, adminUserId: number) {
    const [updatedChat] = await db
      .update(chats)
      .set({ adminUserId, updatedAt: new Date() })
      .where(eq(chats.id, chatId));
    return updatedChat;
  }

  static async getAllChats() {
    const allUsersWithChats = await db.query.users.findMany({
      with: {
        chats: {
          with: {
            messages: true,
            adminUser: true,
          },
        },
      },
    });

    // Transform the data to match the desired format
    const formattedUsers = allUsersWithChats.map(user => {
      const chatsWithMessages = user.chats.map(chat => ({
        ...chat,
        messages: chat.messages || [], // Ensure messages is an array, even if empty
      }));
      return {
        ...user,
        chats: chatsWithMessages,
      };
    });

    return formattedUsers;
  }
}
