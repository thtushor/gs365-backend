import {
  mysqlTable,
  int,
  varchar,
  decimal,
  text,
  datetime,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { adminUsers } from "./AdminUsers";
import { promotions } from "./promotions";
import { transactions } from "./transactions";
import { currencies } from "./currency";

export const AdminMainBalanceType = mysqlEnum("admin_main_balance_type", [
  "admin_deposit",
  "player_deposit", 
  "promotion",
  "player_withdraw",
  "admin_withdraw",
]);

export const adminMainBalance = mysqlTable("admin_main_balance", {
  id: int("id").primaryKey().autoincrement(),
  amount: decimal("amount", { precision: 20, scale: 2 }).notNull(),
  type: AdminMainBalanceType.notNull(),
  promotionId: int("promotion_id").references(() => promotions.id, {
    onDelete: "set null",
  }),
  transactionId: int("transaction_id").references(() => transactions.id, {
    onDelete: "set null",
  }),
  promotionName: varchar("promotion_name", { length: 300 }),
  currencyId: int("currency_id").references(() => currencies.id, { onDelete: "cascade" }),
  createdByPlayer: int("created_by_player").references(() => users.id, {
    onDelete: "set null",
  }),
  createdByAdmin: int("created_by_admin").references(() => adminUsers.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),
});

export const adminMainBalanceRelations = relations(adminMainBalance, ({ one }) => ({
  promotion: one(promotions, {
    fields: [adminMainBalance.promotionId],
    references: [promotions.id],
  }),
  transaction: one(transactions, {
    fields: [adminMainBalance.transactionId],
    references: [transactions.id],
  }),
  currency: one(currencies, {
    fields: [adminMainBalance.currencyId],
    references: [currencies.id],
  }),
  createdByPlayerUser: one(users, {
    fields: [adminMainBalance.createdByPlayer],
    references: [users.id],
  }),
  createdByAdminUser: one(adminUsers, {
    fields: [adminMainBalance.createdByAdmin],
    references: [adminUsers.id],
  }),
}));

export type AdminMainBalance = typeof adminMainBalance.$inferSelect;
export type NewAdminMainBalance = typeof adminMainBalance.$inferInsert;
