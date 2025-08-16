import "dotenv/config";
import { users } from "../schema";
import { db } from "../connection";
import { sql } from "drizzle-orm";

export const seedUsers = async () => {
  try {
    await db
      .insert(users)
      .values([
        {
          username: "alice123",
          fullname: "Alice Smith",
          phone: "1234567890",
          email: "alice@example.com",
          password: "hashedpassword1",
          currency_id: 1,
          refer_code: "REFALICE",
          isAgreeWithTerms: true,
          isLoggedIn: true,
          isVerified: true,
          lastIp: "192.168.1.10",
          lastLogin: new Date(),
          device_type: "Desktop",
          status: "active",
          device_name: "Windows PC",
          os_version: "Windows 10",
          browser: "Chrome",
          browser_version: "120.0.0.0",
          ip_address: "192.168.1.10",
          device_token: "token-alice-123",
          created_at: new Date(),
        },
        {
          username: "bob456",
          fullname: "Bob Brown",
          phone: "2345678901",
          email: "bob@example.com",
          password: "hashedpassword2",
          currency_id: 2,
          refer_code: "REFBOB",
          status: "inactive",
          isAgreeWithTerms: true,
          isLoggedIn: false,
          isVerified: false,
          lastIp: "10.0.0.5",
          lastLogin: new Date(),
          device_type: "Mobile",
          device_name: "iPhone 13",
          os_version: "iOS 17.2",
          browser: "Safari",
          browser_version: "17.0",
          ip_address: "10.0.0.5",
          device_token: "token-bob-456",
          created_at: new Date(),
        },
      ])
      .onDuplicateKeyUpdate({
        set: {
          email: sql`values(${users.email})`,
          phone: sql`values(${users.phone})`,
        },
      });

    console.log("✅ User seed data inserted successfully!");
  } catch (error) {
    console.error("❌ Failed to insert User seed data:", error);
  }
};
