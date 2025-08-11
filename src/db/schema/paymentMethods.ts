import { mysqlTable, int, varchar, mysqlEnum } from "drizzle-orm/mysql-core";
import { ActivityStatus } from "./users";

export const paymentMethods = mysqlTable("payment_methods", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).unique(),
  status: ActivityStatus.default("active"),
});

export const PaymentMethods = paymentMethods.$inferInsert;
