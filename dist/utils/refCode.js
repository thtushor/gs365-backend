"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUniqueRefCode = generateUniqueRefCode;
exports.generateCustomTransactionId = generateCustomTransactionId;
exports.generateUniqueTransactionId = generateUniqueTransactionId;
const connection_1 = require("../db/connection");
const users_1 = require("../db/schema/users");
const AdminUsers_1 = require("../db/schema/AdminUsers");
const transactions_1 = require("../db/schema/transactions");
const drizzle_orm_1 = require("drizzle-orm");
function randomRefCode(length = 8) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}
async function generateUniqueRefCode(type, maxAttempts = 10) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const code = randomRefCode();
        let exists;
        if (type === "user") {
            exists = await connection_1.db
                .select()
                .from(users_1.users)
                .where((0, drizzle_orm_1.eq)(users_1.users.refer_code, code))
                .limit(1);
        }
        else {
            exists = await connection_1.db
                .select()
                .from(AdminUsers_1.adminUsers)
                .where((0, drizzle_orm_1.eq)(AdminUsers_1.adminUsers.refCode, code))
                .limit(1);
        }
        if (!exists || exists.length === 0) {
            return code;
        }
    }
    throw new Error("Failed to generate unique referral code after multiple attempts");
}
function generateCustomTransactionId() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TXN${timestamp}${random}`;
}
async function generateUniqueTransactionId(maxAttempts = 10) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const transactionId = generateCustomTransactionId();
        const exists = await connection_1.db
            .select()
            .from(transactions_1.transactions)
            .where((0, drizzle_orm_1.eq)(transactions_1.transactions.customTransactionId, transactionId))
            .limit(1);
        if (!exists || exists.length === 0) {
            return transactionId;
        }
    }
    throw new Error("Failed to generate unique transaction ID after multiple attempts");
}
