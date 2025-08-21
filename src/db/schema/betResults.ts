import { sql } from "drizzle-orm";
import {
  boolean,
  datetime,
  decimal,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  varchar,
} from "drizzle-orm/mysql-core";

export const betResults = mysqlTable("bet_results", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  gameId: int("game_id").notNull(),
  betBalance: decimal("bet_balance", { precision: 20, scale: 2 }).default("0"),
  betAmount: decimal("bet_amount", { precision: 20, scale: 2 }).notNull(),
  betStatus: mysqlEnum("bet_status", ["win", "loss", "pending", "cancelled"]).default("pending"),
  playingStatus: mysqlEnum("playing_status", ["playing", "completed", "abandoned"]).default("playing"),
  
  // Game session details
  sessionToken: text("session_token").default(""),
  gameSessionId: text("game_session_id").default(""),
  
  // Betting details
  winAmount: decimal("win_amount", { precision: 20, scale: 2 }).default("0"),
  lossAmount: decimal("loss_amount", { precision: 20, scale: 2 }).default("0"),
  multiplier: decimal("multiplier", { precision: 10, scale: 4 }).default("0.0000"),
  
  // Game metadata
  gameName: text("game_name").default(""),
  gameProvider: text("game_provider").default(""),
  gameCategory: text("game_category").default(""),
  
  // User context
  userScore: int("user_score").default(0),
  userLevel: varchar("user_level", { length: 50 }).default("beginner"),
  
  // Timing
  betPlacedAt: datetime("bet_placed_at").default(sql`CURRENT_TIMESTAMP`),
  gameStartedAt: datetime("game_started_at").default(sql`CURRENT_TIMESTAMP`),
  gameCompletedAt: datetime("game_completed_at").default(sql`CURRENT_TIMESTAMP`),
  
  // Additional tracking
  ipAddress: varchar("ip_address", { length: 45 }).default(""),
  deviceInfo: text("device_info").default(""),
  isMobile: boolean("is_mobile").default(false),
  
  // Audit fields
  createdBy: varchar("created_by", { length: 200 }),
  updatedBy: varchar("updated_by", { length: 200 }),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
