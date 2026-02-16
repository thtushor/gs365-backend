"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.designation = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const AdminUsers_1 = require("./AdminUsers");
exports.designation = (0, mysql_core_1.mysqlTable)("designation", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    designationName: (0, mysql_core_1.varchar)("designation_name", { length: 200 }).notNull().unique(),
    adminUserType: AdminUsers_1.adminRole,
    permissions: (0, mysql_core_1.json)("permissions").notNull(), // Array of string permissions
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
