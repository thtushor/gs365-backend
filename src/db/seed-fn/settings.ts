import { db } from "../connection";
import { settings } from "../schema";

export const seedSettings = async () => {
  // Ensure a single settings row exists; if not, create one with defaultTurnover = 2
  const rows = await db.select().from(settings).limit(1);
  if (!rows.length) {
    await db.insert(settings).values({ defaultTurnover: 2,adminBalance:"1000000" });
    console.log("✅ settings seeded with defaultTurnover = 2");
  } else {
    console.log("⚠️ settings already present, skipping insert");
  }
};
