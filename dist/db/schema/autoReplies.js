"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.autoReplies = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.autoReplies = (0, mysql_core_1.mysqlTable)("auto_replies", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    keyword: (0, mysql_core_1.varchar)("keyword", { length: 255 }).notNull().unique(),
    replyMessage: (0, mysql_core_1.text)("reply_message").notNull(),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
