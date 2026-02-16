"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedGameProviderAndGame = void 0;
require("dotenv/config");
const connection_1 = require("../connection");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../schema");
// 🔑 Utility for random API keys & license keys
const generateRandomKey = (prefix, length = 16) => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = prefix + "-";
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
const seedGameProviderAndGame = async () => {
    try {
        // Insert Game Provider with random keys
        const provider = await connection_1.db
            .insert(schema_1.game_providers)
            .values([
            {
                name: "Sohidul Islam",
                parentId: null,
                status: "active",
                minBalanceLimit: "100.00",
                mainBalance: "1000.00",
                totalExpense: "0.00",
                providerIp: "127.0.0.1",
                licenseKey: generateRandomKey("PROVIDER-LICENSE"),
                phone: "+880123456789",
                email: "sohidul@example.com",
                whatsapp: "+880123456789",
                parentName: null,
                telegram: "@sohidul",
                country: "Bangladesh",
                logo: "https://glorypos.com/image-upload/gs-image/2025-08-21T19-18-54-342Z-aeb4dfa4-dd7a-40c1-8824-b023e7cd3157.png",
            },
        ])
            .onDuplicateKeyUpdate({
            set: {
                email: (0, drizzle_orm_1.sql) `values(${schema_1.game_providers.email})`,
                phone: (0, drizzle_orm_1.sql) `values(${schema_1.game_providers.phone})`,
            },
        });
        // Insert Game linked with provider with random keys
        await connection_1.db
            .insert(schema_1.games)
            .values([
            {
                name: "Crash Game",
                parentId: provider[0].insertId,
                status: "active",
                isFavorite: true,
                apiKey: generateRandomKey("GAME-API"),
                licenseKey: generateRandomKey("GAME-LICENSE"),
                categoryId: 1,
                providerId: provider[0].insertId,
                gameLogo: "https://glorypos.com/image-upload/gs-image/2025-08-21T19-28-45-548Z-0539c0d2-9e65-4b9e-84d6-145a36824dc8.png",
                secretPin: Math.floor(100000 + Math.random() * 900000).toString(), // random 6-digit pin
                gameUrl: "https://example.com/crash-game",
                ggrPercent: (5 + Math.floor(Math.random() * 15)).toString(), // random 5–20%
                // categoryInfo: JSON.stringify({ category: "Arcade", mode: "Multiplayer" }),
                // providerInfo: JSON.stringify({ id: provider[0].insertId, name: "Sohidul Islam" }),
                createdBy: "system",
            },
        ])
            .onDuplicateKeyUpdate({
            set: {
                name: (0, drizzle_orm_1.sql) `values(${schema_1.games.name})`,
                gameUrl: (0, drizzle_orm_1.sql) `values(${schema_1.games.gameUrl})`,
                gameLogo: (0, drizzle_orm_1.sql) `values(${schema_1.games.gameLogo})`,
            },
        });
        console.log("✅ Game Provider and Game seed data inserted successfully!");
    }
    catch (error) {
        console.error("❌ Failed to insert Game Provider and Game seed data:", error);
    }
};
exports.seedGameProviderAndGame = seedGameProviderAndGame;
// Run directly
if (require.main === module) {
    (0, exports.seedGameProviderAndGame)().then(() => process.exit(0));
}
