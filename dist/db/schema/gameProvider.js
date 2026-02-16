"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.game_providers = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.game_providers = (0, mysql_core_1.mysqlTable)("game_providers", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 300 }).notNull().unique(),
    parentId: (0, mysql_core_1.int)("parent_id"),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    minBalanceLimit: (0, mysql_core_1.decimal)("min_balance_limit", {
        precision: 20,
        scale: 2,
    }).notNull(),
    mainBalance: (0, mysql_core_1.decimal)("main_balance", {
        precision: 20,
        scale: 2,
    })
        .notNull()
        .default("0"),
    totalExpense: (0, mysql_core_1.decimal)("total_expense", {
        precision: 20,
        scale: 2,
    })
        .notNull()
        .default("0"),
    providerIp: (0, mysql_core_1.text)("provider_ip").notNull(),
    licenseKey: (0, mysql_core_1.text)("license_key").notNull(),
    phone: (0, mysql_core_1.varchar)("phone", { length: 200 }).notNull(),
    email: (0, mysql_core_1.varchar)("email", { length: 250 }).notNull(),
    whatsapp: (0, mysql_core_1.varchar)("whatsapp", { length: 200 }),
    parentName: (0, mysql_core_1.varchar)("parent_name", { length: 200 }),
    telegram: (0, mysql_core_1.varchar)("telegram", { length: 200 }),
    country: (0, mysql_core_1.varchar)("country", { length: 200 }).notNull(),
    logo: (0, mysql_core_1.text)("logo").notNull(),
    isMenu: (0, mysql_core_1.boolean)("is_menu").default(false),
    menuPriority: (0, mysql_core_1.int)("menu_priority").default(0),
    icon: (0, mysql_core_1.text)("icon"),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
