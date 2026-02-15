import { Request, Response } from "express";
import {
  getUsersWithFilters,
  createUser,
  findUserByUsernameOrEmail,
  updateUser as updateUserModel,
  deleteUser as deleteUserModel,
  getUserById,
  getUserDetailsById,
  getUsersByReferrerType,
  UserFilters,
} from "../models/user.model";
import bcrypt from "bcryptjs";

import * as UAParser from "ua-parser-js";
import { db } from "../db/connection";
import { SettingsModel } from "../models/settings.model";
import { games, notifications, users, userTokens } from "../db/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import { generateUniqueRefCode } from "../utils/refCode";
import { findUserByReferCode } from "../models/user.model";
import { findAdminByRefCode } from "../models/admin.model";
import { generateJwtToken, JwtPayload, verifyJwt } from "../utils/jwt";
import { createUserLoginHistory } from "../models/userLoginHistory.model";
import { user_favorites } from "../db/schema/user_favorites";
import { io } from "..";

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await getUsersWithFilters({});
    return res.json({ status: true, users });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch users" });
  }
};

export const getUsersWithFiltersController = async (
  req: Request,
  res: Response,
) => {
  try {
    const {
      playerId,
      phone,
      status,
      keyword,
      page = 1,
      pageSize = 10,
      createdBy,
      referred_by,
      referred_by_admin_user,
      userType = "all",
      currencyId,
      dateFrom,
      dateTo,
    } = req.query;

    const filters: UserFilters = {
      playerId: playerId ? Number(playerId) : undefined,
      phone: phone as string,
      status: status as string,
      keyword: keyword as string,
      page: Number(page),
      pageSize: Number(pageSize),
      createdBy: createdBy ? Number(createdBy) : undefined,
      referred_by: referred_by ? Number(referred_by) : undefined,
      referred_by_admin_user: referred_by_admin_user
        ? Number(referred_by_admin_user)
        : undefined,
      userType: userType as "all" | "affiliate" | "agent" | "player",
      currencyId: currencyId ? Number(currencyId) : undefined,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string,
    };

    const result = await getUsersWithFilters(filters);

    return res.json({
      status: true,
      message: "Users fetched successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching users with filters:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch users" });
  }
};

export const getUserDetailsController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: false, message: "User ID is required" });
    }

    const userDetails = await getUserDetailsById(Number(id));

    if (!userDetails) {
      return res.status(404).json({ status: false, message: "User not found" });
    }

    return res.json({
      status: true,
      message: "User details fetched successfully",
      data: userDetails,
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    return res
      .status(500)
      .json({ status: false, message: "Failed to fetch user details" });
  }
};

