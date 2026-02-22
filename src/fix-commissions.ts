import "dotenv/config";
import { db, pool } from "./db/connection";
import { commission } from "./db/schema";
import { sql } from "drizzle-orm";

const roundCommissions = async () => {
    try {
        console.log("Starting to round fractional commission amounts...");

        // Update all commissions to their rounded values
        const result = await db.execute(sql`
            UPDATE commission 
            SET commission_amount = ROUND(commission_amount)
        `);

        console.log("Successfully rounded all commission amounts.");
        // console.log("Result:", result);
    } catch (error) {
        console.error("Error rounding commissions:", error);
    } finally {
        await pool.end();
        process.exit(0);
    }
};

roundCommissions();
