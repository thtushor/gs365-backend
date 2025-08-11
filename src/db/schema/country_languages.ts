import { mysqlTable, int, mysqlEnum, serial } from "drizzle-orm/mysql-core";

export const countryLanguages = mysqlTable(
  "country_languages",
  {
    id: int("id").primaryKey().autoincrement(),
    countryId: int("country_id").notNull(),
    languageId: int("language_id").notNull(),
    status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  },
  (table) => ({
    unique: [table.countryId, table.languageId],
  })
);
