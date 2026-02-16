"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayProvider = exports.NewPaymentGatewayProvider = exports.paymentGatewayProvider = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const paymentGateway_1 = require("./paymentGateway");
const paymentProvider_1 = require("./paymentProvider");
const users_1 = require("./users");
exports.paymentGatewayProvider = (0, mysql_core_1.mysqlTable)("payment_gateway_providers", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    gatewayId: (0, mysql_core_1.int)("gateway_id")
        .notNull()
        .references(() => paymentGateway_1.paymentGateway.id, { onDelete: "cascade" }),
    providerId: (0, mysql_core_1.int)("provider_id")
        .notNull()
        .references(() => paymentProvider_1.paymentProvider.id, { onDelete: "cascade" }),
    licenseKey: (0, mysql_core_1.text)("license_key"),
    commission: (0, mysql_core_1.double)("commission"),
    isRecommended: (0, mysql_core_1.boolean)("is_recommended"),
    priority: (0, mysql_core_1.int)("priority"),
    status: users_1.ActivityStatus.default("active"),
}, (table) => ({
    uniqueGatewayProvider: (0, mysql_core_1.uniqueIndex)("unique_gateway_provider").on(table.gatewayId, table.providerId),
}));
exports.NewPaymentGatewayProvider = exports.paymentGatewayProvider.$inferInsert;
exports.PaymentGatewayProvider = exports.paymentGatewayProvider.$inferSelect;
