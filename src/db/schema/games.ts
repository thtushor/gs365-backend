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
// types for JSON columns
export type CategoryInfo = {
  id: number;
  title: string;
  dropdown_id: number;
  imgUrl?: string | null;
  status: "active" | "inactive";
  created_by: string;
  created_at: string;
};
export interface ProviderInfo {
  id: number;
  name: string;
  status: "active" | "inactive";
  country: string;
  logo: string;
  createdAt: string;
}
export const games = mysqlTable("games", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 300 }).notNull().unique(),
  parentId: int("parent_id"),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  isFavorite: boolean("is_favorite").default(false),
  isExclusive: boolean("is_exclusive").default(false),
  apiKey: text("api_key").notNull(),
  licenseKey: text("license_key").notNull(),
  gameLogo: text("game_logo").notNull(),
  secretPin: varchar("secret_pin", { length: 150 }).notNull(),
  gameUrl: varchar("game_url", { length: 300 }).notNull(),
  ggrPercent: varchar("ggr_percent", { length: 100 }).notNull(),

  // ➕ New fields:
  categoryInfo: json("category_info").$type<CategoryInfo>(),
  providerInfo: json("provider_info").$type<ProviderInfo>(),
  createdBy: varchar("created_by", { length: 200 }), // username from token
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
