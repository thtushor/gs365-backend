"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProvider = exports.NewPaymentProvider = exports.paymentProvider = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const users_1 = require("./users");
exports.paymentProvider = (0, mysql_core_1.mysqlTable)("payment_provider", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).unique().notNull(),
    contactInfo: (0, mysql_core_1.text)("contact_info"),
    commissionPercentage: (0, mysql_core_1.int)("commission_percentage").default(0),
    status: users_1.ActivityStatus.default("active"),
});
exports.NewPaymentProvider = exports.paymentProvider.$inferInsert;
exports.PaymentProvider = exports.paymentProvider.$inferSelect;
