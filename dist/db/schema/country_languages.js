"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryLanguages = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.countryLanguages = (0, mysql_core_1.mysqlTable)("country_languages", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    countryId: (0, mysql_core_1.int)("country_id").notNull(),
    languageId: (0, mysql_core_1.int)("language_id").notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("active"),
}, (table) => ({
    unique: [table.countryId, table.languageId],
}));
