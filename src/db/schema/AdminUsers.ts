import {
  mysqlTable,
  serial,
  varchar,
  datetime,
  int,
  boolean,
  decimal,
  mysqlEnum,
  text,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

export const adminUsers = mysqlTable("admin_users", {
  id: int("id").primaryKey().autoincrement(),

  username: varchar("username", { length: 50 }),
  fullname: varchar("fullname", { length: 100 }),
  phone: varchar("phone", { length: 20 }).unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar("password", { length: 255 }),

  country: varchar("country", { length: 255 }),
  city: varchar("city", { length: 255 }),
  street: varchar("street", { length: 255 }),

  minTrx: decimal("minimum_trx"),
  maxTrx: decimal("maximum_trx"),
  currency: int("currency"),

  role: mysqlEnum("role", [
    "admin",
    "superAgent",
    "agent",
    "superAffiliate",
    "affiliate",
  ]),

  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  refCode: varchar("ref_code", { length: 255 }).unique(),

  isLoggedIn: boolean("is_logged_in").default(false),
  isVerified: boolean("is_verified").default(false),

  lastIp: varchar("last_ip", { length: 120 }),
  lastLogin: datetime("last_login"),
  commission_percent: int("commission_percent"),
  main_balance: int("main_balance").default(0),
  downline_balance: int("downline_balance").default(0),
  withdrawable_balance: int("withdrawable_balance").default(0),

  // ✅ Device info fields
  device_type: varchar("device_type", { length: 50 }),
  device_name: varchar("device_name", { length: 100 }),
  os_version: varchar("os_version", { length: 50 }),
  browser: varchar("browser", { length: 50 }),
  browser_version: varchar("browser_version", { length: 50 }),
  ip_address: varchar("ip_address", { length: 45 }),
  device_token: text("device_token"),

  createdBy: int("created_by"),
  referred_by: int("referred_by"),

  created_at: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// 🔗 Self-reference for createdBy relationship
export const adminUsersRelations = relations(adminUsers, ({ one }) => ({
  createdByUser: one(adminUsers, {
    fields: [adminUsers.createdBy],
    references: [adminUsers.id],
  }),
}));
