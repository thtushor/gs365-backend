import {
  mysqlTable,
  serial,
  varchar,
  int,
  boolean,
  text,
  mysqlEnum,
  datetime,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { currencies } from "./currency";

export const accountTypes = mysqlTable("account_types", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 50 }).notNull().unique(), // e.g., wallet, bank, crypto
  description: varchar("description", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  created_at: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const accounts = mysqlTable("accounts", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id").notNull(),
  currency_id: int("currency_id").notNull(),
  account_type_id: int("account_type_id").notNull(),
  name: varchar("name", { length: 100 }),
  account_number: varchar("account_number", { length: 100 }),
  holder_name: varchar("holder_name", { length: 100 }),
  provider: varchar("provider", { length: 100 }),
  address: varchar("address", { length: 255 }),
  swift_code: varchar("swift_code", { length: 50 }),
  iban: varchar("iban", { length: 100 }),
  wallet_address: text("wallet_address"),
  network: varchar("network", { length: 50 }),
  is_primary: boolean("is_primary").default(false),
  is_verified: boolean("is_verified").default(false),
  status: mysqlEnum("status", ["active", "inactive"]).default("active"),
  created_at: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.user_id],
    references: [users.id],
  }),
  currency: one(currencies, {
    fields: [accounts.currency_id],
    references: [currencies.id],
  }),
  accountType: one(accountTypes, {
    fields: [accounts.account_type_id],
    references: [accountTypes.id],
  }),
}));
