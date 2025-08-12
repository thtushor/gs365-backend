import { relations, sql } from "drizzle-orm";
import {
  datetime,
  int,
  mysqlEnum,
  mysqlTable,
  serial,
  varchar,
} from "drizzle-orm/mysql-core";

export const dropdowns = mysqlTable("dropdowns", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 200 }).notNull(),
  created_at: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const dropdownOptions = mysqlTable("dropdown_options", {
  id: int("id").primaryKey().autoincrement(),
  title: varchar("title", { length: 200 }).notNull(),
  dropdown_id: int("dropdown_id").notNull(),
  status: mysqlEnum("status", ["active", "inactive"]).default("inactive"),
  created_by: varchar("created_by", { length: 200 }).notNull(),
  created_at: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const dropdownOptionsRelations = relations(
  dropdownOptions,
  ({ one }) => ({
    dropdown: one(dropdowns, {
      fields: [dropdownOptions.dropdown_id],
      references: [dropdowns.id],
    }),
  })
);
