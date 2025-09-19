import { db } from "../db/connection";
import { chats, NewChat } from "../db/schema/chats";
import { users } from "../db/schema/users"; // Import users schema
import { adminUsers } from "../db/schema/AdminUsers"; // Import adminUsers schema
import { messages } from "../db/schema/messages"; // Import messages schema
import { designation } from "../db/schema/designation"; // Import designations schema
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

    if (chatUserType === 'admin') {
      const allAdminUsersWithChats = await db.query.adminUsers.findMany({
        where: (adminUser, { or, eq }) => or(
          eq(adminUser.role, 'affiliate'),
          eq(adminUser.role, 'superAffiliate')
        ),
        with: {
          chats: {
            where: (chat, { and, or, isNotNull }) => and(
              isNotNull(chat.adminUserId),
              searchCondition ? or(
                sql`EXISTS (SELECT 1 FROM ${users} WHERE ${users.id} = ${chat.userId} AND (${like(users.username, searchCondition)} OR ${like(users.fullname, searchCondition)} OR ${like(users.email, searchCondition)} OR ${like(users.phone, searchCondition)}))`,
                sql`EXISTS (SELECT 1 FROM ${messages} WHERE ${messages.chatId} = ${chat.id} AND ${like(messages.content, searchCondition)})`
              ) : undefined
            ),
            with: {
              messages: true,
              user: true,
            },
          },
        },
      });
      return allAdminUsersWithChats.map(adminUser => {
        const chatsWithMessages = adminUser.chats.map(chat => ({
          ...chat,
          messages: chat.messages || [],
        }));
        return {
          ...adminUser,
          chats: chatsWithMessages,
        };
      });

    } else { // Default to 'user' if not specified or 'user'
      const allUsersWithChats = await db.query.users.findMany({
        with: {
          chats: {
            where: (chat, { and, or }) => searchCondition ? or(
              sql`EXISTS (SELECT 1 FROM ${users} WHERE ${users.id} = ${chat.userId} AND (${like(users.username, searchCondition)} OR ${like(users.fullname, searchCondition)} OR ${like(users.email, searchCondition)} OR ${like(users.phone, searchCondition)}))`,
              sql`EXISTS (SELECT 1 FROM ${messages} WHERE ${messages.chatId} = ${chat.id} AND ${like(messages.content, searchCondition)})`
            ) : undefined,
            with: {
              messages: true,
              adminUser: true,
            },
          },
        },
      });
      return allUsersWithChats.map(user => {
        const chatsWithMessages = user.chats.map(chat => ({
          ...chat,
          messages: chat.messages || [],
        }));
        return {
          ...user,
          chats: chatsWithMessages,
        };
      });
    }
  }
}
