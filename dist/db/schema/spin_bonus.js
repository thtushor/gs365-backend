"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spinBonusRelations = exports.spinBonus = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users"); // assuming you have users table
const transactions_1 = require("./transactions");
exports.spinBonus = (0, mysql_core_1.mysqlTable)("spin_bonus", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id")
        .notNull()
        .references(() => users_1.users.id, { onDelete: "cascade" }),
    amount: (0, mysql_core_1.decimal)("amount", { precision: 18, scale: 2 }).notNull(),
    conversionRate: (0, mysql_core_1.decimal)("conversion_rate").default("100"),
    transactionId: (0, mysql_core_1.int)("transaction_id").references(() => transactions_1.transactions.id, {
        onDelete: "set null",
    }),
    // Usually 1–100× — how many times the bonus must be turned over
    turnoverMultiply: (0, mysql_core_1.decimal)("turnover_multiply", { precision: 10, scale: 2 })
        .notNull()
        .default("1.00"),
    createdAt: (0, mysql_core_1.datetime)("created_at")
        .notNull()
        .default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.spinBonusRelations = (0, drizzle_orm_1.relations)(exports.spinBonus, ({ one }) => ({
    user: one(users_1.users, {
        fields: [exports.spinBonus.userId],
        references: [users_1.users.id],
    }),
    transaction: one(transactions_1.transactions, {
        fields: [exports.spinBonus.transactionId],
        references: [transactions_1.transactions.id],
    }),
}));
