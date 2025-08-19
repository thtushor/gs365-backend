import { db } from "../connection";
import { transactions } from "../schema/transactions";

export const seedTransactions = async () => {
	try {
		console.log("🌱 Seeding transactions...");

		const now = new Date();
		const rows = [
			{ userId: 1, type: "deposit" as const, amount: "100.00", currencyId: 1, status: "approved" as const },
			{ userId: 1, type: "win" as const, amount: "50.00", currencyId: 1, status: "approved" as const, gameId: 1 },
			{ userId: 1, type: "loss" as const, amount: "20.00", currencyId: 1, status: "approved" as const, gameId: 1 },
			{ userId: 1, type: "withdraw" as const, amount: "30.00", currencyId: 1, status: "pending" as const },
			{ userId: 1, type: "win" as const, amount: "70.00", currencyId: 1, status: "approved" as const, gameId: 1 },
			{ userId: 2, type: "deposit" as const, amount: "200.00", currencyId: 1, status: "approved" as const },
			{ userId: 2, type: "loss" as const, amount: "80.00", currencyId: 1, status: "approved" as const, gameId: 1 },
			{ userId: 2, type: "win" as const, amount: "120.00", currencyId: 1, status: "approved" as const, gameId: 1 },
			{ userId: 2, type: "withdraw" as const, amount: "50.00", currencyId: 1, status: "pending" as const },
			{ userId: 2, type: "win" as const, amount: "40.00", currencyId: 1, status: "approved" as const, gameId: 1 },
		];

		for (const [i, row] of rows.entries()) {
			await db.insert(transactions).values({
				...row,
				givenTransactionId: `G-${Date.now()}-${i + 1}`,
				processedAt: now,
				createdAt: now,
			});
		}

		console.log("✅ Transactions seeded successfully!");
	} catch (error) {
		console.error("❌ Error seeding transactions:", error);
		throw error;
	}
};
