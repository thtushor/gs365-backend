import {
  mysqlTable,
  int,
  varchar,
  text,
  boolean,
} from "drizzle-orm/mysql-core";
import { paymentGatewayProvider } from "./paymentGatewayProvider";
import { ActivityStatus } from "./users";

export const paymentGatewayProviderAccount = mysqlTable("gateway_accounts", {
  id: int("id").primaryKey().autoincrement(),
  paymentGatewayProviderId: int("provider_id")
    .notNull()
    .references(() => paymentGatewayProvider.id, { onDelete: "cascade" }),
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
  // Wallet-specific fields
  walletAddress: text("wallet_address"),
  network: varchar("network", { length: 50 }),
  // Status
  isPrimary: boolean("is_primary").default(false),
  isVerified: boolean("is_verified").default(false),
  status: ActivityStatus.default("active"),
});

export const NewPaymentGatewayProviderAccount =
  paymentGatewayProviderAccount.$inferInsert;
export const PaymentGatewayProviderAccount =
  paymentGatewayProviderAccount.$inferSelect;
