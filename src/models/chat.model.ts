import { db } from "../db/connection";
import { chats, NewChat } from "../db/schema/chats";
import { users } from "../db/schema/users"; // Import users schema
import { adminUsers } from "../db/schema/AdminUsers"; // Import adminUsers schema
import { messages } from "../db/schema/messages"; // Import messages schema
import { designation } from "../db/schema/designation"; // Import designations schema
import { eq, isNotNull, like, or, and, sql, exists, isNull } from "drizzle-orm";

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
      orderBy: (chats, { desc }) => [desc(chats.createdAt)], // Order by creation date to get last chats
    });
  }

  static async getChatsByGuestId(guestId: string) {
    return await db.query.chats.findMany({
      where: eq(chats.guestId, guestId),
      with: {
        adminUser: true,
        messages: true,
      },
      orderBy: (chats, { desc }) => [desc(chats.createdAt)],
    });
  }

  static async getChatsByAdminId(adminId: number) {
    return await db.query.chats.findMany({
      where: eq(chats.adminUserId, adminId),
      with: {
        user: true,
        adminUser: true,
        messages: true,
      },
      orderBy: (chats, { desc }) => [desc(chats.createdAt)], // Order by creation date to get last chats
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

  static async getAllChats(chatUserType?: 'user' | 'admin'|'guest', searchKey?: string) {
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

    } else if (chatUserType === 'user') {
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
            eq(chats.userId, user.id),
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

          return drizzleOr(userMatches, chatMatches);
        },
        with: {
          chats: {
            where: (chat, { and, or, isNotNull }) => and(
              isNotNull(chat.userId),
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
              adminUser: true,
            },
            orderBy: (chats, { desc }) => [desc(chats.createdAt)], // Order chats within each user
          },
        },
      });

      // Ensure messages are included and sort chats within each user
      const usersWithSortedChats = allUsersWithChats.map(user => {
        const chatsWithMessages = user.chats.map(chat => ({
          ...chat,
          messages: chat.messages || [],
        }));
        return {
          ...user,
          chats: chatsWithMessages,
        };
      });

      return usersWithSortedChats;

    } else if (chatUserType === 'guest') {
      const allGuestChats = await db.query.chats.findMany({
        where: (chat, { and, or, isNotNull, like: drizzleLike }) => and(
          isNotNull(chat.guestId),
          searchPattern ? or(
            drizzleLike(chat.guestId, searchPattern),
            exists(db.select().from(messages).where(and(
              eq(messages.chatId, chat.id),
              drizzleLike(messages.content, searchPattern)
            )))
          ) : undefined
        ),
        with: {
          messages: true,
          adminUser: true,
        },
        orderBy: (chats, { desc }) => [desc(chats.createdAt)], // Order guest chats
      });

      const guestChatsWithMessages = allGuestChats.map(chat => ({ ...chat, messages: chat.messages || [], user: null }));
      return guestChatsWithMessages;

    } else { // Default case if chatUserType is not 'admin', 'user', or 'guest'
      // This block can be used to return all chats without specific filtering by user type,
      // or you can choose to throw an error or return an empty array based on requirements.
      // For now, let's return all chats without user/guest type filtering, but still apply search if present.
      const allChats = await db.query.chats.findMany({
        where: (chat, { and, or, isNotNull, like: drizzleLike }) => searchPattern ? or(
          isNotNull(chat.userId) ? exists(db.select().from(users).where(and(
            eq(users.id, chat.userId),
            or(
              like(users.username, searchPattern),
              like(users.fullname, searchPattern),
              like(users.email, searchPattern),
              like(users.phone, searchPattern)
            )
          ))) : undefined,
          isNotNull(chat.guestId) ? drizzleLike(chat.guestId, searchPattern) : undefined,
          exists(db.select().from(messages).where(and(
            eq(messages.chatId, chat.id),
            drizzleLike(messages.content, searchPattern)
          )))
        ) : undefined,
        with: {
          messages: true,
          adminUser: true,
          user: true,
        },
      });

      // Deduplicate and sort by createdAt
      const uniqueChats = Array.from(new Map(allChats.map(chat => [chat.id, chat])).values());
      uniqueChats.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

      return uniqueChats;
    }
  }
}
