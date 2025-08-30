import {
  mysqlTable,
  int,
  varchar,
  mysqlEnum,
  datetime,
  decimal,
  text,
  json,
  boolean,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const promotions = mysqlTable("promotions", {
  id: int("id").primaryKey().autoincrement(),
  promotionName: varchar("promotion_name", { length: 300 }).notNull().unique(),
  promotionTypeId: json("promotion_type_id").notNull(), // ✅ Now supports array
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  dateRange: varchar("date_range", { length: 255 }).notNull(),
  minimumDepositAmount: decimal("minimum_deposit_amount", {
    precision: 20,
    scale: 2,
  }).notNull(),
  maximumDepositAmount: decimal("maximum_deposit_amount", {
    precision: 20,
    scale: 2,
  }).notNull(),
  turnoverMultiply: int("turnover_multiply").notNull(),
  bannerImg: text("banner_img").notNull(),
  bonus: int("bonus").notNull(),
  description: text("description").notNull(),
  isRecommended: boolean("is_recommended").default(false),
  createdBy: varchar("created_by", { length: 200 }).notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
