import {
  mysqlTable,
  int,
  varchar,
  text,
  datetime,
  boolean,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const autoReplies = mysqlTable("auto_replies", {
  id: int("id").primaryKey().autoincrement(),
  keyword: varchar("keyword", { length: 255 }).notNull().unique(),
  replyMessage: text("reply_message").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),
});

export type AutoReply = typeof autoReplies.$inferSelect;
export type NewAutoReply = typeof autoReplies.$inferInsert;
