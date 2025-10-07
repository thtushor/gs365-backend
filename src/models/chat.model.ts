import { db } from "../db/connection";
import { Chat, chats, NewChat } from "../db/schema/chats";
import { users } from "../db/schema/users"; // Import users schema
import { adminUsers } from "../db/schema/AdminUsers"; // Import adminUsers schema
import { Message, messages } from "../db/schema/messages"; // Import messages schema
import { designation } from "../db/schema/designation"; // Import designations schema
import { eq, like, and, exists, isNull, inArray, desc, or, sql, isNotNull } from "drizzle-orm";


function sortChatsByLatestMessage<T extends { messages?: { createdAt?: Date | null }[], createdAt?: Date | null }>(chats: T[]): T[] {
  return chats.sort((a, b) => {
    const lastA = a.messages?.length
      ? a.messages[a.messages.length - 1].createdAt?.getTime() || 0
      : a.createdAt?.getTime() || 0;
    const lastB = b.messages?.length
      ? b.messages[b.messages.length - 1].createdAt?.getTime() || 0
      : b.createdAt?.getTime() || 0;

    return lastB - lastA; // Newest first
  });
}

type ChatWithMessages = {
  chats: (Chat & {
    messages: Message[]
  })[]
};

function sortByLatestIds(allUsersWithChats: ChatWithMessages[]) {
  return allUsersWithChats
    .map(user => {
      // 1. Sort messages inside each chat by message.id (latest first)
      const chatsWithSortedMessages = user.chats.map((chat: ChatWithMessages["chats"][0]) => ({
        ...chat,
        messages: [...chat.messages as (Message[])].sort(
          (m1, m2) => m2.id - m1.id
        ),
      }));

      // 2. Sort chats inside each user by chat.id (latest first)
      const sortedChats = chatsWithSortedMessages.sort(
        (c1, c2) => c2.id - c1.id
      );

      return { ...user, chats: sortedChats };
    })
    // 3. Sort users by their latest chat’s latest message id
    .sort((u1, u2) => {
      const u1LatestMsgId = u1.chats[0]?.messages[0]?.id || 0;
      const u2LatestMsgId = u2.chats[0]?.messages[0]?.id || 0;
      return u2LatestMsgId - u1LatestMsgId;
    });
}


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
    const userChats = await db.query.chats.findMany({
      where: eq(chats.userId, userId),
      with: {
        user: true,
        adminUser: true,
        messages: true,
      },
      orderBy: (chats, { desc }) => [desc(chats.createdAt)], // Order by creation date to get last chats
    });

    return userChats;
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

  static async getAllChats(chatUserType?: "user" | "admin" | "guest", searchKey?: string) {
    const searchPattern = searchKey ? `%${searchKey}%` : undefined;

    if (chatUserType === "admin") {

      const adminMessages = await db
        .select({
          id: adminUsers.id,
          username: adminUsers.username,
          fullname: adminUsers.fullname,
          email: adminUsers.email,
          phone: adminUsers.phone,
          role: adminUsers.role,
          lastMessage: messages.content,
          lastMessageCreatedAt: messages.createdAt,
          lastMessageAttachmentUrl: messages?.attachmentUrl,
          chatStatus: chats.status
        })
        .from(adminUsers)
        .leftJoin(chats, and(
          eq(chats.adminUserId, adminUsers.id),
          eq(
            chats.createdAt,
            sql`(
              SELECT MAX(c2.created_at)
              FROM ${chats} c2
              WHERE c2.admin_user_id = ${adminUsers.id}
            )`
          )
        ))
        .leftJoin(
          messages,
          and(
            eq(messages.chatId, chats.id),
            eq(
              messages.createdAt,
              sql`(
          SELECT MAX(m2.created_at)
          FROM ${messages} m2
          WHERE m2.chat_id = ${chats.id}
        )`
            )
          )
        )
        .where(
          and(
            inArray(adminUsers.role, ["affiliate", "superAffiliate"]),
            searchPattern
              ? or(
                like(adminUsers.username, searchPattern),
                like(adminUsers.fullname, searchPattern),
                like(adminUsers.email, searchPattern),
                like(adminUsers.phone, searchPattern),
                like(messages.content, searchPattern)
              )
              : undefined
          )
        )
        .orderBy(desc(messages.createdAt));

      return adminMessages;

    } else if (chatUserType === "user") {

      const userMessages = await db
        .select({
          id: users.id,
          username: users.username,
          fullname: users.fullname,
          email: users.email,
          phone: users.phone,
          lastMessage: messages.content,
          lastMessageCreatedAt: messages.createdAt,
          lastMessageAttachmentUrl: messages?.attachmentUrl,
          chatStatus: chats.status
        })
        .from(users)
        .leftJoin(chats, and(
          eq(chats.userId, users.id),
          eq(
            chats.createdAt,
            sql`(
            SELECT MAX(c2.created_at)
            FROM ${chats} c2
            WHERE c2.user_id = ${users.id}
          )`
          )
        ))
        .leftJoin(
          messages,
          and(
            eq(messages.chatId, chats.id),
            eq(
              messages.createdAt,
              sql`(
              SELECT MAX(m2.created_at)
              FROM ${messages} m2
              WHERE m2.chat_id = ${chats.id}
            )`
            )
          )
        )
        .where(
          searchPattern
            ? or(
              like(users.username, searchPattern),
              like(users.fullname, searchPattern),
              like(users.email, searchPattern),
              like(users.phone, searchPattern),
              like(messages.content, searchPattern)
            )
            : undefined
        )
        .orderBy(desc(messages.createdAt));


      return userMessages;
      // const allUsersWithChats = await db.query.users.findMany({
      //   where: (user, { or: drizzleOr, like, exists, and }) => {
      //     if (!searchPattern) {
      //       return undefined; // No search, no top-level filter
      //     }

      //     const userMatches = drizzleOr(
      //       like(user.username, searchPattern),
      //       like(user.fullname, searchPattern),
      //       like(user.email, searchPattern),
      //       like(user.phone, searchPattern)
      //     );

      //     const chatMatches = exists(
      //       db
      //         .select()
      //         .from(chats)
      //         .where(
      //           and(
      //             eq(chats.userId, user.id),
      //             drizzleOr(
      //               exists(
      //                 db
      //                   .select()
      //                   .from(users)
      //                   .where(
      //                     and(
      //                       eq(users.id, chats.userId),
      //                       drizzleOr(
      //                         like(users.username, searchPattern),
      //                         like(users.fullname, searchPattern),
      //                         like(users.email, searchPattern),
      //                         like(users.phone, searchPattern)
      //                       )
      //                     )
      //                   )
      //               ),
      //               exists(
      //                 db
      //                   .select()
      //                   .from(messages)
      //                   .where(
      //                     and(
      //                       eq(messages.chatId, chats.id),
      //                       like(messages.content, searchPattern)
      //                     )
      //                   )
      //               )
      //             )
      //           )
      //         )
      //     );

      //     return drizzleOr(userMatches, chatMatches);
      //   },
      //   with: {
      //     chats: {
      //       where: (chat, { and, or, isNotNull, exists, like }) =>
      //         and(
      //           isNotNull(chat.userId),
      //           searchPattern
      //             ? or(
      //               exists(
      //                 db
      //                   .select()
      //                   .from(users)
      //                   .where(
      //                     and(
      //                       eq(users.id, chat.userId),
      //                       or(
      //                         like(users.username, searchPattern),
      //                         like(users.fullname, searchPattern),
      //                         like(users.email, searchPattern),
      //                         like(users.phone, searchPattern)
      //                       )
      //                     )
      //                   )
      //               ),
      //               exists(
      //                 db
      //                   .select()
      //                   .from(messages)
      //                   .where(
      //                     and(
      //                       eq(messages.chatId, chat.id),
      //                       like(messages.content, searchPattern)
      //                     )
      //                   )
      //               )
      //             )
      //             : undefined
      //         ),
      //       with: {
      //         messages: true,
      //         adminUser: true,
      //       },
      //     },
      //   },
      // });

      // return allUsersWithChats.map((user) => {
      //   const chatsWithMessages = sortChatsByLatestMessage(
      //     user.chats.map((chat) => ({
      //       ...chat,
      //       messages: chat.messages || [],
      //     }))
      //   );
      //   return {
      //     ...user,
      //     chats: chatsWithMessages,
      //   };
      // });
    } else if (chatUserType === "guest") {
      const guestMessages = await db.select({
        id: chats.id,
        guestId: chats.guestId,
        lastMessage: messages.content,
        lastMessageAttachmentUrl: messages?.attachmentUrl,
        type: chats?.type,
        lastMessageCreatedAt: messages.createdAt,
        chatStatus: chats.status
      })
        .from(chats)
        .leftJoin(
          messages,
          and(
            eq(messages.chatId, chats.id),
            eq(
              messages.createdAt,
              sql`(
              SELECT MAX(m2.created_at)
              FROM ${messages} m2
              WHERE m2.chat_id = ${chats.id}
            )`
            )
          )
        )
        .where(and(
          isNotNull(chats.guestId),
          searchPattern ? or(like(chats.guestId, searchPattern), like(messages.content, searchPattern)) : undefined
        ))
        .orderBy(desc(messages.createdAt));

      return guestMessages;

      //   where: (chat, { and, or, isNotNull, like: drizzleLike, exists }) =>
      //     and(
      //       isNotNull(chat.guestId),
      //       searchPattern
      //         ? or(
      //           drizzleLike(chat.guestId, searchPattern),
      //           exists(
      //             db
      //               .select()
      //               .from(messages)
      //               .where(
      //                 and(
      //                   eq(messages.chatId, chat.id),
      //                   drizzleLike(messages.content, searchPattern)
      //                 )
      //               )
      //           )
      //         )
      //         : undefined
      //     ),
      //   with: {
      //     messages: true,
      //     adminUser: true,
      //   },
      // });

      // return sortChatsByLatestMessage(
      //   allGuestChats.map((chat) => ({
      //     ...chat,
      //     messages: chat.messages || [],
      //     user: null,
      //   }))
      // );
    } else {
      // Default case (all chats)
      return []
    }
  }
}
