"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.promotions = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.promotions = (0, mysql_core_1.mysqlTable)("promotions", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    promotionName: (0, mysql_core_1.varchar)("promotion_name", { length: 300 }).notNull().unique(),
    promotionTypeId: (0, mysql_core_1.json)("promotion_type_id").notNull(), // ✅ Now supports array
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    dateRange: (0, mysql_core_1.varchar)("date_range", { length: 255 }).notNull(),
    minimumDepositAmount: (0, mysql_core_1.decimal)("minimum_deposit_amount", {
        precision: 20,
        scale: 2,
    }).notNull(),
    maximumDepositAmount: (0, mysql_core_1.decimal)("maximum_deposit_amount", {
        precision: 20,
        scale: 2,
    }).notNull(),
    turnoverMultiply: (0, mysql_core_1.int)("turnover_multiply").notNull(),
    bannerImg: (0, mysql_core_1.text)("banner_img").notNull(),
    bonus: (0, mysql_core_1.int)("bonus").notNull(),
    description: (0, mysql_core_1.text)("description").notNull(),
    isRecommended: (0, mysql_core_1.boolean)("is_recommended").default(false),
    createdBy: (0, mysql_core_1.varchar)("created_by", { length: 200 }).notNull(),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
