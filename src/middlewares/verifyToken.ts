import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../utils/jwt";
import { AdminRole } from "../models/admin.model";

export type DecodedUser = {
  id: number;
  email: string;
  username: string;
  role: AdminRole;
};

// ✅ Set your static token (only use in dev!)
const STATIC_DEV_TOKEN = process.env.DEV_TOKEN;
const STATIC_USER: DecodedUser = {
  id: 0,
  email: "dev@example.com",
  username: "dev_admin",
  role: "admin", // Or whatever your AdminRole allows
};

export function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("No token provided");
    (err as any).status = 401;
    throw err;
  }

  const token = authHeader.split(" ")[1];

  // ✅ Check if static token is used
  if (token === STATIC_DEV_TOKEN) {
    (req as any).user = STATIC_USER;
    return next();
  }

  // ✅ Fall back to verifying real JWT
  try {
    const decoded = verifyJwt(token);
    (req as any).user = decoded as DecodedUser;
    console.log({decoded})

    return next();
  } catch {
    const err = new Error("Invalid or expired token");
    (err as any).status = 401;
    throw err;
  }
}