export const getUsersByReferrerTypeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { type } = req.params;
    const { page = 1, pageSize = 10 } = req.query;

    if (type !== "affiliate" && type !== "agent") {
      return res.status(400).json({
        status: false,
        message: "Type must be 'affiliate' or 'agent'",
      });
    }

    const result = await getUsersByReferrerType(
      type as "affiliate" | "agent",
      Number(page),
      Number(pageSize),
    );

    return res.json({
      status: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)
        } users fetched successfully`,
      data: result,
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.type} users:`, error);
    return res.status(500).json({
      status: false,
      message: `Failed to fetch ${req.params.type} users`,
    });
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const {
      username,
      fullname,
      phone,
      email,
      password,
      currency_id,
      refer_code,
      isAgreeWithTerms,
      createdBy,
      country_id,
    } = req.body;
    if (!username) {
      return res
        .status(400)
        .json({ status: false, message: "Username is required" });
    }

    if (!fullname) {
      return res
        .status(400)
        .json({ status: false, message: "Full name is required" });
    }

    if (!phone) {
      return res
        .status(400)
        .json({ status: false, message: "Phone number is required" });
    }

    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Email is required" });
    }

    if (!password) {
      return res
        .status(400)
        .json({ status: false, message: "Password is required" });
    }

    if (!country_id) {
      return res
        .status(400)
        .json({ status: false, message: "Country is required" });
    }

    if (!currency_id) {
      return res
        .status(400)
        .json({ status: false, message: "Currency is required" });
    }

    if (typeof isAgreeWithTerms !== "boolean" || !isAgreeWithTerms) {
      return res
        .status(400)
        .json({ status: false, message: "You must agree with terms" });
    }

    const existingUserName = await findUserByUsernameOrEmail(username);

    const existingPhone = await findUserByUsernameOrEmail(phone);
    const existingEmail = await findUserByUsernameOrEmail(email);

    if (existingUserName) {
      return res
        .status(500)
        .json({ status: false, message: `${username} already exists` });
    }

    if (existingPhone) {
      return res
        .status(500)
        .json({ status: false, message: `${phone} already exists` });
    }

    if (existingEmail) {
      return res
        .status(500)
        .json({ status: false, message: `${email} already exists` });
    }

    // Generate unique refer_code for this user
    const uniqueReferCode = await generateUniqueRefCode("user");
    // If refer_code is provided, find the referring user
    let referred_by = undefined;
    let referred_by_admin_user = undefined;
    console.log("the refer code", refer_code);
    if (refer_code) {
      const referringUser = await findUserByReferCode(refer_code);
      console.log("refer by user:", referringUser);
      if (referringUser && referringUser.id) {
        referred_by = referringUser.id;
      } else {
        const referringAdmin = await findAdminByRefCode(refer_code);
        console.log("refer by admin:", referringAdmin);
        if (referringAdmin && referringAdmin?.id) {
          referred_by_admin_user = referringAdmin.id;
        }
      }
    }

    // Generate OTP for email verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

    const user = await createUser({
      username,
      fullname,
      phone,
      email,
      password,
      currency_id,
      refer_code: uniqueReferCode,
      isAgreeWithTerms,
      createdBy,
      referred_by,
      referred_by_admin_user,
      status: "active",
      country_id,
      otp,
      otp_expiry: otpExpiry,
      isVerified: false, // User needs to verify email if created by themselves
    });

    // Send OTP email only if not verified
    if (email) {
      const { sendOTPEmail } = await import("../utils/emailService");
      await sendOTPEmail(email, otp, 10);
    }

    return res.status(201).json({
      status: true,
      message:
        "User registered successfully. Please verify your email with the OTP sent.",
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to register user", error });
  }
};

