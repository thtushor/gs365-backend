import {
  mysqlTable,
  int,
  varchar,
  decimal,
  datetime,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import { users } from "./users";
import { transactions } from "./transactions";

export const TurnoverType = mysqlEnum("turnover_type", [
  "default",
  "promotion",
]);

export const TurnoverStatus = mysqlEnum("turnover_status", ["active", "inactive","completed"]);

export const turnover = mysqlTable("turnover", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  transactionId: int("transaction_id").references(() => transactions.id, {
    onDelete: "set null",
  }),
  type: TurnoverType.default("default"),
  status: TurnoverStatus.default("active"),
  turnoverName: varchar("turnover_name", { length: 300 }).notNull(),
  targetTurnover: decimal("target_turnover", {
    precision: 20,
    scale: 2,
  }).notNull(),
  remainingTurnover: decimal("remaining_turnover", {
    precision: 20,
    scale: 2,
  }).notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),
});

export const turnoverRelations = relations(turnover, ({ one }) => ({
  user: one(users, {
    fields: [turnover.userId],
    references: [users.id],
  }),
  transaction: one(transactions, {
    fields: [turnover.transactionId],
    references: [transactions.id],
  }),
}));

export type Turnover = typeof turnover.$inferSelect;
export type NewTurnover = typeof turnover.$inferInsert;
