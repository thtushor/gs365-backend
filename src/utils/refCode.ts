import { db } from "../db/connection";
import { users } from "../db/schema/users";
import { adminUsers } from "../db/schema/AdminUsers";
import { transactions } from "../db/schema/transactions";
import { eq } from "drizzle-orm";

function randomRefCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function generateUniqueRefCode(
  type: "user" | "admin",
  maxAttempts = 10
): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = randomRefCode();
    let exists;
    if (type === "user") {
      exists = await db
        .select()
        .from(users)
        .where(eq(users.refer_code, code))
        .limit(1);
    } else {
      exists = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.refCode, code))
        .limit(1);
    }
    if (!exists || exists.length === 0) {
      return code;
    }
  }
  throw new Error(
    "Failed to generate unique referral code after multiple attempts"
  );
}

export function generateCustomTransactionId(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TXN${timestamp}${random}`;
}

export async function generateUniqueTransactionId(maxAttempts = 10): Promise<string> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const transactionId = generateCustomTransactionId();
    const exists = await db
      .select()
      .from(transactions)
      .where(eq(transactions.customTransactionId, transactionId))
      .limit(1);
    
    if (!exists || exists.length === 0) {
      return transactionId;
    }
  }
  throw new Error(
    "Failed to generate unique transaction ID after multiple attempts"
  );
}
