"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDropdowns = void 0;
const connection_1 = require("../connection");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
const seedDropdowns = async () => {
    try {
        const dropdownNames = ["Promotion Type", "Categories", "FAQ Categories"];
        for (const name of dropdownNames) {
            const existing = await connection_1.db
                .select()
                .from(schema_1.dropdowns)
                .where((0, drizzle_orm_1.eq)(schema_1.dropdowns.name, name));
            if (existing.length === 0) {
                await connection_1.db.insert(schema_1.dropdowns).values([{ name }]);
                console.log(`✅ '${name}' seeded`);
            }
            else {
                console.log(`⚠️ '${name}' already exists, skipping insert`);
            }
        }
    }
    catch (err) {
        console.error("❌ Failed to seed dropdowns:", err);
    }
};
exports.seedDropdowns = seedDropdowns;
