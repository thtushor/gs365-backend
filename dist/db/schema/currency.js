"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencies = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.currencies = (0, mysql_core_1.mysqlTable)("currencies", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    code: (0, mysql_core_1.varchar)("code", { length: 10 }).notNull().unique(),
    symbol: (0, mysql_core_1.varchar)("symbol", { length: 5 }),
    symbol_native: (0, mysql_core_1.varchar)("symbol_native", { length: 5 }),
    name: (0, mysql_core_1.varchar)("name", { length: 50 }),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("active"),
});
