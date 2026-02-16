"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dropdownOptionsRelations = exports.dropdownOptions = exports.dropdowns = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.dropdowns = (0, mysql_core_1.mysqlTable)("dropdowns", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 200 }).notNull(),
    created_at: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.dropdownOptions = (0, mysql_core_1.mysqlTable)("dropdown_options", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    title: (0, mysql_core_1.varchar)("title", { length: 200 }).notNull(),
    dropdown_id: (0, mysql_core_1.int)("dropdown_id").notNull(),
    imgUrl: (0, mysql_core_1.text)("img_url"),
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    created_by: (0, mysql_core_1.varchar)("created_by", { length: 200 }).notNull(),
    created_at: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    isMenu: (0, mysql_core_1.boolean)("is_menu").default(false),
    menuPriority: (0, mysql_core_1.int)("menu_priority").default(0),
});
exports.dropdownOptionsRelations = (0, drizzle_orm_1.relations)(exports.dropdownOptions, ({ one }) => ({
    dropdown: one(exports.dropdowns, {
        fields: [exports.dropdownOptions.dropdown_id],
        references: [exports.dropdowns.id],
    }),
}));
