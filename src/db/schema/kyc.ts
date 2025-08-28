import { relations, sql } from "drizzle-orm";
import {
  mysqlTable,
  serial,
  varchar,
  mysqlEnum,
  int,
  datetime,
} from "drizzle-orm/mysql-core";
import { adminUsers } from "./AdminUsers";
import { users } from "./users";

export const kyc = mysqlTable("kyc", {
  id: int("id").primaryKey().autoincrement(),
  documentType: varchar("document_type", { length: 150 }).notNull(),
  documentNo: varchar("document_no", { length: 150 }).notNull(),
  expiryDate: varchar("expiry_date", { length: 150 }).notNull(),
  documentFront: varchar("document_front", { length: 500 }).notNull(),
  documentBack: varchar("document_back", { length: 500 }).notNull(),
  selfie: varchar("selfie", { length: 500 }).notNull(),
  holderId: int("holder_id").notNull(),
  holderType: mysqlEnum("holder_type", [
    "player",
    "affiliate",
    "agent",
  ]).notNull(),
  status: mysqlEnum("status", ["approved", "rejected", "pending"]).default(
    "pending"
  ),
  created_at: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime("updated_at").default(
    sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`
  ),
});

export const kycRelations = relations(kyc, ({ one }) => ({
  user: one(users, { fields: [kyc.holderId], references: [users.id] }),
  adminUser: one(adminUsers, {
    fields: [kyc.holderId],
    references: [adminUsers.id],
  }),
}));
