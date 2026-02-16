"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionRelations = exports.commission = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_2 = require("drizzle-orm");
const betResults_1 = require("./betResults");
const AdminUsers_1 = require("./AdminUsers");
const users_1 = require("./users");
exports.commission = (0, mysql_core_1.mysqlTable)("commission", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    // Reference to bet result
    betResultId: (0, mysql_core_1.int)("bet_result_id").notNull(),
    // Player who made the bet
    playerId: (0, mysql_core_1.int)("player_id").notNull(),
    // Admin user who gets the commission
    adminUserId: (0, mysql_core_1.int)("admin_user_id").notNull(),
    // Commission details
    commissionAmount: (0, mysql_core_1.decimal)("commission_amount", {
        precision: 20,
        scale: 2,
    }).default("0"),
    percentage: (0, mysql_core_1.decimal)("percentage", { precision: 5, scale: 2 }).default("0"),
    // Commission status
    status: (0, mysql_core_1.mysqlEnum)("status", [
        "pending",
        "approved",
        "rejected",
        "paid",
        "settled",
    ]).default("pending"),
    // Additional tracking
    notes: (0, mysql_core_1.varchar)("notes", { length: 500 }),
    // Audit fields
    createdBy: (0, mysql_core_1.varchar)("created_by", { length: 200 }),
    updatedBy: (0, mysql_core_1.varchar)("updated_by", { length: 200 }),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
// Relations
exports.commissionRelations = (0, drizzle_orm_2.relations)(exports.commission, ({ one }) => ({
    betResult: one(betResults_1.betResults, {
        fields: [exports.commission.betResultId],
        references: [betResults_1.betResults.id],
    }),
    player: one(users_1.users, {
        fields: [exports.commission.playerId],
        references: [users_1.users.id],
    }),
    adminUser: one(AdminUsers_1.adminUsers, {
        fields: [exports.commission.adminUserId],
        references: [AdminUsers_1.adminUsers.id],
    }),
}));
