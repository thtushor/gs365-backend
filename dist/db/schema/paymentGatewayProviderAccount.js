"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayProviderAccount = exports.NewPaymentGatewayProviderAccount = exports.paymentGatewayProviderAccount = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const paymentGatewayProvider_1 = require("./paymentGatewayProvider");
const users_1 = require("./users");
exports.paymentGatewayProviderAccount = (0, mysql_core_1.mysqlTable)("gateway_accounts", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    paymentGatewayProviderId: (0, mysql_core_1.int)("provider_id")
        .notNull()
        .references(() => paymentGatewayProvider_1.paymentGatewayProvider.id, { onDelete: "cascade" }),
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
    // Wallet-specific fields
    walletAddress: (0, mysql_core_1.text)("wallet_address"),
    network: (0, mysql_core_1.varchar)("network", { length: 50 }),
    // Status
    isPrimary: (0, mysql_core_1.boolean)("is_primary").default(false),
    isVerified: (0, mysql_core_1.boolean)("is_verified").default(false),
    status: users_1.ActivityStatus.default("active"),
});
exports.NewPaymentGatewayProviderAccount = exports.paymentGatewayProviderAccount.$inferInsert;
exports.PaymentGatewayProviderAccount = exports.paymentGatewayProviderAccount.$inferSelect;
