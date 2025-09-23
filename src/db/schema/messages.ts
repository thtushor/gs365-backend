import {
  mysqlTable,
  int,
  varchar,
  text,
  datetime,
  mysqlEnum,
  boolean, // Import boolean here
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { adminUsers } from "./AdminUsers";
import { chats } from "./chats";

export const MessageType = mysqlEnum("message_type", ["text", "image", "file"]);
export const MessageSenderType = mysqlEnum("message_sender_type", ["user", "admin","guest", "system",]);

export const messages = mysqlTable("messages", {
  id: int("id").primaryKey().autoincrement(),
  chatId: int("chat_id")
    .notNull()
    .references(() => chats.id, { onDelete: "cascade" }),
  senderId: int("sender_id"), // Can be userId or adminUserId
  guestSenderId: varchar("guest_sender_id",{length:300}),
  senderType: MessageSenderType.notNull(),
  messageType: MessageType.default("text"),
  content: text("content").notNull(),
  attachmentUrl: varchar("attachment_url", { length: 500 }),
  isRead: boolean("is_read").default(false), // Correct usage of boolean
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  chat: one(chats, {
    fields: [messages.chatId],
    references: [chats.id],
  }),
  senderUser: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  senderAdmin: one(adminUsers, {
    fields: [messages.senderId],
    references: [adminUsers.id],
  }),
}));

export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
