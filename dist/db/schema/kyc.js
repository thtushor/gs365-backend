"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.kycRelations = exports.kyc = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
const AdminUsers_1 = require("./AdminUsers");
const users_1 = require("./users");
exports.kyc = (0, mysql_core_1.mysqlTable)("kyc", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    documentType: (0, mysql_core_1.varchar)("document_type", { length: 150 }).notNull(),
    fullName: (0, mysql_core_1.varchar)("full_name", { length: 150 }).notNull(),
    documentNo: (0, mysql_core_1.varchar)("document_no", { length: 150 }).notNull(),
    expiryDate: (0, mysql_core_1.varchar)("expiry_date", { length: 150 }).notNull(),
    dob: (0, mysql_core_1.varchar)("dob", { length: 150 }).notNull(),
    documentFront: (0, mysql_core_1.varchar)("document_front", { length: 500 }).notNull(),
    documentBack: (0, mysql_core_1.varchar)("document_back", { length: 500 }).notNull(),
    selfie: (0, mysql_core_1.varchar)("selfie", { length: 500 }).notNull(),
    holderId: (0, mysql_core_1.int)("holder_id").notNull(),
    holderType: (0, mysql_core_1.mysqlEnum)("holder_type", [
        "player",
        "affiliate",
        "agent",
    ]).notNull(),
    status: (0, mysql_core_1.mysqlEnum)("status", ["approved", "rejected", "pending"]).default("pending"),
    created_at: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updated_at: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
exports.kycRelations = (0, drizzle_orm_1.relations)(exports.kyc, ({ one }) => ({
    user: one(users_1.users, { fields: [exports.kyc.holderId], references: [users_1.users.id] }),
    adminUser: one(AdminUsers_1.adminUsers, {
        fields: [exports.kyc.holderId],
        references: [AdminUsers_1.adminUsers.id],
    }),
}));
