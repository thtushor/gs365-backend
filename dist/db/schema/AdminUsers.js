"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminUsersRelations = exports.adminUsers = exports.adminRole = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const chats_1 = require("./chats"); // Import chats schema
exports.adminRole = (0, mysql_core_1.mysqlEnum)("role", [
    "superAdmin",
    "admin",
    "superAgent",
    "agent",
    "superAffiliate",
    "affiliate",
]);
exports.adminUsers = (0, mysql_core_1.mysqlTable)("admin_users", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    username: (0, mysql_core_1.varchar)("username", { length: 50 }).unique(),
    fullname: (0, mysql_core_1.varchar)("fullname", { length: 100 }),
    phone: (0, mysql_core_1.varchar)("phone", { length: 20 }).unique(),
    email: (0, mysql_core_1.varchar)("email", { length: 255 }).unique(),
    password: (0, mysql_core_1.varchar)("password", { length: 255 }),
    country: (0, mysql_core_1.varchar)("country", { length: 255 }),
    city: (0, mysql_core_1.varchar)("city", { length: 255 }),
    street: (0, mysql_core_1.varchar)("street", { length: 255 }),
    remainingBalance: (0, mysql_core_1.decimal)("remaining_balance", {
        precision: 20,
        scale: 2,
    }).$type(),
    minTrx: (0, mysql_core_1.decimal)("minimum_trx"),
    maxTrx: (0, mysql_core_1.decimal)("maximum_trx"),
    currency: (0, mysql_core_1.int)("currency"),
    designation: (0, mysql_core_1.int)("admin_designation"), // Foreign key to designations table
    role: exports.adminRole,
    status: (0, mysql_core_1.mysqlEnum)("status", ["active", "inactive"]).default("inactive"),
    refCode: (0, mysql_core_1.varchar)("ref_code", { length: 255 }).unique(),
    isLoggedIn: (0, mysql_core_1.boolean)("is_logged_in").default(false),
    isVerified: (0, mysql_core_1.boolean)("is_verified").default(false),
    lastIp: (0, mysql_core_1.varchar)("last_ip", { length: 120 }),
    lastLogin: (0, mysql_core_1.datetime)("last_login"),
    commission_percent: (0, mysql_core_1.int)("commission_percent"),
    // OTP and Verification
    otp: (0, mysql_core_1.varchar)("otp", { length: 6 }),
    otp_expiry: (0, mysql_core_1.datetime)("otp_expiry"),
    // Password Reset
    reset_password_token: (0, mysql_core_1.varchar)("reset_password_token", { length: 255 }),
    reset_password_token_expiry: (0, mysql_core_1.datetime)("reset_password_token_expiry"),
    main_balance: (0, mysql_core_1.int)("main_balance").default(0),
    downline_balance: (0, mysql_core_1.int)("downline_balance").default(0),
    withdrawable_balance: (0, mysql_core_1.int)("withdrawable_balance").default(0),
    // ✅ Device info fields
    device_type: (0, mysql_core_1.varchar)("device_type", { length: 50 }),
    device_name: (0, mysql_core_1.varchar)("device_name", { length: 100 }),
    os_version: (0, mysql_core_1.varchar)("os_version", { length: 50 }),
    browser: (0, mysql_core_1.varchar)("browser", { length: 50 }),
    browser_version: (0, mysql_core_1.varchar)("browser_version", { length: 50 }),
    ip_address: (0, mysql_core_1.varchar)("ip_address", { length: 45 }),
    device_token: (0, mysql_core_1.text)("device_token"),
    createdBy: (0, mysql_core_1.int)("created_by"),
    referred_by: (0, mysql_core_1.int)("referred_by"),
    created_at: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
    kyc_status: (0, mysql_core_1.mysqlEnum)("kyc_status", [
        "verified",
        "unverified",
        "required",
        "pending",
    ]).default("unverified"),
});
// 🔗 Self-reference for createdBy relationship
exports.adminUsersRelations = (0, drizzle_orm_1.relations)(exports.adminUsers, ({ one, many }) => ({
    createdByUser: one(exports.adminUsers, {
        fields: [exports.adminUsers.createdBy],
        references: [exports.adminUsers.id],
    }),
    chats: many(chats_1.chats),
    // designationRelation: one(designation, {
    //   fields: [adminUsers.designation],
    //   references: [designation.id],
    // }),
}));
