"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageModel = void 0;
const connection_1 = require("../db/connection");
const messages_1 = require("../db/schema/messages");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
class MessageModel {
    static async createMessage(newMessage) {
        const [message] = await connection_1.db.insert(messages_1.messages).values(newMessage);
        return message;
    }
    static async getMessagesByChatId(chatId) {
        return await connection_1.db.query.messages.findMany({
            where: (0, drizzle_orm_1.eq)(messages_1.messages.chatId, chatId),
            with: {
                senderUser: true,
                senderAdmin: true,
            },
            orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        });
    }
    static async markMessagesAsRead(chatId, senderType) {
        const [updatedMessages] = await connection_1.db
            .update(messages_1.messages)
            .set({ isRead: true, updatedAt: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(messages_1.messages.chatId, chatId), (0, drizzle_orm_1.eq)(messages_1.messages.senderType, senderType)));
        return updatedMessages;
    }
    static async getMessagesBySenderIdAndType(senderId, senderType) {
        return await connection_1.db.query.messages.findMany({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(messages_1.messages.senderId, senderId), (0, drizzle_orm_1.eq)(messages_1.messages.senderType, senderType)),
            with: {
                senderUser: true,
                senderAdmin: true,
            },
            orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        });
    }
    static async getMessagesByGuestSenderId(guestSenderId) {
        const getChatIds = await connection_1.db.query.chats.findMany({
            where: (0, drizzle_orm_1.eq)(schema_1.chats.guestId, guestSenderId)
        }).then((res) => res.map((item) => item?.id));
        return await connection_1.db.query.messages.findMany({
            where: (0, drizzle_orm_1.inArray)(messages_1.messages.chatId, getChatIds.filter((item) => Boolean(item))),
            with: {
                senderAdmin: true,
                senderUser: true,
            },
            orderBy: (messages, { asc }) => [asc(messages.createdAt)],
        });
    }
    static async getMessagesByUserOrAdminId(id, type) {
        const senderUserTable = (0, drizzle_orm_1.aliasedTable)(schema_1.users, "senderUserTable");
        const senderUserAdminTable = (0, drizzle_orm_1.aliasedTable)(schema_1.adminUsers, "senderAdminTable");
        const whereCondition = [];
        if (type === "user") {
            // await db.update(chats).set({
            //   status:"open"
            // })
            // .where(and(eq(chats.userId,id as number), ne(chats.status,"open")))
            whereCondition.push((0, drizzle_orm_1.eq)(schema_1.chats.userId, id));
        }
        if (type === "admin") {
            whereCondition.push((0, drizzle_orm_1.eq)(schema_1.chats.adminUserId, id));
            // await db.update(chats).set({
            //   status:"open"
            // })
            // .where(and(eq(chats.adminUserId,id as number), ne(chats.status,"open")))
        }
        if (type === "guest") {
            whereCondition.push((0, drizzle_orm_1.eq)(schema_1.chats.guestId, id));
            // await db.update(chats).set({
            //   status:"open"
            // })
            // .where(and(eq(chats.guestId,id as string), ne(chats.status,"open")))
        }
        const messagesData = await connection_1.db
            .select({
            id: messages_1.messages.id,
            chatId: messages_1.messages.chatId,
            senderId: messages_1.messages.senderId,
            senderType: messages_1.messages.senderType,
            content: messages_1.messages.content,
            attachmentUrl: messages_1.messages.attachmentUrl,
            guestSenderId: messages_1.messages.guestSenderId,
            isRead: messages_1.messages.isRead,
            createdAt: messages_1.messages.createdAt,
            updatedAt: messages_1.messages.updatedAt,
            senderUser: senderUserTable,
            senderAdmin: senderUserAdminTable,
            chat: schema_1.chats,
        })
            .from(messages_1.messages)
            .leftJoin(schema_1.chats, (0, drizzle_orm_1.eq)(schema_1.chats.id, messages_1.messages.chatId))
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.chats.userId))
            .leftJoin(schema_1.adminUsers, (0, drizzle_orm_1.eq)(schema_1.adminUsers.id, schema_1.chats.adminUserId))
            .leftJoin(senderUserAdminTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(senderUserAdminTable.id, messages_1.messages.senderId), (0, drizzle_orm_1.eq)(messages_1.messages.senderType, "admin")))
            .leftJoin(senderUserTable, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(senderUserTable.id, messages_1.messages.senderId), (0, drizzle_orm_1.eq)(messages_1.messages.senderType, "user")))
            .where((0, drizzle_orm_1.and)(...whereCondition));
        return messagesData;
    }
}
exports.MessageModel = MessageModel;
