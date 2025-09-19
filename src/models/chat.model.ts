import { db } from "../db/connection";
import { chats, NewChat } from "../db/schema/chats";
import { users } from "../db/schema/users"; // Import users schema
import { adminUsers } from "../db/schema/AdminUsers"; // Import adminUsers schema
import { messages } from "../db/schema/messages"; // Import messages schema
import { eq, isNotNull, like, or, and, sql } from "drizzle-orm";

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

  static async getAllChats(chatUserType?: 'user' | 'admin', searchKey?: string) {
    const searchCondition = searchKey ? `%${searchKey}%` : undefined;

    const chatQuery = db.select({
      chat: chats,
      user: users,
      adminUser: adminUsers,
      message: messages,
    })
    .from(chats)
    .leftJoin(users, eq(chats.userId, users.id))
    .leftJoin(adminUsers, eq(chats.adminUserId, adminUsers.id))
    .leftJoin(messages, eq(chats.id, messages.chatId))
    .where(and(
      chatUserType === 'admin' ? isNotNull(chats.adminUserId) : undefined,
      searchCondition ? or(
        like(users.username, searchCondition),
        like(users.fullname, searchCondition),
        like(users.email, searchCondition),
        like(users.phone, searchCondition),
        like(messages.content, searchCondition)
      ) : undefined
    ));

    const rawChats = await chatQuery;

    const groupedChats: any = {};

    for (const row of rawChats) {
      const chat = row.chat;
      const user = row.user;
      const adminUser = row.adminUser;
      const message = row.message;

      const key = chatUserType === 'admin' ? `admin-${adminUser?.id}` : `user-${user?.id}`;

      if (!groupedChats[key]) {
        groupedChats[key] = {
          ...(chatUserType === 'admin' ? adminUser : user),
          chats: [],
        };
      }

      let existingChat = groupedChats[key].chats.find((c: any) => c.id === chat.id);

      if (!existingChat) {
        existingChat = { ...chat, messages: [] };
        groupedChats[key].chats.push(existingChat);
      }

      if (message && !existingChat.messages.some((m: any) => m.id === message.id)) {
        existingChat.messages.push(message);
      }
    }

    return Object.values(groupedChats);
  }
}
