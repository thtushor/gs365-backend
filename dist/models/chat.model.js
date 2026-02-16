"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModel = void 0;
const connection_1 = require("../db/connection");
const chats_1 = require("../db/schema/chats");
const users_1 = require("../db/schema/users"); // Import users schema
const AdminUsers_1 = require("../db/schema/AdminUsers"); // Import adminUsers schema
const messages_1 = require("../db/schema/messages"); // Import messages schema
const drizzle_orm_1 = require("drizzle-orm");
function sortChatsByLatestMessage(chats) {
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
function sortByLatestIds(allUsersWithChats) {
    return allUsersWithChats
        .map(user => {
        // 1. Sort messages inside each chat by message.id (latest first)
        const chatsWithSortedMessages = user.chats.map((chat) => ({
            ...chat,
            messages: [...chat.messages].sort((m1, m2) => m2.id - m1.id),
        }));
        // 2. Sort chats inside each user by chat.id (latest first)
        const sortedChats = chatsWithSortedMessages.sort((c1, c2) => c2.id - c1.id);
        return { ...user, chats: sortedChats };
    })
        // 3. Sort users by their latest chat’s latest message id
        .sort((u1, u2) => {
        const u1LatestMsgId = u1.chats[0]?.messages[0]?.id || 0;
        const u2LatestMsgId = u2.chats[0]?.messages[0]?.id || 0;
        return u2LatestMsgId - u1LatestMsgId;
    });
}
class ChatModel {
    static async createChat(newChat) {
        const [chat] = await connection_1.db.insert(chats_1.chats).values(newChat);
        return chat.insertId;
    }
    static async getChatById(chatId) {
        return await connection_1.db.query.chats.findFirst({
            where: (0, drizzle_orm_1.eq)(chats_1.chats.id, chatId),
            with: {
                user: true,
                adminUser: true,
                messages: true,
            },
        });
    }
    static async getChatsByUserId(userId) {
        const userChats = await connection_1.db.query.chats.findMany({
            where: (0, drizzle_orm_1.eq)(chats_1.chats.userId, userId),
            with: {
                user: true,
                adminUser: true,
                messages: true,
            },
            orderBy: (chats, { desc }) => [desc(chats.createdAt)], // Order by creation date to get last chats
        });
        return userChats;
    }
    static async getChatsByGuestId(guestId) {
        return await connection_1.db.query.chats.findMany({
            where: (0, drizzle_orm_1.eq)(chats_1.chats.guestId, guestId),
            with: {
                adminUser: true,
                messages: true,
            },
            orderBy: (chats, { desc }) => [desc(chats.createdAt)],
        });
    }
    static async getChatsByAdminId(adminId) {
        return await connection_1.db.query.chats.findMany({
            where: (0, drizzle_orm_1.eq)(chats_1.chats.adminUserId, adminId),
            with: {
                user: true,
                adminUser: true,
                messages: true,
            },
            orderBy: (chats, { desc }) => [desc(chats.createdAt)], // Order by creation date to get last chats
        });
    }
    static async updateChatStatus(chatId, status) {
        const [updatedChat] = await connection_1.db
            .update(chats_1.chats)
            .set({ status, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(chats_1.chats.id, chatId));
        return updatedChat;
    }
    static async assignAdminToChat(chatId, adminUserId) {
        const [updatedChat] = await connection_1.db
            .update(chats_1.chats)
            .set({ adminUserId, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(chats_1.chats.id, chatId));
        return updatedChat;
    }
    static async getAllChats(chatUserType, searchKey) {
        const searchPattern = searchKey ? `%${searchKey}%` : undefined;
        if (chatUserType === "admin") {
            const adminMessages = await connection_1.db
                .select({
                id: AdminUsers_1.adminUsers.id,
                username: AdminUsers_1.adminUsers.username,
                fullname: AdminUsers_1.adminUsers.fullname,
                email: AdminUsers_1.adminUsers.email,
                phone: AdminUsers_1.adminUsers.phone,
                role: AdminUsers_1.adminUsers.role,
                lastMessage: messages_1.messages.content,
                lastMessageCreatedAt: messages_1.messages.createdAt,
                lastMessageAttachmentUrl: messages_1.messages?.attachmentUrl,
                chatStatus: chats_1.chats.status
            })
                .from(AdminUsers_1.adminUsers)
                .leftJoin(chats_1.chats, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(chats_1.chats.adminUserId, AdminUsers_1.adminUsers.id), (0, drizzle_orm_1.eq)(chats_1.chats.createdAt, (0, drizzle_orm_1.sql) `(
              SELECT MAX(c2.created_at)
              FROM ${chats_1.chats} c2
              WHERE c2.admin_user_id = ${AdminUsers_1.adminUsers.id}
            )`)))
                .leftJoin(messages_1.messages, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(messages_1.messages.chatId, chats_1.chats.id), (0, drizzle_orm_1.eq)(messages_1.messages.createdAt, (0, drizzle_orm_1.sql) `(
          SELECT MAX(m2.created_at)
          FROM ${messages_1.messages} m2
          WHERE m2.chat_id = ${chats_1.chats.id}
        )`)))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(AdminUsers_1.adminUsers.role, ["affiliate", "superAffiliate"]), searchPattern
                ? (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(AdminUsers_1.adminUsers.username, searchPattern), (0, drizzle_orm_1.like)(AdminUsers_1.adminUsers.fullname, searchPattern), (0, drizzle_orm_1.like)(AdminUsers_1.adminUsers.email, searchPattern), (0, drizzle_orm_1.like)(AdminUsers_1.adminUsers.phone, searchPattern), (0, drizzle_orm_1.like)(messages_1.messages.content, searchPattern))
                : undefined))
                .orderBy((0, drizzle_orm_1.desc)(messages_1.messages.createdAt));
            return adminMessages;
        }
        else if (chatUserType === "user") {
            const userMessages = await connection_1.db
                .select({
                id: users_1.users.id,
                username: users_1.users.username,
                fullname: users_1.users.fullname,
                email: users_1.users.email,
                phone: users_1.users.phone,
                lastMessage: messages_1.messages.content,
                lastMessageCreatedAt: messages_1.messages.createdAt,
                lastMessageAttachmentUrl: messages_1.messages?.attachmentUrl,
                chatStatus: chats_1.chats.status
            })
                .from(users_1.users)
                .leftJoin(chats_1.chats, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(chats_1.chats.userId, users_1.users.id), (0, drizzle_orm_1.eq)(chats_1.chats.createdAt, (0, drizzle_orm_1.sql) `(
            SELECT MAX(c2.created_at)
            FROM ${chats_1.chats} c2
            WHERE c2.user_id = ${users_1.users.id}
          )`)))
                .leftJoin(messages_1.messages, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(messages_1.messages.chatId, chats_1.chats.id), (0, drizzle_orm_1.eq)(messages_1.messages.createdAt, (0, drizzle_orm_1.sql) `(
              SELECT MAX(m2.created_at)
              FROM ${messages_1.messages} m2
              WHERE m2.chat_id = ${chats_1.chats.id}
            )`)))
                .where(searchPattern
                ? (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(users_1.users.username, searchPattern), (0, drizzle_orm_1.like)(users_1.users.fullname, searchPattern), (0, drizzle_orm_1.like)(users_1.users.email, searchPattern), (0, drizzle_orm_1.like)(users_1.users.phone, searchPattern), (0, drizzle_orm_1.like)(messages_1.messages.content, searchPattern))
                : undefined)
                .orderBy((0, drizzle_orm_1.desc)(messages_1.messages.createdAt));
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
        }
        else if (chatUserType === "guest") {
            const guestMessages = await connection_1.db.select({
                id: chats_1.chats.id,
                guestId: chats_1.chats.guestId,
                lastMessage: messages_1.messages.content,
                lastMessageAttachmentUrl: messages_1.messages?.attachmentUrl,
                type: chats_1.chats?.type,
                lastMessageCreatedAt: messages_1.messages.createdAt,
                chatStatus: chats_1.chats.status
            })
                .from(chats_1.chats)
                .leftJoin(messages_1.messages, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(messages_1.messages.chatId, chats_1.chats.id), (0, drizzle_orm_1.eq)(messages_1.messages.createdAt, (0, drizzle_orm_1.sql) `(
              SELECT MAX(m2.created_at)
              FROM ${messages_1.messages} m2
              WHERE m2.chat_id = ${chats_1.chats.id}
            )`)))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.isNotNull)(chats_1.chats.guestId), searchPattern ? (0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(chats_1.chats.guestId, searchPattern), (0, drizzle_orm_1.like)(messages_1.messages.content, searchPattern)) : undefined))
                .orderBy((0, drizzle_orm_1.desc)(messages_1.messages.createdAt));
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
        }
        else {
            // Default case (all chats)
            return [];
        }
    }
}
exports.ChatModel = ChatModel;
