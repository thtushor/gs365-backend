import { sql } from "drizzle-orm";
import {
  boolean,
  datetime,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

export const games = mysqlTable("games", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 300 }).notNull().unique(),
  parentId: int("parent_id"),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  isFavorite: boolean("is_favorite").default(false),
  apiKey: text("api_key").notNull(),
  licenseKey: text("license_key").notNull(),
  gameLogo: text("game_logo").notNull(),
  secretPin: varchar("secret_pin", { length: 150 }).notNull(),
  gameUrl: varchar("game_url", { length: 300 }).notNull(),
  ggrPercent: varchar("ggr_percent", { length: 100 }).notNull(),

  // ➕ New fields:
  categoryInfo: json("category_info"),
  providerInfo: json("provider_info"),
  createdBy: varchar("created_by", { length: 200 }),
  categoryId: int("category_id").notNull(),
  providerId: int("provider_id").notNull(),

  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
