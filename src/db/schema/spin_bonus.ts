import {
  mysqlTable,
  int,
  decimal,
  datetime,
  varchar,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users"; // assuming you have users table
import { transactions } from "./transactions";

export const spinBonus = mysqlTable("spin_bonus", {
  id: int("id").primaryKey().autoincrement(),

  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  conversionRate: decimal("conversion_rate").default("100"),

  transactionId: varchar("transaction_id", { length: 100 }).references(
    () => transactions.id,
    {
      onDelete: "set null",
    },
  ),

  // Usually 1–100× — how many times the bonus must be turned over
  turnoverMultiply: decimal("turnover_multiply", { precision: 10, scale: 2 })
    .notNull()
    .default("1.00"),

  createdAt: datetime("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const spinBonusRelations = relations(spinBonus, ({ one }) => ({
  user: one(users, {
    fields: [spinBonus.userId],
    references: [users.id],
  }),
  transaction: one(transactions, {
    fields: [spinBonus.transactionId],
    references: [transactions.id],
  }),
}));

export type SpinBonus = typeof spinBonus.$inferSelect;
export type NewSpinBonus = typeof spinBonus.$inferInsert;
