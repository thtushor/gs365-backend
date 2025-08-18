import { relations, sql } from "drizzle-orm";
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
import { dropdownOptions } from "./dropdowns";
import { game_providers } from "./gameProvider";
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

  // 🔑 Foreign keys
  categoryId: int("category_id"),
  providerId: int("provider_id"),

  createdBy: varchar("created_by", { length: 200 }), // username from token
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const gameRelations = relations(games, ({ one }) => ({
  category: one(dropdownOptions, {
    fields: [games.categoryId],
    references: [dropdownOptions.id],
  }),
  provider: one(game_providers, {
    fields: [games.providerId],
    references: [game_providers.id],
  }),
}));
