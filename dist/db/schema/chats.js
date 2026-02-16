"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatsRelations = exports.chats = exports.ChatType = exports.ChatStatus = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users");
const AdminUsers_1 = require("./AdminUsers");
const messages_1 = require("./messages");
exports.ChatStatus = (0, mysql_core_1.mysqlEnum)("chat_status", [
    "open",
    "closed",
    "pending_admin_response",
    // "pending_affiliate_response",
    "pending_user_response",
]);
exports.ChatType = (0, mysql_core_1.mysqlEnum)("chat_type", [
    "user", "admin", "guest"
]);
exports.chats = (0, mysql_core_1.mysqlTable)("chats", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id")
        .references(() => users_1.users.id, { onDelete: "cascade" }),
    adminUserId: (0, mysql_core_1.int)("admin_user_id").references(() => AdminUsers_1.adminUsers.id, {
        onDelete: "set null",
    }),
    guestId: (0, mysql_core_1.varchar)("guestId", {
        length: 300
    }),
    status: exports.ChatStatus.default("open"),
    type: exports.ChatType.default("user"),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
exports.chatsRelations = (0, drizzle_orm_1.relations)(exports.chats, ({ one, many }) => ({
    user: one(users_1.users, {
        fields: [exports.chats.userId],
        references: [users_1.users.id],
    }),
    adminUser: one(AdminUsers_1.adminUsers, {
        fields: [exports.chats.adminUserId],
        references: [AdminUsers_1.adminUsers.id],
    }),
    messages: many(messages_1.messages),
}));