export function getClientIp(req: Request): string {
  let ip =
    (req.headers["x-forwarded-for"] as string)
      ?.split(",")
      .map((s) => s.trim())[0] ||
    (req.headers["x-real-ip"] as string) ||
    req.socket?.remoteAddress ||
    (req.connection as any)?.remoteAddress ||
    req.ip ||
    "Unknown";
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") {
    ip = "127.0.0.1";
  }
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }
  return ip;
}

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { userNameOrEmailorPhone, password } = req.body;
    if (!userNameOrEmailorPhone || !password) {
      return res.status(400).json({
        status: false,
        message: "Missing username/email/phone or password",
      });
    }
    const user = await findUserByUsernameOrEmail(userNameOrEmailorPhone);
    if (!user || typeof user.password !== "string") {
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials" });
    }

    // Check if email is verified
    // Check global settings for verification requirements
    const settings = await SettingsModel.getFirst();
    const isEmailVerificationEnabled =
      settings?.isEmailVerificationEnabled === "Enabled";
    const isSmsVerificationEnabled =
      settings?.isSmsVerificationEnabled === "Enabled";

    // 1. Check Email Verification
    if (isEmailVerificationEnabled && !user.isEmailVerified) {
      // Check if current OTP is valid (not expired)
      const now = new Date();
      const otpExpiry = user.otp_expiry ? new Date(user.otp_expiry) : null;
      const isOtpValid = otpExpiry && otpExpiry > now;

      if (isOtpValid) {
        return res.status(403).json({
          status: false,
          message:
            "Email not verified. Please verify your email with the One Time Password (OTP) sent to your registered email address.",
          requiresVerification: true,
          verificationType: "email",
          email: user.email,
        });
      } else {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const newOtpExpiry = new Date();
        newOtpExpiry.setMinutes(newOtpExpiry.getMinutes() + 10);

        await updateUserModel(user.id, {
          otp,
          otp_expiry: newOtpExpiry,
        });

        if (user.email) {
          const { sendOTPEmail } = await import("../utils/emailService");
          await sendOTPEmail(user.email, otp, 10);
        }

        return res.status(403).json({
          status: false,
          message:
            "Email not verified. A new One Time Password (OTP) has been sent to your registered email address.",
          requiresVerification: true,
          verificationType: "email",
          email: user.email,
        });
      }
    }

    // 2. Check SMS Verification
    if (isSmsVerificationEnabled && !user.isPhoneVerified) {
      // Placeholder for SMS OTP logic
      // You would check/generate SMS OTP here similar to email
      // For now, we will block login but not send actual SMS until SMS service is integrated
      return res.status(403).json({
        status: false,
        message:
          "Phone number not verified. Please verify your phone number.",
        requiresVerification: true,
        verificationType: "phone",
        phone: user.phone,
      });
    }

    // Check for password match (Plain text, as per registration flow)
    const isMatch = password === user.password;

    if (!isMatch) {
      return res
        .status(401)
        .json({ status: false, message: "Invalid credentials" });
    }
    // --- Device Info Extraction ---
    const userAgent = req.headers["user-agent"] || "";
    const parser = new UAParser.UAParser(userAgent);
    const uaResult = parser.getResult();
    const device_type = uaResult.device.type || "Desktop";
    const device_name = uaResult.device.model || uaResult.os.name || "Unknown";
    const os_version = uaResult.os.name
      ? `${uaResult.os.name} ${uaResult.os.version || ""}`.trim()
      : "Unknown";
    const browser = uaResult.browser.name || "Unknown";
    const browser_version = uaResult.browser.version || "Unknown";
    const ip_address = getClientIp(req);
    const tokenVersion = (user.tokenVersion ?? 0) + 1;
    // You can now use device_type, device_name, os_version, browser, browser_version, ip_address as needed (e.g., log, save to DB, etc.)
    const token = generateJwtToken(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        // token version for new browser or new login
        tokenVersion: tokenVersion,
        userType: "user",
      },
      "5Mins",
    );

    await db
      .update(users)
      .set({
        isLoggedIn: true,
        device_type,
        device_name,
        os_version,
        browser,
        browser_version,
        lastIp: ip_address,
        lastLogin: new Date(),
        tokenVersion: (user.tokenVersion || 0) + 1,
      })
      .where(eq(users.id, user.id));

    const getUserVerifyToken = await db.query.userTokens.findFirst({
      where: and(
        eq(userTokens.user_id, user.id),
        eq(userTokens.type, "verify"),
      ),
    });

    if (getUserVerifyToken?.id) {
      await db
        .update(userTokens)
        .set({
          user_id: user.id,
          token: token,
          type: "verify",
        })
        .where(and(eq(userTokens.user_id, user.id)));
    } else {
      await db.insert(userTokens).values({
        user_id: user.id,
        token: token,
        type: "verify",
        expires_at: new Date(),
      });
    }

    // Notify all connected clients for this user to validate their token.
    // Clients should compare their stored token with `latestToken`; if mismatched, auto-logout.
    io.emit(`logout-user-${user.id}`, {
      userId: user.id,
      latestToken: token,
    });

    // Record login history
    try {
      await createUserLoginHistory({
        userId: user.id,
        ipAddress: ip_address,
        userAgent: userAgent,
        deviceType: device_type,
        deviceName: device_name,
        osVersion: os_version,
        browser: browser,
        browserVersion: browser_version,
      });
    } catch (historyError) {
      console.error("Failed to record login history:", historyError);
      // Don't fail the login if history recording fails
    }

    return res.json({
      status: true,
      message: "Login successful",
      data: user,
      accessToken: token,
      device: {
        device_type,
        device_name,
        os_version,
        browser,
        browser_version,
        ip_address,
      },
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: "Failed to login" });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    const user = (req as unknown as { user: JwtPayload }).user;
    if (!Boolean(user.id) || user.userType !== "user") {
      res.status(401).json({ status: false, message: "Unauthorized" });
      return;
    }

    user.id &&
      (await db
        .update(users)
        .set({ isLoggedIn: false })
        .where(eq(users.id, user.id)));

    return res
      .status(200)
      .json({ status: true, message: "Logged out successfully" });
  } catch (error) { }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ status: false, message: "User ID is required" });
    }
    const data = req.body;
    const updated = await updateUserModel(Number(id), data);
    if (!updated) {
      return res
        .status(404)
        .json({ status: false, message: "User not found or not updated" });
    }
    return res.json({
      status: true,
      message: "User updated successfully",
      data: updated,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to update user", error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res
        .status(400)
        .json({ status: false, message: "User ID is required" });
    }
    const result = await deleteUserModel(Number(id));
    if (!result) {
      return res
        .status(404)
        .json({ status: false, message: "User not found or not deleted" });
    }
    return res.json({ status: true, message: "User deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, message: "Failed to delete user" });
  }
};

export const userProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const user = (req as unknown as { user: JwtPayload }).user;

  if (!Boolean(user.id) || user.userType !== "user") {
    res.status(401).json({ status: false, message: "Unauthorized" });
    return;
  }

  try {
    const userData = await getUserById(user?.id!);

    if (userData?.id) {
      if (userData.status === "active") {
        const lastSpinDate = userData?.lastSpinDate
          ? new Date(userData.lastSpinDate)
          : null;

        const isDailySpinCompleted = userData?.isDailySpinCompleted;

        // Get today's date (year-month-day only)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (lastSpinDate) {
          const lastSpin = new Date(lastSpinDate);
          lastSpin.setHours(0, 0, 0, 0);

          const isNotToday = lastSpin.getTime() !== today.getTime();

          if (isNotToday && isDailySpinCompleted === true) {
            const data = {
              isDailySpinCompleted: false,
            };

            const updateRes = await updateUserModel(Number(userData?.id), data);
            if (updateRes.affectedRows > 0) {
              res.status(201).json({
                status: true,
                message: "User daily spin activated",
              });
            }
          }
        }
        res.status(200).json({
          status: true,
          message: "Profile fetched successfully",
          data: userData,
        });
      } else {
        res.status(401).json({
          status: false,
          message: "User is inactive",
          data: null,
        });
      }
    } else {
      res.status(200).json({
        status: false,
        message: "Profile not found",
        data: userData,
      });
      return;
    }
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(200)
        .json({ message: "Something went wrong", status: false, error });
    }
  }
};
// Add favorite
export const addFavorite = async (req: Request, res: Response) => {
  try {
    const { userId, gameId } = req.body;

    // Check if already favorited
    const exists = await db
      .select()
      .from(user_favorites)
      .where(
        and(
          eq(user_favorites.gameId, Number(gameId)),
          eq(user_favorites.userId, Number(userId)),
        ),
      );

    if (exists.length > 0) {
      return res.status(400).json({ message: "Game already in favorites" });
    }

    await db
      .insert(user_favorites)
      .values({ userId: Number(userId), gameId: Number(gameId) });

    return res.status(200).json({ message: "Added to favorites" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Remove favorite
export const removeFavorite = async (req: Request, res: Response) => {
  try {
    const { userId, gameId } = req.body;

    await db
      .delete(user_favorites)
      .where(
        and(
          eq(user_favorites.gameId, Number(gameId)),
          eq(user_favorites.userId, Number(userId)),
        ),
      );

    return res.status(200).json({ message: "Removed from favorites" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// Get user's favorite games
export const getFavorites = async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    const favorites = await db
      .select({
        gameId: games.id,
        gameName: games.name,
        gameLogo: games.gameLogo,
        gameUrl: games.gameUrl,
        gameApiKey: games.apiKey,
        gameLicenseKey: games.licenseKey,
        userId: users.id,
        username: users.username,
        userFullname: users.fullname,
        userEmail: users.email,
        createdAt: user_favorites.createdAt,
        id: user_favorites.id,
      })
      .from(user_favorites)
      .leftJoin(games, eq(user_favorites.gameId, games.id))
      .leftJoin(users, eq(user_favorites.userId, users.id))
      .where(eq(user_favorites.userId, Number(userId)));

    return res.status(200).json(favorites);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { userType } = req?.query;

    if (!userId && !userType) {
      return res.status(400).json({
        status: false,
        message: "User ID is required",
      });
    }

    let condition;

    if (userType === "admin") {
      condition = sql`${notifications.notificationType} LIKE 'admin_%'`;
    } else {
      condition = sql`FIND_IN_SET(${userId}, ${notifications.playerIds})`;
    }

    // Fetch notifications where status is active
    // and userId is included in the comma-separated playerIds column
    const notificationsList = await db
      .select()
      .from(notifications)
      .where(
        sql`
       ${condition}
        AND ${notifications.status} = 'active'
      `,
      )
      .orderBy(desc(notifications.id));

    return res.json({
      status: true,
      data: notificationsList,
      message: "Notifications fetched successfully",
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

export const updateNotificationStatus = async (req: Request, res: Response) => {
  try {
    const { status, id } = req.body;
    // const { userType } = req?.query;

    if (!status) {
      return res.status(400).json({
        status: false,
        message: "Status is required",
      });
    }

    const result = await db
      .update(notifications)
      .set({
        status,
      })
      .where(eq(notifications.id, Number(id || 0)));

    return res.json({
      status: true,
      data: result,
      message: "Notifications fetched successfully",
    });
  } catch (error) {
    console.error("Fetch notifications error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};
