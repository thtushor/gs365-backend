"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.currencyConversionRelations = exports.currencyConversion = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
const currency_1 = require("./currency");
exports.currencyConversion = (0, mysql_core_1.mysqlTable)("currency_conversion", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    // example: "USD", "AFN", "BDT"
    fromCurrency: (0, mysql_core_1.int)("from_currency").notNull(),
    toCurrency: (0, mysql_core_1.int)("to_currency").notNull(),
    // conversion rate (1 unit of fromCurrency equals 'rate' of toCurrency)
    rate: (0, mysql_core_1.decimal)("rate", { precision: 10, scale: 2 }).notNull(),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
exports.currencyConversionRelations = (0, drizzle_orm_1.relations)(exports.currencyConversion, ({ one }) => ({
    from: one(currency_1.currencies, {
        fields: [exports.currencyConversion.fromCurrency],
        references: [currency_1.currencies.id],
    }),
    to: one(currency_1.currencies, {
        fields: [exports.currencyConversion.toCurrency],
        references: [currency_1.currencies.id],
    }),
}));
