"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countries = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.countries = (0, mysql_core_1.mysqlTable)("countries", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).notNull(),
    flagUrl: (0, mysql_core_1.text)("flag_url"),
    code: (0, mysql_core_1.varchar)("country_code", { length: 50 }).unique(),
    currencyId: (0, mysql_core_1.int)("currency_id"),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("active"),
});
