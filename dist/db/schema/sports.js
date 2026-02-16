"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sportsRelation = exports.sports = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
const dropdowns_1 = require("./dropdowns");
const sportsProvider_1 = require("./sportsProvider");
exports.sports = (0, mysql_core_1.mysqlTable)("sports", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 300 }).notNull().unique(),
    parentId: (0, mysql_core_1.int)("parent_id"),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    isFavorite: (0, mysql_core_1.boolean)("is_favorite").default(false),
    isExclusive: (0, mysql_core_1.boolean)("is_exclusive").default(false),
    apiKey: (0, mysql_core_1.text)("api_key").notNull(),
    licenseKey: (0, mysql_core_1.text)("license_key").notNull(),
    sportLogo: (0, mysql_core_1.text)("sport_logo").notNull(),
    secretPin: (0, mysql_core_1.varchar)("secret_pin", { length: 150 }).notNull(),
    sportUrl: (0, mysql_core_1.varchar)("sport_url", { length: 300 }).notNull(),
    ggrPercent: (0, mysql_core_1.varchar)("ggr_percent", { length: 100 }).notNull(),
    // 🔑 Foreign keys
    categoryId: (0, mysql_core_1.int)("category_id"),
    providerId: (0, mysql_core_1.int)("provider_id"),
    createdBy: (0, mysql_core_1.varchar)("created_by", { length: 200 }), // username from token
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.sportsRelation = (0, drizzle_orm_1.relations)(exports.sports, ({ one }) => ({
    category: one(dropdowns_1.dropdownOptions, {
        fields: [exports.sports.categoryId],
        references: [dropdowns_1.dropdownOptions.id],
    }),
    provider: one(sportsProvider_1.sports_providers, {
        fields: [exports.sports.providerId],
        references: [sportsProvider_1.sports_providers.id],
    }),
}));
