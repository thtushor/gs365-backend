"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminMainBalanceRelations = exports.adminMainBalance = exports.AdminMainBalanceStatus = exports.AdminMainBalanceType = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users");
const AdminUsers_1 = require("./AdminUsers");
const promotions_1 = require("./promotions");
const transactions_1 = require("./transactions");
const currency_1 = require("./currency");
exports.AdminMainBalanceType = (0, mysql_core_1.mysqlEnum)("admin_main_balance_type", [
    "admin_deposit",
    "player_deposit",
    "promotion",
    "spin_bonus",
    "player_withdraw",
    "admin_withdraw",
]);
exports.AdminMainBalanceStatus = (0, mysql_core_1.mysqlEnum)("admin_main_balance_status", [
    "approved",
    "pending",
    "rejected",
]);
exports.adminMainBalance = (0, mysql_core_1.mysqlTable)("admin_main_balance", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    amount: (0, mysql_core_1.decimal)("amount", { precision: 20, scale: 2 }).notNull(),
    type: exports.AdminMainBalanceType.notNull(),
    status: exports.AdminMainBalanceStatus.default("pending"),
    promotionId: (0, mysql_core_1.int)("promotion_id").references(() => promotions_1.promotions.id, {
        onDelete: "set null",
    }),
    transactionId: (0, mysql_core_1.int)("transaction_id").references(() => transactions_1.transactions.id, {
        onDelete: "set null",
    }),
    promotionName: (0, mysql_core_1.varchar)("promotion_name", { length: 300 }),
    currencyId: (0, mysql_core_1.int)("currency_id").references(() => currency_1.currencies.id, {
        onDelete: "cascade",
    }),
    createdByPlayer: (0, mysql_core_1.int)("created_by_player").references(() => users_1.users.id, {
        onDelete: "set null",
    }),
    createdByAdmin: (0, mysql_core_1.int)("created_by_admin").references(() => AdminUsers_1.adminUsers.id, {
        onDelete: "set null",
    }),
    notes: (0, mysql_core_1.text)("notes"),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
exports.adminMainBalanceRelations = (0, drizzle_orm_1.relations)(exports.adminMainBalance, ({ one }) => ({
    promotion: one(promotions_1.promotions, {
        fields: [exports.adminMainBalance.promotionId],
        references: [promotions_1.promotions.id],
    }),
    transaction: one(transactions_1.transactions, {
        fields: [exports.adminMainBalance.transactionId],
        references: [transactions_1.transactions.id],
    }),
    currency: one(currency_1.currencies, {
        fields: [exports.adminMainBalance.currencyId],
        references: [currency_1.currencies.id],
    }),
    createdByPlayerUser: one(users_1.users, {
        fields: [exports.adminMainBalance.createdByPlayer],
        references: [users_1.users.id],
    }),
    createdByAdminUser: one(AdminUsers_1.adminUsers, {
        fields: [exports.adminMainBalance.createdByAdmin],
        references: [AdminUsers_1.adminUsers.id],
    }),
}));
