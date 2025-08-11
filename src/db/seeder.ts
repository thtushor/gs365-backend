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
  } catch (error) {
    console.error("❌ Failed to insert seed data:", error);
  } finally {
    await pool.end();
  }
}

seed();
