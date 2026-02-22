import { db } from "../connection";
import { adminUsers, users, betResults, commission, transactions } from "../schema";
import { eq } from "drizzle-orm";
import { generateUniqueTransactionId } from "../../utils/refCode";

export const seedAffiliateStats = async () => {
    try {
        console.log("🌱 Seeding Affiliate Stats Data using existing affiliate1...");

        // 1. Get existing affiliate from adminUser seed
        const existingAffiliate = await db.select().from(adminUsers).where(eq(adminUsers.username, "affiliate1")).limit(1);

        if (existingAffiliate.length === 0) {
            console.error("❌ Affiliate 'affiliate1' not found. Please run adminUser seed first.");
            return;
        }

        const affiliateId = existingAffiliate[0].id;

        // 2. Create or get test player referred by this affiliate
        const playerData: typeof users.$inferInsert = {
            username: "test_player_aff",
            fullname: "Affiliate Test Player",
            email: "player_aff@test.com",
            phone: "01800000000",
            status: "active",
            referred_by_admin_user: affiliateId,
            password: "hashed_password",
            currency_id: 1, // Assuming BDT is 1
        };

        const existingPlayer = await db.select().from(users).where(eq(users.username, "test_player_aff")).limit(1);
        let playerId: number;

        if (existingPlayer.length === 0) {
            const [inserted] = await db.insert(users).values(playerData);
            playerId = (inserted as any).insertId;
        } else {
            playerId = existingPlayer[0].id;
        }

        // 3. Create Bet Results and Commissions
        // Scenario A: Player Loss -> Affiliate Profit
        const betResultsData: typeof betResults.$inferInsert[] = [
            {
                userId: playerId,
                gameId: 1,
                betAmount: "1000.00",
                betStatus: "loss",
                winAmount: "0.00",
                lossAmount: "1000.00",
                gameName: "Seed Slot",
            },
            {
                userId: playerId,
                gameId: 1,
                betAmount: "500.00",
                betStatus: "win",
                winAmount: "1000.00",
                lossAmount: "0.00",
                gameName: "Seed Slot",
            }
        ];

        for (const bet of betResultsData) {
            const [insertedBet] = await db.insert(betResults).values(bet);
            const betId = (insertedBet as any).insertId;

            // Create approved commission
            await db.insert(commission).values({
                betResultId: betId,
                playerId: playerId,
                adminUserId: affiliateId,
                commissionAmount: bet.betStatus === "loss" ? "100.00" : "-50.00",
                percentage: "10.00",
                status: "approved",
                notes: `Commission for ${bet.betStatus} bet`,
            });
        }

        // 4. Create Withdrawal Transactions for Affiliate
        const txData: any[] = [
            {
                affiliateId: affiliateId,
                type: "withdraw",
                amount: "30.00",
                status: "approved",
                customTransactionId: await generateUniqueTransactionId(),
                currencyId: 1,
                withdrawMethod: "bank",
                notes: "Initial testing approved withdraw",
            },
            {
                affiliateId: affiliateId,
                type: "withdraw",
                amount: "10.00",
                status: "pending",
                customTransactionId: await generateUniqueTransactionId(),
                currencyId: 1,
                withdrawMethod: "bank",
                notes: "Initial testing pending withdraw",
            }
        ];

        for (const tx of txData) {
            await db.insert(transactions).values(tx);
        }

        console.log("✅ Affiliate Stats Seeded Successfully!");
        console.log(`Affiliate Username: affiliate1`);
        console.log(`Expected Stats -> Profit: 100, Loss: 50, Withdraw: 30, Current Balance: 20, Pending: 10`);

    } catch (error) {
        console.error("❌ Error Seeding Affiliate Stats Data:", error);
    }
};
