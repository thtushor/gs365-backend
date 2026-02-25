import {
  mysqlTable,
  bigint,
  varchar,
  text,
  timestamp,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Vexora Pay-in (Deposit / Checkout)
 */
export const vexoraPayins = mysqlTable("vexora_payins", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  tradeNo: varchar("trade_no", { length: 64 }).notNull(),
  platFormTradeNo: varchar("platform_trade_no", { length: 64 }),

  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),
  wayCode: varchar("way_code", { length: 32 }).notNull(),

  status: varchar("status", { length: 32 }).notNull(), // 0000 / 0015 / etc

  paymentLink: text("payment_link"),
  remark: varchar("remark", { length: 255 }),

  rawResponse: json("raw_response"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

/**
 * Vexora Pay-out (Disbursement)
 */
export const vexoraPayouts = mysqlTable("vexora_payouts", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  tradeNo: varchar("trade_no", { length: 64 }).notNull(),
  platFormTradeNo: varchar("platform_trade_no", { length: 64 }),

  walletId: varchar("wallet_id", { length: 32 }).notNull(),
  wayCode: varchar("way_code", { length: 32 }).notNull(),

  amount: decimal("amount", { precision: 18, scale: 2 }).notNull(),

  status: varchar("status", { length: 32 }).notNull(),
  remark: varchar("remark", { length: 255 }),

  rawResponse: json("raw_response"),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});

/**
 * Vexora Webhook Logs
 */
export const vexoraWebhooks = mysqlTable("vexora_webhooks", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),

  tradeNo: varchar("trade_no", { length: 64 }),
  platFormTradeNo: varchar("platform_trade_no", { length: 64 }),

  status: varchar("status", { length: 32 }),
  payload: json("payload").notNull(),

  receivedAt: timestamp("received_at").defaultNow(),
});
