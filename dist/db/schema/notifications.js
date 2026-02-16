"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifications = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.notifications = (0, mysql_core_1.mysqlTable)("notifications", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    notificationType: (0, mysql_core_1.mysqlEnum)("notification_type", [
        "claimable",
        "linkable",
        "static",
        "admin_player_transaction",
        "admin_affiliate_transaction",
        "admin_player_kyc",
        "admin_affiliate_kyc",
        "admin_others",
    ]).notNull(),
    title: (0, mysql_core_1.varchar)("title", { length: 300 }).notNull(),
    description: (0, mysql_core_1.text)("description"), // rich text/HTML
    posterImg: (0, mysql_core_1.text)("poster_img"), // file path or URL
    // For claimable
    amount: (0, mysql_core_1.decimal)("amount", { precision: 20, scale: 2 }),
    turnoverMultiply: (0, mysql_core_1.int)("turnover_multiply"),
    playerIds: (0, mysql_core_1.text)("player_ids"), // Comma-separated user IDs
    // For linkable
    promotionId: (0, mysql_core_1.int)("promotion_id"), // FK to promotions
    // For static
    link: (0, mysql_core_1.varchar)("link", { length: 500 }),
    // Meta
    startDate: (0, mysql_core_1.datetime)("start_date").notNull(),
    endDate: (0, mysql_core_1.datetime)("end_date").notNull(),
    // admin user // -- CRON JOB
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive", "claimed", "expired"]).default("active"),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
    createdBy: (0, mysql_core_1.int)("created_by").notNull(),
});
