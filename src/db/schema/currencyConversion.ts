import { relations, sql } from "drizzle-orm";
import {
  datetime,
  int,
  mysqlTable,
  varchar,
  decimal,
} from "drizzle-orm/mysql-core";
import { currencies } from "./currency";

export const currencyConversion = mysqlTable("currency_conversion", {
  id: int("id").primaryKey().autoincrement(),

  // example: "USD", "AFN", "BDT"
  fromCurrency: int("from_currency").notNull(),
  toCurrency: int("to_currency").notNull(),

  // conversion rate (1 unit of fromCurrency equals 'rate' of toCurrency)
  rate: decimal("rate", { precision: 10, scale: 2 }).notNull(),

  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),
});

export const currencyConversionRelations = relations(
  currencyConversion,
  ({ one }) => ({
    from: one(currencies, {
      fields: [currencyConversion.fromCurrency],
      references: [currencies.id],
    }),
    to: one(currencies, {
      fields: [currencyConversion.toCurrency],
      references: [currencies.id],
    }),
  })
);
