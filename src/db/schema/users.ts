import {
  mysqlTable,
  varchar,
  datetime,
  int,
  boolean,
  text,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

import { adminUsers } from "./AdminUsers";
import { currencies } from "./currency";
import { chats } from "./chats"; // Import chats schema

export const ActivityStatus = mysqlEnum("status", ["active", "inactive"]);

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),
  username: varchar("username", { length: 50 }).unique(),
  fullname: varchar("fullname", { length: 100 }),
  phone: varchar("phone", { length: 20 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),
  currency_id: int("currency_id"),
  country_id: int("country_id"),
  refer_code: varchar("refer_code", { length: 50 }),
  created_by: int("created_by"),
  status: ActivityStatus,
  isAgreeWithTerms: boolean("isAgreeWithTerms"),
  isLoggedIn: boolean("is_logged_in").default(false),
  isVerified: boolean("is_verified").default(false),
  isEmailVerified: boolean("is_email_verified").default(false),
  isPhoneVerified: boolean("is_phone_verified").default(false),
  lastIp: varchar("last_ip", { length: 120 }),
  lastLogin: datetime("last_login"),
  lastActivity: datetime("last_activity").default(sql`CURRENT_TIMESTAMP`),
  tokenVersion: int("token_version").default(0),

  // ✅ Email verification fields
  otp: varchar("otp", { length: 6 }),
  otp_expiry: datetime("otp_expiry"),

  // ✅ Password reset fields
  reset_password_token: varchar("reset_password_token", { length: 255 }),
  reset_password_token_expiry: datetime("reset_password_token_expiry"),

  // ✅ Spin and Forced spin fields
  isDailySpinCompleted: boolean("is_daily_spin_completed").default(false),
  isSpinForcedByAdmin: boolean("is_spin_forced_by_admin").default(false),
  isForcedSpinComplete: boolean("is_forced_spin_complete").default(false),
  lastSpinDate: datetime("last_spin_date"),

  // ✅ Device info fields
  device_type: varchar("device_type", { length: 50 }),
  device_name: varchar("device_name", { length: 100 }),
  os_version: varchar("os_version", { length: 50 }),
  browser: varchar("browser", { length: 50 }),
  browser_version: varchar("browser_version", { length: 50 }),
  ip_address: varchar("ip_address", { length: 45 }),
  device_token: text("device_token"),
  referred_by: int("referred_by"),
  referred_by_admin_user: int("referred_by_admin_user"),
  created_at: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  kyc_status: mysqlEnum("kyc_status", [
    "verified",
    "unverified",
    "required",
    "pending",
  ]).default("unverified"),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  currency: one(currencies, {
    fields: [users.currency_id],
    references: [currencies.id],
  }),
  createdByUser: one(adminUsers, {
    fields: [users.created_by],
    references: [adminUsers.id],
  }),
  chats: many(chats), // Add this line to define the relation
}));
