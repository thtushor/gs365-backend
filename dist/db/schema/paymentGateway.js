"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGateway = exports.NewPaymentGateway = exports.paymentGateway = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const users_1 = require("./users");
exports.paymentGateway = (0, mysql_core_1.mysqlTable)("payment_gateway", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    methodId: (0, mysql_core_1.int)("method_id").notNull(),
    paymentMethodTypeIds: (0, mysql_core_1.json)("payment_method_type_ids").notNull(), // array of numbers
    iconUrl: (0, mysql_core_1.varchar)("icon_url", { length: 255 }),
    minDeposit: (0, mysql_core_1.double)("min_deposit"),
    maxDeposit: (0, mysql_core_1.double)("max_deposit"),
    minWithdraw: (0, mysql_core_1.double)("min_withdraw"),
    maxWithdraw: (0, mysql_core_1.double)("max_withdraw"),
    bonus: (0, mysql_core_1.double)("bonus"),
    status: users_1.ActivityStatus.default("active"),
    // statusDeposit: ActivityStatus.default("active"),
    countryId: (0, mysql_core_1.int)("country_code"),
    network: (0, mysql_core_1.varchar)("network", { length: 100 }),
    currencyConversionRate: (0, mysql_core_1.double)("currency_conversion_rate"),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).unique().notNull(),
});
exports.NewPaymentGateway = exports.paymentGateway.$inferInsert;
exports.PaymentGateway = exports.paymentGateway.$inferSelect;
