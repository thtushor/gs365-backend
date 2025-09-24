import { sql } from "drizzle-orm";
import {
  int,
  text,
  varchar,
  decimal,
  datetime,
  mysqlEnum,
  mysqlTable,
} from "drizzle-orm/mysql-core";

export const notifications = mysqlTable("notifications", {
  id: int("id").primaryKey().autoincrement(),
  notificationType: mysqlEnum("notification_type", [
    "claimable",
    "linkable",
    "static",
  ]).notNull(),

  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"), // rich text/HTML
  posterImg: text("poster_img"), // file path or URL
  // For claimable
  amount: decimal("amount", { precision: 20, scale: 2 }),
  turnoverMultiply: int("turnover_multiply"),

  // For linkable
  promotionId: int("promotion_id"), // FK to promotions
  // For static
  link: varchar("link", { length: 500 }),
  // Meta
  startDate: datetime("start_date").notNull(),
  endDate: datetime("end_date").notNull(),

  // admin user // -- CRON JOB
  status: mysqlEnum("status", ["active", "inactive", "expired"]).default(
    "active"
  ),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),
  createdBy: int("created_by").notNull(),
});
