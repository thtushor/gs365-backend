"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodTypes = exports.PaymentMethodRelationships = exports.paymentMethodTypes = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
const paymentMethods_1 = require("./paymentMethods");
const users_1 = require("./users");
exports.paymentMethodTypes = (0, mysql_core_1.mysqlTable)("payment_methods_types", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    name: (0, mysql_core_1.varchar)("name", { length: 100 }).unique(),
    paymentMethodId: (0, mysql_core_1.int)("payment_method_id").notNull(),
    status: users_1.ActivityStatus.default("active"),
});
exports.PaymentMethodRelationships = (0, drizzle_orm_1.relations)(exports.paymentMethodTypes, ({ one }) => ({
    paymentMethod: one(paymentMethods_1.paymentMethods, {
        fields: [exports.paymentMethodTypes.paymentMethodId],
        references: [paymentMethods_1.paymentMethods.id],
    }),
}));
exports.PaymentMethodTypes = exports.paymentMethodTypes.$inferInsert;
