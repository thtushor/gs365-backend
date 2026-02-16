"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.languages = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.languages = (0, mysql_core_1.mysqlTable)("languages", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    code: (0, mysql_core_1.varchar)("code", { length: 10 }),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("active"),
});
