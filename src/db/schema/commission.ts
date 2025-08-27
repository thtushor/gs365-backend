import { sql } from "drizzle-orm";
import {
  int,
  decimal,
  datetime,
  mysqlTable,
  varchar,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { betResults } from "./betResults";
import { adminUsers } from "./AdminUsers";
import { users } from "./users";

export const commission = mysqlTable("commission", {
  id: int("id").primaryKey().autoincrement(),

  // Reference to bet result
  betResultId: int("bet_result_id").notNull(),

  // Player who made the bet
  playerId: int("player_id").notNull(),

  // Admin user who gets the commission
  adminUserId: int("admin_user_id").notNull(),

  // Commission details
  commissionAmount: decimal("commission_amount", {
    precision: 20,
    scale: 2,
  }).default("0"),
  percentage: decimal("percentage", { precision: 5, scale: 2 }).default("0"),

  // Commission status
  status: mysqlEnum("status", [
    "pending",
    "approved",
    "rejected",
    "paid",
    "settled",
  ]).default("pending"),

  // Additional tracking
  notes: varchar("notes", { length: 500 }),

  // Audit fields
  createdBy: varchar("created_by", { length: 200 }),
  updatedBy: varchar("updated_by", { length: 200 }),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),
});

// Relations
export const commissionRelations = relations(commission, ({ one }) => ({
  betResult: one(betResults, {
    fields: [commission.betResultId],
    references: [betResults.id],
  }),
  player: one(users, {
    fields: [commission.playerId],
    references: [users.id],
  }),
  adminUser: one(adminUsers, {
    fields: [commission.adminUserId],
    references: [adminUsers.id],
  }),
}));
