import { mysqlTable, serial, varchar, mysqlEnum, int } from "drizzle-orm/mysql-core";

export const languages = mysqlTable("languages", {
  id: int("id").primaryKey().autoincrement(),
  code: varchar("code", { length: 10 }),
  name: varchar("name", { length: 100 }).notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
});
