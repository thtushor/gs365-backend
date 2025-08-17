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
import { CategoryInfo, ProviderInfo } from "./games";

export const sports = mysqlTable("sports", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 300 }).notNull().unique(),
  parentId: int("parent_id"),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  isFavorite: boolean("is_favorite").default(false),
  isExclusive: boolean("is_exclusive").default(false),
  apiKey: text("api_key").notNull(),
  licenseKey: text("license_key").notNull(),
  sportLogo: text("sport_logo").notNull(),
  secretPin: varchar("secret_pin", { length: 150 }).notNull(),
  sportUrl: varchar("sport_url", { length: 300 }).notNull(),
  ggrPercent: varchar("ggr_percent", { length: 100 }).notNull(),

  // ➕ New fields:
  categoryInfo: json("category_info").$type<CategoryInfo>(),
  providerInfo: json("provider_info").$type<ProviderInfo>(),
  createdBy: varchar("created_by", { length: 200 }), // username from token

  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
