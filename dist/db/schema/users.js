"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRelations = exports.users = exports.ActivityStatus = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const AdminUsers_1 = require("./AdminUsers");
const currency_1 = require("./currency");
const chats_1 = require("./chats"); // Import chats schema
exports.ActivityStatus = (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]);
exports.users = (0, mysql_core_1.mysqlTable)("users", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    username: (0, mysql_core_1.varchar)("username", { length: 50 }).unique(),
    fullname: (0, mysql_core_1.varchar)("fullname", { length: 100 }),
    phone: (0, mysql_core_1.varchar)("phone", { length: 20 }).unique(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).unique(),
    password: (0, mysql_core_1.varchar)("password", { length: 255 }),
    currency_id: (0, mysql_core_1.int)("currency_id"),
    country_id: (0, mysql_core_1.int)("country_id"),
    refer_code: (0, mysql_core_1.varchar)("refer_code", { length: 50 }),
    created_by: (0, mysql_core_1.int)("created_by"),
    status: exports.ActivityStatus,
    isAgreeWithTerms: (0, mysql_core_1.boolean)("isAgreeWithTerms"),
    isLoggedIn: (0, mysql_core_1.boolean)("is_logged_in").default(false),
    isVerified: (0, mysql_core_1.boolean)("is_verified").default(false),
    lastIp: (0, mysql_core_1.varchar)("last_ip", { length: 120 }),
    lastLogin: (0, mysql_core_1.datetime)("last_login"),
    tokenVersion: (0, mysql_core_1.int)("token_version").default(0),
    // ✅ Email verification fields
    otp: (0, mysql_core_1.varchar)("otp", { length: 6 }),
    otp_expiry: (0, mysql_core_1.datetime)("otp_expiry"),
    // ✅ Password reset fields
    reset_password_token: (0, mysql_core_1.varchar)("reset_password_token", { length: 255 }),
    reset_password_token_expiry: (0, mysql_core_1.datetime)("reset_password_token_expiry"),
    // ✅ Spin and Forced spin fields
    isDailySpinCompleted: (0, mysql_core_1.boolean)("is_daily_spin_completed").default(false),
    isSpinForcedByAdmin: (0, mysql_core_1.boolean)("is_spin_forced_by_admin").default(false),
    isForcedSpinComplete: (0, mysql_core_1.boolean)("is_forced_spin_complete").default(false),
    lastSpinDate: (0, mysql_core_1.datetime)("last_spin_date"),
    // ✅ Device info fields
    device_type: (0, mysql_core_1.varchar)("device_type", { length: 50 }),
    device_name: (0, mysql_core_1.varchar)("device_name", { length: 100 }),
    os_version: (0, mysql_core_1.varchar)("os_version", { length: 50 }),
    browser: (0, mysql_core_1.varchar)("browser", { length: 50 }),
    browser_version: (0, mysql_core_1.varchar)("browser_version", { length: 50 }),
    ip_address: (0, mysql_core_1.varchar)("ip_address", { length: 45 }),
    device_token: (0, mysql_core_1.text)("device_token"),
    referred_by: (0, mysql_core_1.int)("referred_by"),
    referred_by_admin_user: (0, mysql_core_1.int)("referred_by_admin_user"),
    created_at: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    kyc_status: (0, mysql_core_1.mysqlEnum)("kyc_status", [
        "verified",
        "unverified",
        "required",
        "pending",
    ]).default("unverified"),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one, many }) => ({
    currency: one(currency_1.currencies, {
        fields: [exports.users.currency_id],
        references: [currency_1.currencies.id],
    }),
    createdByUser: one(AdminUsers_1.adminUsers, {
        fields: [exports.users.created_by],
        references: [AdminUsers_1.adminUsers.id],
    }),
    chats: many(chats_1.chats), // Add this line to define the relation
}));
