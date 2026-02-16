"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.user_favorites = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.user_favorites = (0, mysql_core_1.mysqlTable)("user_favorites", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    gameId: (0, mysql_core_1.int)("game_id").notNull(),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
