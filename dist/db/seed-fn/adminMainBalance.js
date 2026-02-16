"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAdminMainBalance = void 0;
const connection_1 = require("../connection");
const adminMainBalance_1 = require("../schema/adminMainBalance");
const seedAdminMainBalance = async () => {
    try {
        console.log("🌱 Seeding admin main balance data...");
        // Sample admin main balance records
        const adminMainBalanceData = [
            {
                amount: "10000.00",
                type: "admin_deposit",
                currencyId: 1,
                createdByAdmin: 1,
                notes: "Initial admin deposit for system startup",
            },
            {
                amount: "500.00",
                type: "player_deposit",
                currencyId: 1,
                createdByPlayer: 1,
                notes: "Player deposit via credit card",
            },
            {
                amount: "100.00",
                type: "promotion",
                promotionId: 1,
                promotionName: "Welcome Bonus",
                currencyId: 1,
                createdByAdmin: 1,
                notes: "Welcome bonus for new player",
            },
            {
                amount: "200.00",
                type: "player_withdraw",
                currencyId: 1,
                createdByPlayer: 1,
                notes: "Player withdrawal request",
            },
            {
                amount: "50.00",
                type: "admin_withdraw",
                currencyId: 1,
                createdByAdmin: 1,
                notes: "Admin withdrawal for maintenance",
            },
            {
                amount: "1000.00",
                type: "admin_deposit",
                currencyId: 1,
                createdByAdmin: 1,
                notes: "Additional admin deposit",
            },
            {
                amount: "750.00",
                type: "player_deposit",
                currencyId: 1,
                createdByPlayer: 2,
                notes: "Player deposit via bank transfer",
            },
            {
                amount: "150.00",
                type: "promotion",
                promotionId: 2,
                promotionName: "Deposit Bonus",
                currencyId: 1,
                createdByAdmin: 1,
                notes: "Deposit bonus promotion",
            },
            {
                amount: "300.00",
                type: "player_withdraw",
                currencyId: 1,
                createdByPlayer: 2,
                notes: "Player withdrawal to bank account",
            },
            {
                amount: "25.00",
                type: "admin_withdraw",
                currencyId: 1,
                createdByAdmin: 1,
                notes: "Admin withdrawal for testing",
            },
        ];
        // Insert admin main balance records
        for (const record of adminMainBalanceData) {
            await connection_1.db.insert(adminMainBalance_1.adminMainBalance).values(record);
        }
        console.log("✅ Admin main balance data seeded successfully!");
    }
    catch (error) {
        console.error("❌ Error seeding admin main balance data:", error);
        throw error;
    }
};
exports.seedAdminMainBalance = seedAdminMainBalance;
