import { sql } from "drizzle-orm";
import {
  boolean,
  datetime,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

export const game_providers = mysqlTable("game_providers", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 300 }).notNull().unique(),
  parentId: int("parent_id"),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  minBalanceLimit: decimal("min_balance_limit", {
    precision: 20,
    scale: 2,
  }).notNull(),
  mainBalance: decimal("main_balance", {
    precision: 20,
    scale: 2,
  })
    .notNull()
    .default("0"),
  totalExpense: decimal("total_expense", {
    precision: 20,
    scale: 2,
  })
    .notNull()
    .default("0"),
  providerIp: text("provider_ip").notNull(),
  licenseKey: text("license_key").notNull(),
  phone: varchar("phone", { length: 200 }).notNull(),
  email: varchar("email", { length: 250 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 200 }),
  parentName: varchar("parent_name", { length: 200 }),
  telegram: varchar("telegram", { length: 200 }),
  country: varchar("country", { length: 200 }).notNull(),
  logo: text("logo").notNull(),
  isMenu: boolean("is_menu").default(false),
  icon: text("icon"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
