import { db } from "../db/connection";
import { chats, NewChat } from "../db/schema/chats";
import { users } from "../db/schema/users"; // Import users schema
import { adminUsers } from "../db/schema/AdminUsers"; // Import adminUsers schema
import { messages } from "../db/schema/messages"; // Import messages schema
import { designation } from "../db/schema/designation"; // Import designations schema
import { eq, isNotNull, like, or, and, sql, exists } from "drizzle-orm";

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
    const searchPattern = searchKey ? `%${searchKey}%` : undefined;

    if (chatUserType === 'admin') {
      const allAdminUsersWithChats = await db.query.adminUsers.findMany({
        where: (adminUser, { or: drizzleOr, eq, and, like }) => {
          const roleConditions = drizzleOr(
            eq(adminUser.role, 'affiliate'),
            eq(adminUser.role, 'superAffiliate')
          );

          if (!searchPattern) {
            return roleConditions;
          }

          const adminUserMatches = drizzleOr(
            like(adminUser.username, searchPattern),
            like(adminUser.fullname, searchPattern),
            like(adminUser.email, searchPattern),
            like(adminUser.phone, searchPattern)
          );

          const chatMatches = exists(db.select().from(chats).where(and(
            eq(chats.adminUserId, adminUser.id),
            drizzleOr(
              exists(db.select().from(users).where(and(
                eq(users.id, chats.userId),
                drizzleOr(
                  like(users.username, searchPattern),
                  like(users.fullname, searchPattern),
                  like(users.email, searchPattern),
                  like(users.phone, searchPattern)
                )
              ))),
              exists(db.select().from(messages).where(and(
                eq(messages.chatId, chats.id),
                like(messages.content, searchPattern)
              )))
            )
          )));

          return and(roleConditions, drizzleOr(adminUserMatches, chatMatches));
        },
        with: {
          chats: {
            where: (chat, { and, or, isNotNull }) => and(
              isNotNull(chat.adminUserId),
              searchPattern ? or(
                exists(db.select().from(users).where(and(
                  eq(users.id, chat.userId),
                  or(
                    like(users.username, searchPattern),
                    like(users.fullname, searchPattern),
                    like(users.email, searchPattern),
                    like(users.phone, searchPattern)
                  )
                ))),
                exists(db.select().from(messages).where(and(
                  eq(messages.chatId, chat.id),
                  like(messages.content, searchPattern)
                )))
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
        where: (user, { or: drizzleOr, like }) => {
          if (!searchPattern) {
            return undefined; // No search, no top-level filter
          }

          const userMatches = drizzleOr(
            like(user.username, searchPattern),
            like(user.fullname, searchPattern),
            like(user.email, searchPattern),
            like(user.phone, searchPattern)
          );

          const chatMatches = exists(db.select().from(chats).where(and(
            eq(chats.userId, user.id), // Correlate with current user
            drizzleOr(
              exists(db.select().from(users).where(and(
                eq(users.id, chats.userId), // This is redundant as chats.userId is already user.id
                drizzleOr(
                  like(users.username, searchPattern),
                  like(users.fullname, searchPattern),
                  like(users.email, searchPattern),
                  like(users.phone, searchPattern)
                )
              ))),
              exists(db.select().from(messages).where(and(
                eq(messages.chatId, chats.id),
                like(messages.content, searchPattern)
              )))
            )
          )));

          return drizzleOr(userMatches, chatMatches);
        },
        with: {
          chats: {
            where: (chat, { and, or }) => searchPattern ? or(
              exists(db.select().from(users).where(and(
                eq(users.id, chat.userId),
                or(
                  like(users.username, searchPattern),
                  like(users.fullname, searchPattern),
                  like(users.email, searchPattern),
                  like(users.phone, searchPattern)
                )
              ))),
              exists(db.select().from(messages).where(and(
                eq(messages.chatId, chat.id),
                like(messages.content, searchPattern)
              )))
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
