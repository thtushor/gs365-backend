import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";
import { AdminRole } from "../models/admin.model";
import { and, eq } from "drizzle-orm";
import { db } from "../db/connection";
import { adminUsers, users, userTokens } from "../db/schema";

export type DecodedUser = {
  id: number;
  email: string;
  username: string;
  role?: AdminRole | "player"; // admins have AdminRole, players just "player"
  tokenVersion?: number; // only for players
  userType?: string;
};

const STATIC_DEV_TOKEN = process.env.DEV_TOKEN;
const STATIC_USER: DecodedUser = {
  id: 0,
  email: "dev@example.com",
  username: "dev_admin",
  role: "admin",
  tokenVersion: 0,
};

export async function verifyToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ status: false, message: "No token provided" });
    return; // ✅ just return
  }

  const token = authHeader.split(" ")[1];

  if (token === process.env.DEV_TOKEN) {
    (req as any).user = {
      id: 0,
      email: "dev@example.com",
      username: "dev_admin",
      role: "admin",
      tokenVersion: 0,
    };
    next();
    return;
  }

  try {
    const decoded = verifyJwt(token) as DecodedUser;
    // console.log("decoded user", decoded);

    if (decoded.userType === "user") {
      const [player] = await db
        .select()
        .from(users)
        .where(eq(users.id, decoded.id))
        .limit(1);
      if (!player) {
        res.status(401).json({ status: false, message: "Player not found" });
        return;
      }

      const tokenVerifyDB = await db.query.userTokens.findFirst({
        where: and(eq(userTokens.token, token), eq(userTokens.user_id, player.id), eq(userTokens.type, "verify"))
      })

      if (!tokenVerifyDB?.id) {
        res.status(401).json({
          status: false,
          message: "Invalid,logged in ito another devices or expired token",
        });
      }

      // console.log(player);
      if (player.tokenVersion !== decoded.tokenVersion) {
        res.status(401).json({
          status: false,
          message: "Session expired. Please log in again.",
        });
        return;
      }

      // --- Inactivity Timeout Check (5 Minutes) ---
      const now = new Date();
      const lastActivity = player.lastActivity ? new Date(player.lastActivity) : now;
      const inactivityLimit = 5 * 60 * 1000; // 5 minutes in ms

      if (now.getTime() - lastActivity.getTime() > inactivityLimit) {
        await db
          .update(users)
          .set({ isLoggedIn: false })
          .where(eq(users.id, player.id));

        res.status(401).json({
          status: false,
          message: "Session expired due to inactivity. Please login again.",
        });
        return;
      }

      // Update last activity timestamp
      await db
        .update(users)
        .set({ lastActivity: now })
        .where(eq(users.id, player.id));

      (req as any).user = decoded;
      next();
      return;
    } else {
      const [admin] = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.id, decoded.id))
        .limit(1);
      if (!admin) {
        res.status(401).json({ status: false, message: "Admin not found" });
        return;
      }

      (req as any).user = decoded;
      next();
      return;
    }
  } catch {
    res
      .status(401)
      .json({ status: false, message: "Invalid or expired token" });
    return;
  }
}
