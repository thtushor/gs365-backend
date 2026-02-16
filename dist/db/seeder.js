"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const connection_1 = require("./connection");
const users_1 = require("./seed-fn/users");
const currency_1 = require("./seed-fn/currency");
const adminUser_1 = require("./seed-fn/adminUser");
const dropdowns_1 = require("./seed-fn/dropdowns");
const settings_1 = require("./seed-fn/settings");
const paymentMethods_1 = require("./seed-fn/paymentMethods");
const gameProviderSeed_1 = require("./seed-fn/gameProviderSeed");
async function seed() {
    try {
        // Seed currency
        await (0, currency_1.seedCurrency)();
        // seed users
        await (0, users_1.seedUsers)();
        // seed admin users
        await (0, adminUser_1.seedAdminUsers)();
        // seed dropdown names
        await (0, dropdowns_1.seedDropdowns)();
        await (0, paymentMethods_1.seedPaymentMethods)();
        await (0, paymentMethods_1.seedPaymentMethodTypes)();
        // seed settings
        await (0, settings_1.seedSettings)();
        await (0, gameProviderSeed_1.seedGameProviderAndGame)();
        // Seed bet results (after games and users are seeded)
        // await seedBetResults();
        // Seed transactions
        // await seedTransactions();
        // Seed admin main balance (after transactions are seeded)
        // await seedAdminMainBalance();
    }
    catch (error) {
        console.error("❌ Failed to insert seed data:", error);
    }
    finally {
        await connection_1.pool.end();
    }
}
seed();
