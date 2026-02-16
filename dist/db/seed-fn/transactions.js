"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTransactions = void 0;
const connection_1 = require("../connection");
const transactions_1 = require("../schema/transactions");
const seedTransactions = async () => {
    try {
        console.log("🌱 Seeding transactions...");
        const now = new Date();
        const rows = [
            { userId: 1, type: "deposit", amount: "100.00", currencyId: 1, status: "approved" },
            { userId: 1, type: "win", amount: "50.00", currencyId: 1, status: "approved", gameId: 1 },
            { userId: 1, type: "loss", amount: "20.00", currencyId: 1, status: "approved", gameId: 1 },
            { userId: 1, type: "withdraw", amount: "30.00", currencyId: 1, status: "pending" },
            { userId: 1, type: "win", amount: "70.00", currencyId: 1, status: "approved", gameId: 1 },
            { userId: 2, type: "deposit", amount: "200.00", currencyId: 1, status: "approved" },
            { userId: 2, type: "loss", amount: "80.00", currencyId: 1, status: "approved", gameId: 1 },
            { userId: 2, type: "win", amount: "120.00", currencyId: 1, status: "approved", gameId: 1 },
            { userId: 2, type: "withdraw", amount: "50.00", currencyId: 1, status: "pending" },
            { userId: 2, type: "win", amount: "40.00", currencyId: 1, status: "approved", gameId: 1 },
        ];
        for (const [i, row] of rows.entries()) {
            await connection_1.db.insert(transactions_1.transactions).values({
                ...row,
                givenTransactionId: `G-${Date.now()}-${i + 1}`,
                processedAt: now,
                createdAt: now,
            });
        }
        console.log("✅ Transactions seeded successfully!");
    }
    catch (error) {
        console.error("❌ Error seeding transactions:", error);
        throw error;
    }
};
exports.seedTransactions = seedTransactions;
