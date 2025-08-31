import { relations, sql } from "drizzle-orm";
import {
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  text,
  varchar,
} from "drizzle-orm/mysql-core";
import { sports } from "./sports";

export const banners = mysqlTable("hero_banners", {
  id: int("id").primaryKey().autoincrement(),
  dateRange: varchar("date_range", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  images: text("banner_images").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const announcements = mysqlTable("announcements", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 1500 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  dateRange: varchar("date_range", { length: 255 }),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export const website_popups = mysqlTable("website_popups", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  message: varchar("message", { length: 3000 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  dateRange: varchar("date_range", { length: 255 }),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export const video_advertisement = mysqlTable("video_advertisement", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 255 }).notNull(),
  description: varchar("description", { length: 3000 }),
  videoUrl: varchar("video_url", { length: 500 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  dateRange: varchar("date_range", { length: 255 }),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export const sponsors = mysqlTable("sponsors", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  logo: varchar("logo", { length: 500 }).notNull(),
  companyType: varchar("company_type", { length: 255 }).notNull(),
  description: varchar("description", { length: 3000 }),
  duration: varchar("duration", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export const ambassadors = mysqlTable("ambassadors", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  photo: varchar("photo", { length: 500 }).notNull(),
  signature: varchar("signature", { length: 255 }).notNull(),
  description: varchar("description", { length: 3000 }),
  duration: varchar("duration", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export const gamingLicenses = mysqlTable("gaming_licenses", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 500 }).notNull(),
  duration: varchar("duration", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export const responsibleGaming = mysqlTable("responsible_gaming", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  icon: varchar("icon", { length: 500 }).notNull(),
  duration: varchar("duration", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export const events = mysqlTable("events", {
  id: int("id").primaryKey().autoincrement(),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  images: text("banner_images").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  sportId: int("sport_id").notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export const featuredGames = mysqlTable("featured_games", {
  id: int("id").primaryKey().default(1),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  images: text("banner_images").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  gameId: int("game_id").notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
export const eventsRelation = relations(events, ({ one }) => ({
  sport: one(sports, {
    fields: [events.sportId],
    references: [sports.id],
  }),
}));
