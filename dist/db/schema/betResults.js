"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.betResults = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.betResults = (0, mysql_core_1.mysqlTable)("bet_results", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    userId: (0, mysql_core_1.int)("user_id").notNull(),
    gameId: (0, mysql_core_1.int)("game_id").notNull(),
    betBalance: (0, mysql_core_1.decimal)("bet_balance", { precision: 20, scale: 2 }).default("0"),
    betAmount: (0, mysql_core_1.decimal)("bet_amount", { precision: 20, scale: 2 }).default("0"),
    betStatus: (0, mysql_core_1.mysqlEnum)("bet_status", ["win", "loss", "pending", "cancelled"]).default("pending"),
    playingStatus: (0, mysql_core_1.mysqlEnum)("playing_status", ["playing", "completed", "abandoned"]).default("playing"),
    // Game session details
    sessionToken: (0, mysql_core_1.text)("session_token").default(""),
    gameSessionId: (0, mysql_core_1.text)("game_session_id").default(""),
    // Betting details
    winAmount: (0, mysql_core_1.decimal)("win_amount", { precision: 20, scale: 2 }).default("0"),
    lossAmount: (0, mysql_core_1.decimal)("loss_amount", { precision: 20, scale: 2 }).default("0"),
    multiplier: (0, mysql_core_1.decimal)("multiplier", { precision: 10, scale: 4 }).default("0.0000"),
    // Game metadata
    gameName: (0, mysql_core_1.text)("game_name").default(""),
    gameProvider: (0, mysql_core_1.text)("game_provider").default(""),
    gameCategory: (0, mysql_core_1.text)("game_category").default(""),
    // User context
    userScore: (0, mysql_core_1.int)("user_score").default(0),
    userLevel: (0, mysql_core_1.varchar)("user_level", { length: 50 }).default("beginner"),
    // Timing
    betPlacedAt: (0, mysql_core_1.datetime)("bet_placed_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    gameStartedAt: (0, mysql_core_1.datetime)("game_started_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    gameCompletedAt: (0, mysql_core_1.datetime)("game_completed_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    // Additional tracking
    ipAddress: (0, mysql_core_1.varchar)("ip_address", { length: 45 }).default(""),
    deviceInfo: (0, mysql_core_1.text)("device_info").default(""),
    isMobile: (0, mysql_core_1.boolean)("is_mobile").default(false),
    // Audit fields
    createdBy: (0, mysql_core_1.varchar)("created_by", { length: 200 }),
    updatedBy: (0, mysql_core_1.varchar)("updated_by", { length: 200 }),
    createdAt: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    updatedAt: (0, mysql_core_1.datetime)("updated_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});
