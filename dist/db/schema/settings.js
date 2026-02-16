"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.settings = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.settings = (0, mysql_core_1.mysqlTable)("settings", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    defaultTurnover: (0, mysql_core_1.int)("default_turnover").notNull(),
    adminBalance: (0, mysql_core_1.decimal)("adminBalance").notNull(),
    minWithdrawableBalance: (0, mysql_core_1.decimal)("min_withdrawable_balance").default("25000"),
    conversionRate: (0, mysql_core_1.decimal)("conversion_rate").default("100"),
    spinTurnoverMultiply: (0, mysql_core_1.decimal)("spin_turnover_multiply").default("10"),
    isGlobalSpinEnabled: (0, mysql_core_1.mysqlEnum)("is_global_spin_enabled", [
        "Enabled",
        "Disabled",
    ]).default("Enabled"),
    affiliateWithdrawTime: (0, mysql_core_1.json)("affiliate_withdraw_time").$type(),
    systemActiveTime: (0, mysql_core_1.json)("system_active_time").$type(),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
