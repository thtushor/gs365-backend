import { mysqlTable, serial, varchar, mysqlEnum, int } from "drizzle-orm/mysql-core";

export const currencies = mysqlTable("currencies", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  symbol: varchar("symbol", { length: 5 }),
  symbol_native: varchar("symbol_native", { length: 5 }),
  name: varchar("name", { length: 50 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
});
