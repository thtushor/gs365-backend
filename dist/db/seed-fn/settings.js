"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedSettings = void 0;
const connection_1 = require("../connection");
const schema_1 = require("../schema");
const seedSettings = async () => {
    // Ensure a single settings row exists; if not, create one with defaultTurnover = 2
    const rows = await connection_1.db.select().from(schema_1.settings).limit(1);
    if (!rows.length) {
        await connection_1.db.insert(schema_1.settings).values({ defaultTurnover: 2, adminBalance: "1000000" });
        console.log("✅ settings seeded with defaultTurnover = 2");
    }
    else {
        console.log("⚠️ settings already present, skipping insert");
    }
};
exports.seedSettings = seedSettings;
