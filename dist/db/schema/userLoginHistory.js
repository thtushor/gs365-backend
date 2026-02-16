"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userLoginHistoryRelations = exports.userLoginHistory = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users");
exports.userLoginHistory = (0, mysql_core_1.mysqlTable)("user_login_history", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id")
        .notNull()
        .references(() => users_1.users.id, { onDelete: "cascade" }),
    ipAddress: (0, mysql_core_1.varchar)("ip_address", { length: 45 }).notNull(),
    userAgent: (0, mysql_core_1.text)("user_agent"),
    loginTime: (0, mysql_core_1.datetime)("login_time").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    deviceType: (0, mysql_core_1.varchar)("device_type", { length: 50 }),
    deviceName: (0, mysql_core_1.varchar)("device_name", { length: 100 }),
    osVersion: (0, mysql_core_1.varchar)("os_version", { length: 50 }),
    browser: (0, mysql_core_1.varchar)("browser", { length: 50 }),
    browserVersion: (0, mysql_core_1.varchar)("browser_version", { length: 50 }),
});
exports.userLoginHistoryRelations = (0, drizzle_orm_1.relations)(exports.userLoginHistory, ({ one }) => ({
    user: one(users_1.users, {
        fields: [exports.userLoginHistory.userId],
        references: [users_1.users.id],
    }),
}));
