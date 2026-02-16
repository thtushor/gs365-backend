"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionsRelations = exports.transactions = exports.TransactionType = exports.TransactionStatus = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users");
const paymentGatewayProviderAccount_1 = require("./paymentGatewayProviderAccount");
const currency_1 = require("./currency");
const promotions_1 = require("./promotions");
const games_1 = require("./games");
const AdminUsers_1 = require("./AdminUsers");
const paymentGateway_1 = require("./paymentGateway");
exports.TransactionStatus = (0, mysql_core_1.mysqlEnum)("transaction_status", [
    "approved",
    "pending",
    "rejected",
]);
exports.TransactionType = (0, mysql_core_1.mysqlEnum)("transaction_type", [
    "deposit",
    "withdraw",
    "win",
    "loss",
    "spin_bonus",
]);
exports.transactions = (0, mysql_core_1.mysqlTable)("transactions", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id").references(() => users_1.users.id, { onDelete: "cascade" }),
    affiliateId: (0, mysql_core_1.int)("affiliate_id").references(() => AdminUsers_1.adminUsers.id, {
        onDelete: "cascade",
    }),
    type: exports.TransactionType.notNull(),
    amount: (0, mysql_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    bonusAmount: (0, mysql_core_1.decimal)("bonus_amount", { precision: 10, scale: 2 }).default("0"),
    conversionRate: (0, mysql_core_1.decimal)("conversion_rate").default("100"),
    currencyId: (0, mysql_core_1.int)("currency_id")
        .notNull()
        .references(() => currency_1.currencies.id, { onDelete: "cascade" }),
    promotionId: (0, mysql_core_1.int)("promotion_id").references(() => promotions_1.promotions.id, {
        onDelete: "cascade",
    }),
    gameId: (0, mysql_core_1.int)("game_id").references(() => {
        return games_1.games.id;
    }, {
        onDelete: "cascade",
    }),
    status: exports.TransactionStatus.default("pending"),
    customTransactionId: (0, mysql_core_1.varchar)("custom_transaction_id", {
        length: 100,
    }).unique(),
    givenTransactionId: (0, mysql_core_1.varchar)("given_transaction_id", { length: 100 }),
    attachment: (0, mysql_core_1.text)("attachment"),
    notes: (0, mysql_core_1.text)("notes"),
    // currencyConversionRate: decimal("currency_conversion_rate"),
    paymentGatewayProviderAccountId: (0, mysql_core_1.int)("provider_account_id").references(() => paymentGatewayProviderAccount_1.paymentGatewayProviderAccount.id, {
        onDelete: "cascade",
    }),
    paymentGatewayId: (0, mysql_core_1.int)("gateWayId").references(() => paymentGateway_1.paymentGateway.id, {
        onDelete: "cascade",
    }),
    // Bank-specific fields
    accountNumber: (0, mysql_core_1.varchar)("account_number", { length: 100 }),
    accountHolderName: (0, mysql_core_1.varchar)("account_holder_name", { length: 100 }),
    bankName: (0, mysql_core_1.varchar)("bank_name", { length: 100 }),
    branchName: (0, mysql_core_1.varchar)("branch_name", { length: 100 }),
    branchAddress: (0, mysql_core_1.varchar)("branch_address", { length: 255 }),
    swiftCode: (0, mysql_core_1.varchar)("swift_code", { length: 50 }),
    iban: (0, mysql_core_1.varchar)("iban", { length: 100 }),
    // Wallet-specific fields
    walletAddress: (0, mysql_core_1.text)("wallet_address"),
    network: (0, mysql_core_1.varchar)("network", { length: 50 }),
    processedBy: (0, mysql_core_1.int)("processed_by"),
    processedByUser: (0, mysql_core_1.int)("processedByUser"),
    processedAt: (0, mysql_core_1.datetime)("processed_at"),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
exports.transactionsRelations = (0, drizzle_orm_1.relations)(exports.transactions, ({ one }) => ({
    user: one(users_1.users, {
        fields: [exports.transactions.userId],
        references: [users_1.users.id],
    }),
    affiliate: one(AdminUsers_1.adminUsers, {
        fields: [exports.transactions.affiliateId],
        references: [AdminUsers_1.adminUsers.id],
    }),
    currency: one(currency_1.currencies, {
        fields: [exports.transactions.currencyId],
        references: [currency_1.currencies.id],
    }),
    promotion: one(promotions_1.promotions, {
        fields: [exports.transactions.promotionId],
        references: [promotions_1.promotions.id],
    }),
    paymentGatewayProviderAccount: one(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount, {
        fields: [exports.transactions.paymentGatewayProviderAccountId],
        references: [paymentGatewayProviderAccount_1.paymentGatewayProviderAccount.id],
    }),
}));
