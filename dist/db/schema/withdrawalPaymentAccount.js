"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withdrawalPaymentAccountsRelations = exports.withdrawalPaymentAccounts = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const users_1 = require("./users");
const paymentGateway_1 = require("./paymentGateway");
const drizzle_orm_1 = require("drizzle-orm");
exports.withdrawalPaymentAccounts = (0, mysql_core_1.mysqlTable)("withdrawal_payment_accounts", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    paymentGatewayId: (0, mysql_core_1.int)("gateway_id")
        .references(() => paymentGateway_1.paymentGateway.id, { onDelete: "cascade" }),
    // Common fields
    accountNumber: (0, mysql_core_1.varchar)("account_number", { length: 100 }),
    holderName: (0, mysql_core_1.varchar)("holder_name", { length: 100 }),
    provider: (0, mysql_core_1.varchar)("provider", { length: 100 }),
    // Bank-specific fields
    bankName: (0, mysql_core_1.varchar)("bank_name", { length: 100 }),
    branchName: (0, mysql_core_1.varchar)("branch_name", { length: 100 }),
    branchAddress: (0, mysql_core_1.varchar)("branch_address", { length: 255 }),
    swiftCode: (0, mysql_core_1.varchar)("swift_code", { length: 50 }),
    iban: (0, mysql_core_1.varchar)("iban", { length: 100 }),
    routingNumber: (0, mysql_core_1.varchar)("routing_number", { length: 50 }),
    // Wallet-specific fields
    walletAddress: (0, mysql_core_1.text)("wallet_address"),
    network: (0, mysql_core_1.varchar)("network", { length: 50 }),
    // Account holder details
    accountHolderPhone: (0, mysql_core_1.varchar)("account_holder_phone", { length: 50 }),
    accountHolderEmail: (0, mysql_core_1.varchar)("account_holder_email", { length: 255 }),
    country: (0, mysql_core_1.varchar)("country", { length: 100 }),
    state: (0, mysql_core_1.varchar)("state", { length: 100 }),
    city: (0, mysql_core_1.varchar)("city", { length: 100 }),
    address: (0, mysql_core_1.text)("address"),
    postalCode: (0, mysql_core_1.varchar)("postal_code", { length: 20 }),
    // Status and verification
    isPrimary: (0, mysql_core_1.boolean)("is_primary").default(false),
    isVerified: (0, mysql_core_1.boolean)("is_verified").default(false),
    isActive: (0, mysql_core_1.boolean)("is_active").default(true),
    verificationStatus: (0, mysql_core_1.varchar)("verification_status", { length: 50 }).default("pending"),
    verificationNotes: (0, mysql_core_1.text)("verification_notes"),
    // Withdrawal limits and fees
    minWithdrawalAmount: (0, mysql_core_1.varchar)("min_withdrawal_amount", { length: 50 }),
    maxWithdrawalAmount: (0, mysql_core_1.varchar)("max_withdrawal_amount", { length: 50 }),
    withdrawalFee: (0, mysql_core_1.varchar)("withdrawal_fee", { length: 50 }),
    processingTime: (0, mysql_core_1.varchar)("processing_time", { length: 100 }),
    // Additional information
    additionalInfo: (0, mysql_core_1.text)("additional_info"),
    createdBy: (0, mysql_core_1.varchar)("created_by", { length: 100 }),
    updatedBy: (0, mysql_core_1.varchar)("updated_by", { length: 100 }),
    createdAt: (0, mysql_core_1.timestamp)("created_at").defaultNow(),
    updatedAt: (0, mysql_core_1.timestamp)("updated_at").defaultNow().onUpdateNow(),
}, (table) => ({
    userIdIdx: (0, mysql_core_1.index)("user_id_idx").on(table.userId),
    paymentGatewayIdIdx: (0, mysql_core_1.index)("payment_gateway_id_idx").on(table.paymentGatewayId),
    isActiveIdx: (0, mysql_core_1.index)("is_active_idx").on(table.isActive),
    verificationStatusIdx: (0, mysql_core_1.index)("verification_status_idx").on(table.verificationStatus),
    isPrimaryIdx: (0, mysql_core_1.index)("is_primary_idx").on(table.isPrimary),
}));
// Relations
exports.withdrawalPaymentAccountsRelations = (0, drizzle_orm_1.relations)(exports.withdrawalPaymentAccounts, ({ one }) => ({
    user: one(users_1.users, {
        fields: [exports.withdrawalPaymentAccounts.userId],
        references: [users_1.users.id],
    }),
    paymentGateway: one(paymentGateway_1.paymentGateway, {
        fields: [exports.withdrawalPaymentAccounts.paymentGatewayId],
        references: [paymentGateway_1.paymentGateway.id],
    }),
}));
