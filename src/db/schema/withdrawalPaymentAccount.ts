import { mysqlTable, varchar, int, timestamp, text, boolean, index } from "drizzle-orm/mysql-core";
import { users } from "./users";
import { paymentGateway } from "./paymentGateway";
import { relations } from "drizzle-orm";

export const withdrawalPaymentAccounts = mysqlTable(
  "withdrawal_payment_accounts",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull(),
    paymentGatewayId: int("gateway_id")
      .references(() => paymentGateway.id, { onDelete: "cascade" }),
    // Common fields
    accountNumber: varchar("account_number", { length: 100 }),
    holderName: varchar("holder_name", { length: 100 }),
    provider: varchar("provider", { length: 100 }),
    // Bank-specific fields
    bankName: varchar("bank_name", { length: 100 }),
    branchName: varchar("branch_name", { length: 100 }),
    branchAddress: varchar("branch_address", { length: 255 }),
    swiftCode: varchar("swift_code", { length: 50 }),
    iban: varchar("iban", { length: 100 }),
    routingNumber: varchar("routing_number", { length: 50 }),
    // Wallet-specific fields
    walletAddress: text("wallet_address"),
    network: varchar("network", { length: 50 }),
    // Account holder details
    accountHolderPhone: varchar("account_holder_phone", { length: 50 }),
    accountHolderEmail: varchar("account_holder_email", { length: 255 }),
    country: varchar("country", { length: 100 }),
    state: varchar("state", { length: 100 }),
    city: varchar("city", { length: 100 }),
    address: text("address"),
    postalCode: varchar("postal_code", { length: 20 }),
    // Status and verification
    isPrimary: boolean("is_primary").default(false),
    isVerified: boolean("is_verified").default(false),
    isActive: boolean("is_active").default(true),
    verificationStatus: varchar("verification_status", { length: 50 }).default("pending"),
    verificationNotes: text("verification_notes"),
    // Withdrawal limits and fees
    minWithdrawalAmount: varchar("min_withdrawal_amount", { length: 50 }),
    maxWithdrawalAmount: varchar("max_withdrawal_amount", { length: 50 }),
    withdrawalFee: varchar("withdrawal_fee", { length: 50 }),
    processingTime: varchar("processing_time", { length: 100 }),
    // Additional information
    additionalInfo: text("additional_info"),
    createdBy: varchar("created_by", { length: 100 }),
    updatedBy: varchar("updated_by", { length: 100 }),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    paymentGatewayIdIdx: index("payment_gateway_id_idx").on(table.paymentGatewayId),
    isActiveIdx: index("is_active_idx").on(table.isActive),
    verificationStatusIdx: index("verification_status_idx").on(table.verificationStatus),
    isPrimaryIdx: index("is_primary_idx").on(table.isPrimary),
  })
);

// Relations
export const withdrawalPaymentAccountsRelations = relations(
  withdrawalPaymentAccounts,
  ({ one }) => ({
    user: one(users, {
      fields: [withdrawalPaymentAccounts.userId],
      references: [users.id],
    }),
    paymentGateway: one(paymentGateway, {
      fields: [withdrawalPaymentAccounts.paymentGatewayId],
      references: [paymentGateway.id],
    }),
  })
);

export type WithdrawalPaymentAccount = typeof withdrawalPaymentAccounts.$inferSelect;
export type NewWithdrawalPaymentAccount = typeof withdrawalPaymentAccounts.$inferInsert;
