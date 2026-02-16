"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userPhonesRelations = exports.userPhones = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users");
exports.userPhones = (0, mysql_core_1.mysqlTable)("user_phones", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id").notNull().references(() => users_1.users.id, { onDelete: "cascade" }),
    phoneNumber: (0, mysql_core_1.varchar)("phone_number", { length: 32 }).notNull().unique(),
    isPrimary: (0, mysql_core_1.boolean)("is_primary").default(false),
    isVerified: (0, mysql_core_1.boolean)("is_verified").default(false),
    isSmsCapable: (0, mysql_core_1.boolean)("is_sms_capable").default(true),
    otp: (0, mysql_core_1.varchar)("otp", { length: 6 }),
    otp_expiry: (0, mysql_core_1.datetime)("otp_expiry"),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
}, (table) => ({
    userIdIdx: (0, mysql_core_1.index)("user_id_idx").on(table.userId),
    // phone_number is unique; no separate non-unique index needed
    isPrimaryIdx: (0, mysql_core_1.index)("is_primary_idx").on(table.isPrimary),
}));
exports.userPhonesRelations = (0, drizzle_orm_1.relations)(exports.userPhones, ({ one }) => ({
    user: one(users_1.users, {
        fields: [exports.userPhones.userId],
        references: [users_1.users.id],
    }),
}));
