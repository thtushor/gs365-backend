import { mysqlTable, int, varchar, double, json } from "drizzle-orm/mysql-core";
import { ActivityStatus } from "./users";

export const paymentGateway = mysqlTable("payment_gateway", {
  id: int("id").primaryKey().autoincrement(),
  methodId: int("method_id").notNull(),
  paymentMethodTypeIds: json("payment_method_type_ids").notNull(), // array of numbers
  iconUrl: varchar("icon_url", { length: 255 }),
  minDeposit: double("min_deposit"),
  maxDeposit: double("max_deposit"),
  minWithdraw: double("min_withdraw"),
  maxWithdraw: double("max_withdraw"),
  bonus: double("bonus"),
  status: ActivityStatus.default("active"),
  countryId: int("country_code"),
  network: varchar("network", { length: 100 }),
  currencyConversionRate: double("currency_conversion_rate"),
  name: varchar("name", { length: 100 }).unique().notNull(),
});

export const NewPaymentGateway = paymentGateway.$inferInsert;
export const PaymentGateway = paymentGateway.$inferSelect;
