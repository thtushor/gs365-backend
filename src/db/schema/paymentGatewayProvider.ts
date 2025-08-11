import { mysqlTable, int, varchar, uniqueIndex, text, double, boolean } from "drizzle-orm/mysql-core";
import { paymentGateway } from "./paymentGateway";
import { paymentProvider } from "./paymentProvider";
import { ActivityStatus } from "./users";

export const paymentGatewayProvider = mysqlTable(
  "payment_gateway_providers",
  {
    id: int("id").primaryKey().autoincrement(),
    gatewayId: int("gateway_id")
      .notNull()
      .references(() => paymentGateway.id, { onDelete: "cascade" }),
    providerId: int("provider_id")
      .notNull()
      .references(() => paymentProvider.id, { onDelete: "cascade" }),
    licenseKey: text("license_key"),
    commission: double("commission"),
    isRecommended: boolean("is_recommended"),
    priority: int("priority"),
    status: ActivityStatus.default("active"),
  },
  (table) => ({
    uniqueGatewayProvider: uniqueIndex("unique_gateway_provider").on(
      table.gatewayId,
      table.providerId
    ),
  })
);

export const NewPaymentGatewayProvider = paymentGatewayProvider.$inferInsert;
export const PaymentGatewayProvider = paymentGatewayProvider.$inferSelect;
