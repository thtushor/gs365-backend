import { db, pool } from "./db/connection";
import { betResults, commission, transactions } from "./db/schema";
import "dotenv/config";

const clearHistory = async () => {
    try {
        console.log("Starting to clear history...");

        // 1. Clear Commissions
        console.log("Clearing commission table...");
        await db.delete(commission);

        // 2. Clear Bet Results
        console.log("Clearing bet_results table...");
        await db.delete(betResults);

        // 3. Clear Transactions
        console.log("Clearing transactions table...");
        await db.delete(transactions);

        console.log("All requested history has been cleared successfully.");
    } catch (error) {
        console.error("Error clearing history:", error);
    } finally {
        await pool.end();
        process.exit(0);
    }
};

clearHistory();
