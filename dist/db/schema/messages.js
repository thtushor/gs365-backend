"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesRelations = exports.messages = exports.MessageSenderType = exports.MessageType = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users");
const AdminUsers_1 = require("./AdminUsers");
const chats_1 = require("./chats");
exports.MessageType = (0, mysql_core_1.mysqlEnum)("message_type", ["text", "image", "file"]);
exports.MessageSenderType = (0, mysql_core_1.mysqlEnum)("message_sender_type", ["user", "admin", "guest", "system",]);
exports.messages = (0, mysql_core_1.mysqlTable)("messages", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    chatId: (0, mysql_core_1.int)("chat_id")
        .notNull()
        .references(() => chats_1.chats.id, { onDelete: "cascade" }),
    senderId: (0, mysql_core_1.int)("sender_id"), // Can be userId or adminUserId
    guestSenderId: (0, mysql_core_1.varchar)("guest_sender_id", { length: 300 }),
    senderType: exports.MessageSenderType.notNull(),
    messageType: exports.MessageType.default("text"),
    content: (0, mysql_core_1.text)("content").notNull(),
    attachmentUrl: (0, mysql_core_1.varchar)("attachment_url", { length: 500 }),
    isRead: (0, mysql_core_1.boolean)("is_read").default(false), // Correct usage of boolean
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
exports.messagesRelations = (0, drizzle_orm_1.relations)(exports.messages, ({ one }) => ({
    chat: one(chats_1.chats, {
        fields: [exports.messages.chatId],
        references: [chats_1.chats.id],
    }),
    senderUser: one(users_1.users, {
        fields: [exports.messages.senderId],
        references: [users_1.users.id],
    }),
    senderAdmin: one(AdminUsers_1.adminUsers, {
        fields: [exports.messages.senderId],
        references: [AdminUsers_1.adminUsers.id],
    }),
}));
