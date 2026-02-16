"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.turnoverRelations = exports.turnover = exports.TurnoverStatus = exports.TurnoverType = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users");
const transactions_1 = require("./transactions");
exports.TurnoverType = (0, mysql_core_1.mysqlEnum)("turnover_type", [
    "default",
    "promotion",
    "spin_bonus",
]);
exports.TurnoverStatus = (0, mysql_core_1.mysqlEnum)("turnover_status", [
    "active",
    "inactive",
    "completed",
]);
exports.turnover = (0, mysql_core_1.mysqlTable)("turnover", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id")
        .notNull()
        .references(() => users_1.users.id, { onDelete: "cascade" }),
    transactionId: (0, mysql_core_1.int)("transaction_id").references(() => transactions_1.transactions.id, {
        onDelete: "cascade",
    }),
    type: exports.TurnoverType.default("default"),
    status: exports.TurnoverStatus.default("active"),
    turnoverName: (0, mysql_core_1.varchar)("turnover_name", { length: 300 }).notNull(),
    depositAmount: (0, mysql_core_1.decimal)("deposit_amount", {
        precision: 20,
        scale: 2,
    }),
    targetTurnover: (0, mysql_core_1.decimal)("target_turnover", {
        precision: 20,
        scale: 2,
    }).notNull(),
    remainingTurnover: (0, mysql_core_1.decimal)("remaining_turnover", {
        precision: 20,
        scale: 2,
    }).notNull(),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
exports.turnoverRelations = (0, drizzle_orm_1.relations)(exports.turnover, ({ one }) => ({
    user: one(users_1.users, {
        fields: [exports.turnover.userId],
        references: [users_1.users.id],
    }),
    transaction: one(transactions_1.transactions, {
        fields: [exports.turnover.transactionId],
        references: [transactions_1.transactions.id],
    }),
}));
