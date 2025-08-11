import {
  mysqlTable,
  serial,
  varchar,
  int,
  mysqlEnum,
  text,
} from "drizzle-orm/mysql-core";

export const countries = mysqlTable("countries", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 100 }).notNull(),
  flagUrl: text("flag_url"),
  code: varchar("country_code", { length: 50 }),
  currencyId: int("currency_id"),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
});

export type NewCountry = typeof countries.$inferInsert;
export type Country = typeof countries.$inferSelect;
