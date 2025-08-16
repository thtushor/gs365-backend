import { db } from "../connection";
import { betResults } from "../schema/betResults";

export const seedBetResults = async () => {
  try {
    console.log("🌱 Seeding bet results...");

    const sampleBetResults = [
      {
        userId: 1,
        gameId: 1,
        betAmount: "100.00",
        betStatus: "win",
        playingStatus: "completed",
        sessionToken: "sample_token_1",
        gameSessionId: "game_session_1",
        winAmount: "200.00",
        lossAmount: "0.00",
        multiplier: "2.0000",
        gameName: "Slot Machine Deluxe",
        gameProvider: "Game Provider Inc",
        gameCategory: "Slots",
        userScore: 1500,
        userLevel: "intermediate",
        betPlacedAt: new Date("2024-01-01T12:00:00.000Z"),
        gameStartedAt: new Date("2024-01-01T12:00:00.000Z"),
        gameCompletedAt: new Date("2024-01-01T12:05:00.000Z"),
        ipAddress: "192.168.1.1",
        deviceInfo: "Chrome 120.0.0.0 on Windows 10",
        isMobile: false,
        createdBy: "system",
        updatedBy: "system",
      },
      {
        userId: 1,
        gameId: 2,
        betAmount: "50.00",
        betStatus: "loss",
        playingStatus: "completed",
        sessionToken: "sample_token_2",
        gameSessionId: "game_session_2",
        winAmount: "0.00",
        lossAmount: "50.00",
        multiplier: "1.0000",
        gameName: "Poker Pro",
        gameProvider: "Card Games Ltd",
        gameCategory: "Card Games",
        userScore: 1200,
        userLevel: "beginner",
        betPlacedAt: new Date("2024-01-01T14:00:00.000Z"),
        gameStartedAt: new Date("2024-01-01T14:00:00.000Z"),
        gameCompletedAt: new Date("2024-01-01T14:10:00.000Z"),
        ipAddress: "192.168.1.1",
        deviceInfo: "Chrome 120.0.0.0 on Windows 10",
        isMobile: false,
        createdBy: "system",
        updatedBy: "system",
      },
      {
        userId: 2,
        gameId: 1,
        betAmount: "75.00",
        betStatus: "win",
        playingStatus: "completed",
        sessionToken: "sample_token_3",
        gameSessionId: "game_session_3",
        winAmount: "150.00",
        lossAmount: "0.00",
        multiplier: "2.0000",
        gameName: "Slot Machine Deluxe",
        gameProvider: "Game Provider Inc",
        gameCategory: "Slots",
        userScore: 2000,
        userLevel: "expert",
        betPlacedAt: new Date("2024-01-01T16:00:00.000Z"),
        gameStartedAt: new Date("2024-01-01T16:00:00.000Z"),
        gameCompletedAt: new Date("2024-01-01T16:03:00.000Z"),
        ipAddress: "192.168.1.2",
        deviceInfo: "Safari 17.0 on macOS",
        isMobile: false,
        createdBy: "system",
        updatedBy: "system",
      },
      {
        userId: 1,
        gameId: 3,
        betAmount: "200.00",
        betStatus: "pending",
        playingStatus: "playing",
        sessionToken: "sample_token_4",
        gameSessionId: "game_session_4",
        winAmount: "0.00",
        lossAmount: "0.00",
        multiplier: "1.0000",
        gameName: "Roulette Royale",
        gameProvider: "Casino Games Corp",
        gameCategory: "Table Games",
        userScore: 1800,
        userLevel: "advanced",
        betPlacedAt: new Date("2024-01-01T18:00:00.000Z"),
        gameStartedAt: new Date("2024-01-01T18:00:00.000Z"),
        ipAddress: "192.168.1.1",
        deviceInfo: "Chrome 120.0.0.0 on Windows 10",
        isMobile: false,
        createdBy: "system",
        updatedBy: "system",
      },
    ];

    // Insert sample bet results
    for (const betResult of sampleBetResults) {
      await db.insert(betResults).values(betResult);
    }

    console.log("✅ Bet results seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding bet results:", error);
    throw error;
  }
};
