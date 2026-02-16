"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventsRelation = exports.socials = exports.featuredGames = exports.events = exports.responsibleGaming = exports.gamingLicenses = exports.ambassadors = exports.sponsors = exports.video_advertisement = exports.faqs = exports.website_popups = exports.announcements = exports.banners = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
const sports_1 = require("./sports");
exports.banners = (0, mysql_core_1.mysqlTable)("hero_banners", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    dateRange: (0, mysql_core_1.varchar)("date_range", { length: 255 }),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    images: (0, mysql_core_1.text)("banner_images").notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.announcements = (0, mysql_core_1.mysqlTable)("announcements", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, mysql_core_1.varchar)("description", { length: 1500 }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    dateRange: (0, mysql_core_1.varchar)("date_range", { length: 255 }),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.website_popups = (0, mysql_core_1.mysqlTable)("website_popups", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    message: (0, mysql_core_1.varchar)("message", { length: 3000 }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    dateRange: (0, mysql_core_1.varchar)("date_range", { length: 255 }),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.faqs = (0, mysql_core_1.mysqlTable)("faqs", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    dropdownOptionsId: (0, mysql_core_1.int)("dropdown_option_id").notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    message: (0, mysql_core_1.varchar)("message", { length: 3000 }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.video_advertisement = (0, mysql_core_1.mysqlTable)("video_advertisement", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    description: (0, mysql_core_1.varchar)("description", { length: 3000 }),
    videoUrl: (0, mysql_core_1.varchar)("video_url", { length: 500 }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    dateRange: (0, mysql_core_1.varchar)("date_range", { length: 255 }),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.sponsors = (0, mysql_core_1.mysqlTable)("sponsors", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    logo: (0, mysql_core_1.varchar)("logo", { length: 500 }).notNull(),
    companyType: (0, mysql_core_1.varchar)("company_type", { length: 255 }).notNull(),
    description: (0, mysql_core_1.varchar)("description", { length: 3000 }),
    duration: (0, mysql_core_1.varchar)("duration", { length: 255 }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.ambassadors = (0, mysql_core_1.mysqlTable)("ambassadors", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    photo: (0, mysql_core_1.varchar)("photo", { length: 500 }).notNull(),
    signature: (0, mysql_core_1.varchar)("signature", { length: 255 }).notNull(),
    description: (0, mysql_core_1.varchar)("description", { length: 3000 }),
    duration: (0, mysql_core_1.varchar)("duration", { length: 255 }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.gamingLicenses = (0, mysql_core_1.mysqlTable)("gaming_licenses", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    icon: (0, mysql_core_1.varchar)("icon", { length: 500 }).notNull(),
    duration: (0, mysql_core_1.varchar)("duration", { length: 255 }),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.responsibleGaming = (0, mysql_core_1.mysqlTable)("responsible_gaming", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 255 }).notNull(),
    icon: (0, mysql_core_1.varchar)("icon", { length: 500 }).notNull(),
    duration: (0, mysql_core_1.varchar)("duration", { length: 255 }),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.events = (0, mysql_core_1.mysqlTable)("events", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    images: (0, mysql_core_1.text)("banner_images").notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    sportId: (0, mysql_core_1.int)("sport_id").notNull(),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.featuredGames = (0, mysql_core_1.mysqlTable)("featured_games", {
    id: (0, mysql_core_1.int)("id").primaryKey().default(1),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    images: (0, mysql_core_1.text)("banner_images").notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    gameId: (0, mysql_core_1.int)("game_id").notNull(),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.socials = (0, mysql_core_1.mysqlTable)("socials", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    images: (0, mysql_core_1.text)("banner_images").notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 255 }).notNull(),
    link: (0, mysql_core_1.varchar)("link", { length: 255 }).notNull(),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.eventsRelation = (0, drizzle_orm_1.relations)(exports.events, ({ one }) => ({
    sport: one(sports_1.sports, {
        fields: [exports.events.sportId],
        references: [sports_1.sports.id],
    }),
}));
