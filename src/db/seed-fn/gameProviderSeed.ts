import "dotenv/config";
import { db } from "../connection";
import { sql } from "drizzle-orm";
import { game_providers, games } from "../schema";

// 🔑 Utility for random API keys & license keys
const generateRandomKey = (prefix: string, length: number = 16): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = prefix + "-";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const seedGameProviderAndGame = async () => {
  try {
    // Insert Game Provider with random keys
    const provider = await db
      .insert(game_providers)
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
          email: sql`values(${game_providers.email})`,
          phone: sql`values(${game_providers.phone})`,
        },
      })

    // Insert Game linked with provider with random keys
    await db
      .insert(games)
      .values([
        {
          name: "Crash Game",
          parentId: provider[0].insertId,
          status: "active",
          isFavorite: true,
          apiKey: generateRandomKey("GAME-API"),
          licenseKey: generateRandomKey("GAME-LICENSE"),
          categoryId: 1,
          gameLogo: "https://glorypos.com/image-upload/gs-image/2025-08-21T19-18-54-342Z-aeb4dfa4-dd7a-40c1-8824-b023e7cd3157.png",
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
          name: sql`values(${games.name})`,
          gameUrl: sql`values(${games.gameUrl})`,
          gameLogo: sql`values(${games.gameLogo})`,
        },
      });

    console.log("✅ Game Provider and Game seed data inserted successfully!");
  } catch (error) {
    console.error("❌ Failed to insert Game Provider and Game seed data:", error);
  }
};

// Run directly
if (require.main === module) {
  seedGameProviderAndGame().then(() => process.exit(0));
}
