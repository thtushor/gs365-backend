import { mysqlTable, int, datetime, decimal } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const settings = mysqlTable("settings", {
  id: int("id").primaryKey().autoincrement(),
  defaultTurnover: int("default_turnover").notNull(),
  adminBalance: decimal("adminBalance").notNull(),
  maxWithdrawBalance: decimal("max_withdrawable_balance").default("25000"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),
});

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
