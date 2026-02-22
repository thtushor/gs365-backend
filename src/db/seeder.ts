import "dotenv/config";
import { db, pool } from "./connection";

import { seedUsers } from "./seed-fn/users";
import { seedCurrency } from "./seed-fn/currency";
import { seedAdminUsers } from "./seed-fn/adminUser";
import { seedDropdowns } from "./seed-fn/dropdowns";
import { seedSettings } from "./seed-fn/settings";

import {
  seedPaymentMethods,
  seedPaymentMethodTypes,
} from "./seed-fn/paymentMethods";
import { seedGameProviderAndGame } from "./seed-fn/gameProviderSeed";
import { seedBetResults } from "./seed-fn/betResults";
import { seedTransactions } from "./seed-fn/transactions";
import { seedAdminMainBalance } from "./seed-fn/adminMainBalance";
import { seedAffiliateStats } from "./seed-fn/affiliateStatsSeed";

async function seed() {
  try {
    // Seed currency
    await seedCurrency();
    // seed users
    await seedUsers();
    // seed admin users
    await seedAdminUsers();

    // seed dropdown names
    await seedDropdowns();

    await seedPaymentMethods();

    await seedPaymentMethodTypes();

    // seed settings
    await seedSettings();

    await seedGameProviderAndGame();

    // Seed bet results (after games and users are seeded)
    // await seedBetResults();

    // Seed transactions
    // await seedTransactions();

    // Seed admin main balance (after transactions are seeded)
    // await seedAdminMainBalance();

    // seed affiliate stats (referral, commissions, balance)
    await seedAffiliateStats();
  } catch (error) {
    console.error("❌ Failed to insert seed data:", error);
  } finally {
    await pool.end();
  }
}

seed();
