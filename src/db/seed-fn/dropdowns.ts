import { db } from "../connection";
import { dropdowns } from "../schema";
import { eq } from "drizzle-orm";

export const seedDropdowns = async () => {
  try {
    const dropdownNames = ["Promotion Type", "Categories"];

    for (const name of dropdownNames) {
      const existing = await db
        .select()
        .from(dropdowns)
        .where(eq(dropdowns.name, name));

      if (existing.length === 0) {
        await db.insert(dropdowns).values([{ name }]);
        console.log(`✅ '${name}' seeded`);
      } else {
        console.log(`⚠️ '${name}' already exists, skipping insert`);
      }
    }
  } catch (err) {
    console.error("❌ Failed to seed dropdowns:", err);
  }
};
