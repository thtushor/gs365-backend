import {
  mysqlTable,
  int,
  varchar,
  datetime,
  text,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";

export const userLoginHistory = mysqlTable("user_login_history", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent"),
  loginTime: datetime("login_time").default(sql`CURRENT_TIMESTAMP`),
  deviceType: varchar("device_type", { length: 50 }),
  deviceName: varchar("device_name", { length: 100 }),
  osVersion: varchar("os_version", { length: 50 }),
  browser: varchar("browser", { length: 50 }),
  browserVersion: varchar("browser_version", { length: 50 }),
});

export const userLoginHistoryRelations = relations(userLoginHistory, ({ one }) => ({
  user: one(users, {
    fields: [userLoginHistory.userId],
    references: [users.id],
  }),
}));

export type UserLoginHistory = typeof userLoginHistory.$inferSelect;
export type NewUserLoginHistory = typeof userLoginHistory.$inferInsert;