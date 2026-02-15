import {
  mysqlTable,
  int,
  datetime,
  decimal,
  json,
  boolean,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const settings = mysqlTable("settings", {
  id: int("id").primaryKey().autoincrement(),
  defaultTurnover: int("default_turnover").notNull(),
  adminBalance: decimal("adminBalance").notNull(),
  minWithdrawableBalance: decimal("min_withdrawable_balance").default("25000"),
  conversionRate: decimal("conversion_rate").default("100"),
  spinTurnoverMultiply: decimal("spin_turnover_multiply").default("10"),
  isGlobalSpinEnabled: mysqlEnum("is_global_spin_enabled", [
    "Enabled",
    "Disabled",
  ]).default("Enabled"),
  isEmailVerificationEnabled: mysqlEnum("is_email_verification_enabled", [
    "Enabled",
    "Disabled",
  ]).default("Enabled"),
  isSmsVerificationEnabled: mysqlEnum("is_sms_verification_enabled", [
    "Enabled",
    "Disabled",
  ]).default("Enabled"),
  affiliateWithdrawTime: json("affiliate_withdraw_time").$type<string[]>(),
  systemActiveTime: json("system_active_time").$type<{
    start: string;
    end: string;
  } | null>(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
  ),
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
