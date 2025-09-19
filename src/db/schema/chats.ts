import {
  mysqlTable,
  int,
  datetime,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { adminUsers } from "./AdminUsers";
import { messages } from "./messages";

export const ChatStatus = mysqlEnum("chat_status", [
  "open",
  "closed",
  "pending_admin_response",
  "pending_user_response",
]);

export const ChatType = mysqlEnum("chat_type",[
  "user","admin"
])

export const chats = mysqlTable("chats", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .references(() => users.id, { onDelete: "cascade" }),
  adminUserId: int("admin_user_id").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  status: ChatStatus.default("open"),
  type: ChatType.default("user"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),
});

export const chatsRelations = relations(chats, ({ one, many }) => ({
  user: one(users, {
    fields: [chats.userId],
    references: [users.id],
  }),
  adminUser: one(adminUsers, {
    fields: [chats.adminUserId],
    references: [adminUsers.id],
  }),
  messages: many(messages),
}));

export type Chat = typeof chats.$inferSelect;
export type NewChat = typeof chats.$inferInsert;
