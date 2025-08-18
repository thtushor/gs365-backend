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
import { sports_providers } from "./sportsProvider";

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

  // 🔑 Foreign keys
  categoryId: int("category_id"),
  providerId: int("provider_id"),
  createdBy: varchar("created_by", { length: 200 }), // username from token

  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const sportsRelation = relations(sports, ({ one }) => ({
  category: one(dropdownOptions, {
    fields: [sports.categoryId],
    references: [dropdownOptions.id],
  }),
  provider: one(sports_providers, {
    fields: [sports.providerId],
    references: [sports_providers.id],
  }),
}));
