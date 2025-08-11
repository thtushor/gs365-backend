import { mysqlTable, int, varchar, text } from "drizzle-orm/mysql-core";
import { ActivityStatus } from "./users";

export const paymentProvider = mysqlTable("payment_provider", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  contactInfo: text("contact_info"),
  commissionPercentage: int("commission_percentage").default(0),
  status: ActivityStatus.default("active"),
});

export const NewPaymentProvider = paymentProvider.$inferInsert;
export const PaymentProvider = paymentProvider.$inferSelect;
