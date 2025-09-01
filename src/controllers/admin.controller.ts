import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import {
  findAdminByUsernameOrEmail,
  createAdmin,
  getAdminById,
  getAdminsWithFilters,
  updateAdmin,
  deleteAdmin as deleteAdminModel,
  AdminRole,
  getDropdownById,
  getPaginatedDropdowns,
  createPromotion,
  getPromotionById,
  getPaginatedPromotions,
  getPaginatedDropdownOptions,
  getSingleDropdownOptionById,
  updatePromotion,
  getPaginatedAnnouncements,
  deleteById,
  findAdminByRefCode,
  getTotalCount,
  updateGameProvider,
  createGameProvider,
  getPaginatedGameProviders,
  getGameProviderById,
  getAllGameProviders,
  updateGame,
  createGame,
  getGameDetailsById,
  getPaginatedGameList,
  updateSportsProvider,
  createSportsProvider,
  getSportsProviderById,
  getAllSportsProviders,
  getPaginatedSportsProviders,
  updateSport,
  createSport,
  getSportDetailsById,
  getPaginatedSportList,
  getGameSubProviderByGameProviderId,
  getSportSubProviderBySportProviderId,
  getAllMenuProviders,
  getAdminsDetailsByReferCode,
} from "../models/admin.model";
import { db } from "../db/connection";
import {
  adminUsers,
  ambassadors,
  announcements,
  banners,
  dropdownOptions,
  dropdowns,
  events,
  featuredGames,
  game_providers,
  games,
  gamingLicenses,
  responsibleGaming,
  sponsors,
  sports,
  sports_providers,
  users,
  video_advertisement,
  website_popups,
} from "../db/schema";
import {
  and,
  count,
  desc,
  eq,
  gt,
  gte,
  ilike,
  inArray,
  is,
  lt,
  lte,
  ne,
  or,
  sql,
} from "drizzle-orm";
import { generateJwtToken, verifyJwt } from "../utils/jwt";
import { getUsersWithFilters, getUserProfileById } from "../models/user.model";
import * as UAParser from "ua-parser-js";
import { DecodedUser } from "../middlewares/verifyToken";
import { createPromotionRequiredFields } from "../utils/requiredFields";
import { PromotionDataType } from "../utils/types";
import { generateUniqueRefCode } from "../utils/refCode";
import { kyc } from "../db/schema/kyc";

export function getClientIp(req: Request): string {
  const ipSource = {
    xForwardFor: (req.headers["x-forwarded-for"] as string)
      ?.split(",")
      .map((s) => s.trim())[0],
    xRealIp: req.headers["x-real-ip"] as string,
    remoteAddress: req.socket?.remoteAddress,
    remoteAddressConnection: (req.connection as any)?.remoteAddress,
    ip: req.ip,
  };
  console.log({
    ipSource,
    reqAgent: req.headers["user-agent"],
  });
  let ip =
    ipSource.xForwardFor ||
    ipSource.xRealIp ||
    ipSource.remoteAddress ||
    ipSource.remoteAddressConnection ||
    ipSource.ip ||
    "Unknown";

  // Normalize IPv6 localhost
  if (ip === "::1" || ip === "0:0:0:0:0:0:0:1") {
    ip = "127.0.0.1";
  }
  // Remove IPv6 prefix if present (e.g., "::ffff:192.168.1.1")
  if (ip.startsWith("::ffff:")) {
    ip = ip.replace("::ffff:", "");
  }
  return ip;
}

export const adminRegistration = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      username,
      fullname,
      phone,
      email,
      password,
      role,
      country,
      city,
      street,
      minTrx,
      maxTrx,
      currency,
      createdBy,
      status,
      refer_code,
      commission_percent,
    } = req.body;

    const userData = (req as unknown as { user: DecodedUser | null })?.user;
    if (!username || !fullname || !phone || !email || !password || !role) {
      res
        .status(400)
        .json({ status: false, message: "Missing required fields" });
      return;
    }

    const createdByData = (req as any)?.user?.id ?? createdBy;

    if (
      userData?.role === "superAgent" &&
      ["admin", "superAgent", "superAffiliate", "affiliate"].includes(role)
    ) {
      res
        .status(400)
        .json({ status: false, message: `Super agent can't create ${role}` });
      return;
    }

    if (
      userData?.role === "agent" &&
      ["admin", "superAgent", "agent", "superAffiliate", "affiliate"].includes(
        role
      )
    ) {
      res
        .status(400)
        .json({ status: false, message: `Agent can't create ${role}` });
      return;
    }

    if (
      userData?.role === "superAffiliate" &&
      ["admin", "superAgent", "agent", "superAffiliate"].includes(role)
    ) {
      res.status(400).json({
        status: false,
        message: `Super Affiliate can't create ${role}`,
      });
      return;
    }

    if (
      userData?.role === "affiliate" &&
      ["admin", "superAgent", "agent", "superAffiliate", "affiliate"].includes(
        role
      )
    ) {
      res.status(400).json({
        status: false,
        message: `Affiliate can't create ${role}`,
      });
      return;
    }

    const existing =
      (await findAdminByUsernameOrEmail(username)) ||
      (await findAdminByUsernameOrEmail(email));
    if (existing) {
      res
        .status(409)
        .json({ status: false, message: "Admin user already exists" });
      return;
    }
    // Generate unique refCode for this admin
    const uniqueRefCode = await generateUniqueRefCode("admin");
    // If refCode is provided, find the referring admin
    let referred_by = undefined;
    console.log("refer_code", refer_code);
    if (refer_code) {
      const referringAdmin = await findAdminByRefCode(refer_code);
      console.log("referringAdmin", referringAdmin);
      if (
        referringAdmin &&
        referringAdmin.id &&
        referringAdmin?.role === "superAffiliate"
      ) {
        // const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await createAdmin({
          username,
          fullname,
          phone,
          email,
          password: password,
          role: "affiliate",
          country,
          city,
          street,
          minTrx:
            minTrx !== undefined
              ? String(minTrx)
              : referringAdmin?.minTrx
              ? referringAdmin?.minTrx
              : undefined,
          maxTrx:
            maxTrx !== undefined
              ? String(maxTrx)
              : referringAdmin?.maxTrx
              ? referringAdmin?.maxTrx
              : undefined,
          currency: currency ? currency : referringAdmin?.currency,
          createdBy: Number(createdByData) || undefined,
          refCode: uniqueRefCode,
          status,
          referred_by: referringAdmin?.id,
          commission_percent: commission_percent
            ? commission_percent
            : referringAdmin?.commission_percent
            ? referringAdmin?.commission_percent / 2
            : commission_percent,
        });
        res.status(201).json({
          status: true,
          message: "Admin registered successfully",
          data: admin,
        });
      }
    }

    // const hashedPassword = await bcrypt.hash(password, 10);
    const admin = await createAdmin({
      username,
      fullname,
      phone,
      email,
      password: password,
      role,
      country,
      city,
      street,
      minTrx: minTrx !== undefined ? String(minTrx) : undefined,
      maxTrx: maxTrx !== undefined ? String(maxTrx) : undefined,
      currency,
      createdBy: Number(createdByData) || undefined,
      refCode: uniqueRefCode,
      status,
      referred_by,
      commission_percent,
    });
    res.status(201).json({
      status: true,
      message: "Admin registered successfully",
      data: admin,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to register admin", error });
  }
};

export const adminLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userNameOrEmailorPhone, password, userType } = req.body;
    if (!userNameOrEmailorPhone || !password) {
      res.status(400).json({
        status: false,
        message: "Missing username/email/phone or password",
      });
      return;
    }
    const admin = await findAdminByUsernameOrEmail(userNameOrEmailorPhone);
    if (!admin || typeof admin.password !== "string") {
      res.status(401).json({ status: false, message: "Invalid credentials" });
      return;
    }
    const isMatch = password === admin.password;
    if (!isMatch) {
      res.status(401).json({ status: false, message: "Invalid credentials" });
      return;
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
    // Get IP address
    const ip_address = getClientIp(req);

    if (admin.status !== "active") {
      res.status(401).json({ status: false, message: "User is inactive" });
      return;
    }
    if (admin.role === "admin" && userType === "affiliate") {
      res.status(403).json({
        status: false,
        message: "Provide your affiliate credentials!",
      });
      return;
    }
    if (admin.role === "admin" && userType === "agent") {
      res.status(403).json({
        status: false,
        message: "Provide your agent credentials!",
      });
      return;
    }
    if (admin.role !== "admin" && userType === "admin") {
      res.status(403).json({
        status: false,
        message: "Provide your admin credentials!",
      });
      return;
    }

    if (admin.id)
      await db
        .update(adminUsers)
        .set({
          isLoggedIn: true,
          device_type,
          device_name,
          os_version,
          browser,
          browser_version,
          lastIp: ip_address,
          lastLogin: new Date(),
        })
        .where(eq(adminUsers.id, admin.id));

    const token = generateJwtToken({
      id: admin.id,
      email: admin.email,
      username: admin.username,
      role: admin.role,
      userType: "admin",
    });

    res.json({
      status: true,
      message: "Login successful",
      data: admin,
      accessToken: token,
    });
  } catch (error) {
    res.status(500).json({ status: false, message: "Failed to login", error });
  }
};

// Middleware to extract admin from JWT
const getAdminFromToken = async (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyJwt(token);
    if (!decoded?.id) return null;
    const admin = await getAdminById(decoded.id);
    return admin;
  } catch {
    return null;
  }
};

export const adminLogout = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("No token provided");
    (err as any).status = 401;
    throw err;
  }
  const token = authHeader.split(" ")[1];

  const decoded = verifyJwt(token);

  const user = decoded;

  if (!user || !user.id) {
    res.status(401).json({ status: false, message: "Unauthorized" });
    return;
  }
  await db
    .update(adminUsers)
    .set({ isLoggedIn: false })
    .where(eq(adminUsers.id, user.id));
  res.json({ status: true, message: "Logout successful" });
};

export const adminProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const err = new Error("No token provided");
    (err as any).status = 401;
    throw err;
  }
  const token = authHeader.split(" ")[1];

  const decoded = verifyJwt(token);

  const user = decoded;

  if (!user || !user.id) {
    res.status(401).json({ status: false, message: "Unauthorized" });
    return;
  }
  try {
    const admin = await getAdminById(user.id);
    console.log({ admin });

    if (admin?.id) {
      if (admin.status === "active") {
        res.status(200).json({
          status: true,
          message: "Profile fetched successfully",
          data: admin,
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
        data: admin,
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

export const getPlayers = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    playerId,
    phone,
    status,
    keyword,
    page = 1,
    pageSize = 10,
    referred_by_admin_user,
    referred_by,
  } = req.query;

  const userData = (req as unknown as { user: DecodedUser }).user;

  const filters = {
    playerId: playerId ? Number(playerId) : undefined,
    phone: phone as string | undefined,
    status: status as string | undefined,
    keyword: keyword as string | undefined,
    createdBy: userData.role !== "admin" ? userData.id : undefined,
    page: page ? Number(page) : 1,
    pageSize: pageSize ? Number(pageSize) : 10,
    referred_by: Number(referred_by || 0),
    referred_by_admin_user: Number(referred_by_admin_user || 0),
  };
  const result = await getUsersWithFilters(filters);
  res.json({ status: true, data: result });
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        status: false,
        message: "User ID is required",
      });
      return;
    }

    const userId = Number(id);
    if (isNaN(userId)) {
      res.status(400).json({
        status: false,
        message: "Invalid user ID",
      });
      return;
    }

    const userProfile = await getUserProfileById(userId);

    if (!userProfile) {
      res.status(404).json({
        status: false,
        message: "User not found",
      });
      return;
    }

    res.json({
      status: true,
      message: "User profile fetched successfully",
      data: userProfile,
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch user profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

export const getAdmins = async (req: Request, res: Response) => {
  try {
    const { role, page = 1, pageSize = 10, keyword } = req.query;
    const filters = {
      role: role as AdminRole | undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      searchKeyword: keyword as string | undefined,
      roleList: ["admin"] as AdminRole[],
    };
    const result = await getAdminsWithFilters(filters);
    res.json({ status: true, ...result });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to fetch admins", error });
  }
};
export const getDetailsByReferer = async (req: Request, res: Response) => {
  try {
    const { refererCode } = req.params;
    const result = await getAdminsDetailsByReferCode(refererCode);
    if (!result) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Invalid refer code or user not found.",
      });
    }

    return res.status(200).json({
      status: true,
      data: result,
      message: "Referred by user data fetched successfully.",
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: "Failed to fetch referred by user data",
      error,
    });
  }
};

export const getAgents = async (req: Request, res: Response) => {
  try {
    let { role, page = 1, pageSize = 10, keyword, status } = req.query;
    let roles: ("superAgent" | "agent")[] = ["superAgent", "agent"];
    let roleFilter:
      | ("superAgent" | "agent")
      | ("superAgent" | "agent")[]
      | undefined = ["superAgent", "agent"];

    if (role) {
      roleFilter = role as "superAgent" | "agent";
    }

    // Validate and sanitize status
    const validStatuses = ["active", "inactive"];

    // Ensure status is valid
    let statusFilter: "active" | "inactive" | undefined = undefined;
    if (status && validStatuses.includes(status as any)) {
      statusFilter = status as "active" | "inactive";
    }

    const filters = {
      role: roleFilter,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      searchKeyword: keyword as string | undefined,
      roleList: ["superAgent", "agent"] as AdminRole[],
      status: statusFilter,
    };

    const result = await getAdminsWithFilters(filters);
    // If no role is specified, filter the result to only include superAgent and agent
    if (!roleFilter && result?.data) {
      result.data = result.data.filter((admin: any) =>
        roles.includes(admin.role)
      );
    }
    res.json({ status: true, ...result });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to fetch agents", error });
  }
};

export const getAffiliates = async (req: Request, res: Response) => {
  try {
    let { id, role, page = 1, pageSize = 10, keyword, status } = req.query;

    if (id) {
      const affiliate = await getAdminById(Number(id));
      if (!affiliate) {
        return res.status(404).json({
          status: false,
          message: "Affiliate not found",
        });
      }
      return res.json({ status: true, data: affiliate });
    }

    let roles: ("superAffiliate" | "affiliate")[] = [
      "superAffiliate",
      "affiliate",
    ];
    let roleFilter:
      | ("superAffiliate" | "affiliate")
      | ("superAffiliate" | "affiliate")[]
      | undefined = ["superAffiliate", "affiliate"];

    if (role) {
      roleFilter = role as "superAffiliate" | "affiliate";
    }

    // Validate and sanitize status
    const validStatuses = ["active", "inactive"];

    // Ensure status is valid
    let statusFilter: "active" | "inactive" | undefined = undefined;
    if (status && validStatuses.includes(status as any)) {
      statusFilter = status as "active" | "inactive";
    }

    console.log(keyword);

    const filters = {
      role: roleFilter,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      searchKeyword: keyword as string | undefined,
      roleList: ["superAffiliate", "affiliate"] as AdminRole[],
      status: statusFilter,
    };

    const result = await getAdminsWithFilters(filters);
    // If no role is specified, filter the result to only include superAffiliate and affiliate
    if (!roleFilter && result?.data) {
      result.data = result.data.filter((admin: any) =>
        roles.includes(admin.role)
      );
    }
    res.json({ status: true, ...result });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to fetch affiliates", error });
  }
};
export const getSubAffiliatesListByAffiliateId = async (
  req: Request,
  res: Response
) => {
  try {
    const affiliateId = Number(req.params.id);
    if (isNaN(affiliateId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid affiliate ID",
      });
    }

    const { page = 1, pageSize = 10, status } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const limit = Math.max(Number(pageSize), 1);
    const offset = (currentPage - 1) * limit;

    const validStatuses = ["active", "inactive"];
    const statusFilter =
      status && validStatuses.includes(status as string)
        ? (status as "active" | "inactive")
        : undefined;

    const whereClauses = [
      or(
        eq(adminUsers.createdBy, affiliateId),
        eq(adminUsers.referred_by, affiliateId)
      ),
      eq(adminUsers.role, "affiliate"), // ✅ Only include users with role "affiliate"
    ];

    if (statusFilter) {
      whereClauses.push(eq(adminUsers.status, statusFilter));
    }

    const where = and(...whereClauses);

    // Get total count
    const total = await db
      .select({ count: sql`COUNT(*)` })
      .from(adminUsers)
      .where(where)
      .then((rows) => Number(rows[0]?.count || 0));

    // Get paginated data
    const data = await db
      .select()
      .from(adminUsers)
      .where(where)
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      status: true,
      data,
      pagination: {
        page: currentPage,
        pageSize: limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching sub-affiliates:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch sub-affiliates",
      error,
    });
  }
};
export const getPlayersListByAffiliateId = async (
  req: Request,
  res: Response
) => {
  try {
    const affiliateId = Number(req.params.id);
    if (isNaN(affiliateId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid affiliate ID",
      });
    }

    const { page = 1, pageSize = 10, status } = req.query;

    const currentPage = Math.max(Number(page), 1);
    const limit = Math.max(Number(pageSize), 1);
    const offset = (currentPage - 1) * limit;

    const validStatuses = ["active", "inactive"];
    const statusFilter =
      status && validStatuses.includes(status as string)
        ? (status as "active" | "inactive")
        : undefined;

    const whereClauses = [
      or(
        eq(users.referred_by_admin_user, affiliateId),
        eq(users.referred_by, affiliateId)
      ),
    ];

    if (statusFilter) {
      whereClauses.push(eq(users.status, statusFilter));
    }

    const where = and(...whereClauses);

    // Get total count
    const total = await db
      .select({ count: sql`COUNT(*)` })
      .from(users)
      .where(where)
      .then((rows) => Number(rows[0]?.count || 0));

    // Get paginated data
    const data = await db
      .select()
      .from(users)
      .where(where)
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(total / limit);

    return res.json({
      status: true,
      data,
      pagination: {
        page: currentPage,
        pageSize: limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching player list:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch player list",
      error,
    });
  }
};

export const updateAdminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ status: false, message: "Missing admin id" });
      return;
    }
    const updateData = { ...req.body };
    // If password is present, hash it
    // if (updateData.password) {
    //   updateData.password = await bcrypt.hash(updateData.password, 10);
    // }
    const updatedAdmin = await updateAdmin(Number(id), updateData);
    if (!updatedAdmin) {
      res.status(404).json({ status: false, message: "Admin not found" });
      return;
    }
    res.status(200).json({
      status: true,
      message: "Admin updated successfully",
      data: updatedAdmin,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to update admin", error });
  }
};

export const deleteAdmin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ status: false, message: "Missing admin id" });
      return;
    }
    const result = await deleteAdminModel(Number(id));
    if (!result) {
      res
        .status(404)
        .json({ status: false, message: "Admin not found or not deleted" });
      return;
    }
    res
      .status(200)
      .json({ status: true, message: "Admin deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ status: false, message: "Failed to delete admin", error });
  }
};
// ----------------------------
// Configuration-------------------
// ---------------------
export const getDropdownsList = async (req: Request, res: Response) => {
  try {
    const { id, page = 1, pageSize = 10 } = req.query;

    const dropdownId = id ? Number(id) : undefined;

    if (dropdownId) {
      const dropdown = await getDropdownById(dropdownId);
      if (!dropdown) {
        return res.status(404).json({
          status: false,
          message: "Dropdown not found.",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Dropdown fetched successfully.",
        data: dropdown,
      });
    }

    const result = await getPaginatedDropdowns(Number(page), Number(pageSize));

    return res.status(200).json({
      status: true,
      message: "Dropdowns fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching dropdowns:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const addOrUpdateDropdownOption = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, dropdownId, title, status, imgUrl, isMenu } = req.body;
    const userData = (req as unknown as { user: DecodedUser | null })?.user;

    if (!dropdownId || !title) {
      return res.status(400).json({
        status: false,
        message: "Dropdown ID and option title are required.",
      });
    }

    // Check if dropdown exists
    const [dropdown] = await db
      .select()
      .from(dropdowns)
      .where(eq(dropdowns.id, dropdownId));

    if (!dropdown) {
      return res
        .status(404)
        .json({ status: false, message: "Dropdown not found." });
    }

    // If ID is provided, attempt update
    if (id) {
      // Check if the option exists
      const [option] = await db
        .select()
        .from(dropdownOptions)
        .where(eq(dropdownOptions.id, id));

      if (!option) {
        return res
          .status(404)
          .json({ status: false, message: "Option not found." });
      }

      // Case-insensitive duplicate check (for other options)
      const [duplicate] = await db
        .select()
        .from(dropdownOptions)
        .where(
          and(
            eq(dropdownOptions.dropdown_id, dropdownId),
            sql`LOWER(${dropdownOptions.title}) = ${title.toLowerCase()}`,
            sql`${dropdownOptions.id} != ${id}`
          )
        );

      if (duplicate) {
        return res.status(409).json({
          status: false,
          message: "Another option with this title already exists.",
        });
      }

      // Perform update
      await db
        .update(dropdownOptions)
        .set({
          title,
          status: status || option.status,
          imgUrl: imgUrl ?? option.imgUrl,
          isMenu: isMenu === "Yes" ? true : false,
        })
        .where(eq(dropdownOptions.id, id));

      const updatedOption = {
        ...option,
        title,
        status: status || option.status,
        imgUrl: imgUrl ?? option.imgUrl,
        isMenu: isMenu === "Yes" ? true : false,
      };

      return res.status(200).json({
        status: true,
        message: "Option updated successfully.",
        data: updatedOption,
      });
    }

    // Insert logic if ID not provided
    const [existingOption] = await db
      .select()
      .from(dropdownOptions)
      .where(
        and(
          eq(dropdownOptions.dropdown_id, dropdownId),
          eq(dropdownOptions.dropdown_id, dropdownId),
          sql`LOWER(${dropdownOptions.title}) = ${title.toLowerCase()}`
        )
      );

    if (existingOption) {
      return res.status(409).json({
        status: false,
        message: "This option title already exists.",
      });
    }

    await db.insert(dropdownOptions).values({
      title,
      dropdown_id: dropdownId,
      status: status || "inactive",
      created_by: userData?.username ?? "N/A",
      imgUrl: imgUrl,
      isMenu: isMenu === "Yes" ? true : false,
    });

    const allOptions = await db
      .select()
      .from(dropdownOptions)
      .where(eq(dropdownOptions.dropdown_id, dropdownId));

    const response = {
      dropdown_id: dropdown.id,
      name: dropdown.name,
      created_at: dropdown.created_at,
      options: allOptions.map((opt) => ({
        id: opt.id,
        title: opt.title,
        status: opt.status,
        created_at: opt.created_at,
        created_by: opt.created_by,
        imgUrl: opt.imgUrl,
        isMenu: opt.isMenu,
      })),
    };

    return res.status(201).json({
      status: true,
      message: "New option added successfully.",
      data: response,
    });
  } catch (error) {
    console.error("Error adding/updating dropdown option:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

export const deleteDropdownOption = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid dropdown option id",
    });
  }

  try {
    const result = await db
      .delete(dropdownOptions)
      .where(eq(dropdownOptions.id, id));

    return res.status(200).json({
      success: true,
      message: "Dropdown option deleted successfully",
      result,
    });
  } catch (error) {
    console.error("Error deleting dropdown option:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete dropdown option",
      error,
    });
  }
};
export const updateDropdownOptionStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate input
    if (!id || !["active", "inactive"].includes(status)) {
      return res.status(400).json({
        status: false,
        message:
          "Valid option ID and status ('active' or 'inactive') are required.",
      });
    }

    // Check if option exists
    const [existing] = await db
      .select()
      .from(dropdownOptions)
      .where(eq(dropdownOptions.id, Number(id)));

    if (!existing) {
      return res.status(404).json({
        status: false,
        message: "Dropdown option not found.",
      });
    }

    // Update status
    await db
      .update(dropdownOptions)
      .set({ status })
      .where(eq(dropdownOptions.id, Number(id)));

    return res.status(200).json({
      status: true,
      message: "Option status updated successfully.",
      data: {
        id: existing.id,
        previousStatus: existing.status,
        newStatus: status,
      },
    });
  } catch (error) {
    console.error("Error updating dropdown option status:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getDropdownOptionsList = async (req: Request, res: Response) => {
  try {
    const { id, page = 1, pageSize = 10 } = req.query;

    const optionId = id ? Number(id) : undefined;

    if (optionId) {
      const option = await getSingleDropdownOptionById(optionId);
      if (!option) {
        return res.status(404).json({
          status: false,
          message: "Dropdown option not found or inactive.",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Dropdown option fetched successfully.",
        data: option,
      });
    }

    const result = await getPaginatedDropdownOptions(
      Number(page),
      Number(pageSize)
    );

    console.log(result);

    return res.status(200).json({
      status: true,
      message: "Dropdown options fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching dropdown options:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

// ----------------------------
// Promotions-------------------
// ---------------------
export const addOrUpdatePromotion = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const userData = (req as unknown as { user: DecodedUser | null })?.user;

    // Validation
    for (const [field, errorMessage] of Object.entries(
      createPromotionRequiredFields
    )) {
      if (!req.body?.[field]) {
        return res.status(400).json({ status: false, message: errorMessage });
      }
    }

    const {
      id,
      promotionName,
      promotionTypeId,
      status = "inactive",
      dateRange,
      startDate,
      endDate,
      minimumDepositAmount,
      maximumDepositAmount,
      turnoverMultiply,
      bannerImg,
      bonus,
      description,
      isRecommended,
    } = req.body;

    // Normalize bannerImg
    let bannerImgValue: any = "";
    if (Array.isArray(bannerImg)) {
      bannerImgValue = bannerImg;
    } else if (
      typeof bannerImg === "object" &&
      bannerImg !== null &&
      bannerImg.original
    ) {
      bannerImgValue = bannerImg;
    } else if (typeof bannerImg === "string") {
      try {
        bannerImgValue = JSON.parse(bannerImg);
      } catch (error) {
        bannerImgValue = bannerImg;
      }
    }

    // Ensure promotionTypeId is always an array
    const promotionTypeIds: number[] = Array.isArray(promotionTypeId)
      ? promotionTypeId
      : [promotionTypeId];

    // Validate all promotion type IDs
    const validTypeOptions = await db
      .select()
      .from(dropdownOptions)
      .where(
        and(
          inArray(dropdownOptions.id, promotionTypeIds),
          eq(dropdownOptions.status, "active")
        )
      );

    if (validTypeOptions.length !== promotionTypeIds.length) {
      return res.status(400).json({
        status: false,
        message: "One or more promotion type IDs are invalid or inactive.",
      });
    }

    const promotionPayload = {
      promotionName,
      promotionTypeId: promotionTypeIds, // ✅ save as array (JSON)
      status,
      dateRange,
      minimumDepositAmount: parseFloat(minimumDepositAmount),
      maximumDepositAmount: parseFloat(maximumDepositAmount),
      turnoverMultiply: parseInt(turnoverMultiply),
      bannerImg: bannerImgValue,
      bonus: parseInt(bonus),
      description,
      createdBy: userData?.username ?? "N/A",
      isRecommended: isRecommended === true || isRecommended === "true",
    };

    if (id) {
      await updatePromotion(id, promotionPayload);
      return res.status(200).json({
        status: true,
        message: "Promotion updated successfully.",
        data: promotionPayload,
      });
    } else {
      await createPromotion(promotionPayload);
      return res.status(201).json({
        status: true,
        message: "Promotion created successfully.",
      });
    }
  } catch (error: any) {
    console.error("Error in addOrUpdatePromotion:", error);

    if (error.message === "DUPLICATE_PROMOTION") {
      return res
        .status(409)
        .json({ status: false, message: "Promotion name already exists." });
    }

    if (error.message === "INVALID_PROMOTION_TYPE") {
      return res.status(400).json({
        status: false,
        message: "Invalid or inactive promotion type.",
      });
    }

    return res
      .status(500)
      .json({ status: false, message: "Internal server error." });
  }
};

export const getPromotionsList = async (req: Request, res: Response) => {
  try {
    const { id, page = 1, pageSize = 10 } = req.query;

    const promotionId = id ? Number(id) : undefined;

    if (promotionId) {
      const promotion = await getPromotionById(promotionId);
      if (!promotion) {
        return res.status(404).json({
          status: false,
          message: "Promotion not found.",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Promotion fetched successfully.",
        data: promotion,
      });
    }

    const result = await getPaginatedPromotions(Number(page), Number(pageSize));

    return res.status(200).json({
      status: true,
      message: "Promotion fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching promotion:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
// cms
export const createUpdateBanners = async (req: Request, res: Response) => {
  try {
    const { id, images, dateRange, status, title } = req.body;
    // Generate title if missing or not a string
    const finalTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim()
        : `Banner - ${Math.floor(1000 + Math.random() * 9000)}`;

    // Basic validation
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Images array is required and cannot be empty.",
      });
    }

    const validatedStatus = status === "active" ? "active" : "inactive";

    const payload = {
      images: JSON.stringify(images),
      dateRange: dateRange || null,
      status: validatedStatus as "active" | "inactive",
      title: title,
    };

    if (id) {
      // Update existing banner
      await db.update(banners).set(payload).where(eq(banners.id, id));

      return res.status(200).json({
        status: true,
        message: "Banner updated successfully.",
      });
    } else {
      // Create new banner
      await db.insert(banners).values({ ...payload, title: finalTitle });

      return res.status(201).json({
        status: true,
        message: "Banner created successfully.",
      });
    }
  } catch (error) {
    console.error("createUpdateBanners error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getAllBanners = async (req: Request, res: Response) => {
  try {
    const result = await db
      .select()
      .from(banners)
      .orderBy(desc(banners.createdAt));

    const parsed = result.map((banner) => ({
      ...banner,
      images: JSON.parse(banner.images),
    }));

    return res.status(200).json({
      status: true,
      data: parsed,
      message: "Banner data fetched successfully.",
    });
  } catch (error) {
    console.error("getAllBanners error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const createUpdateEvent = async (req: Request, res: Response) => {
  try {
    const { id, image, status, title, sportId } = req.body;

    if (!sportId) {
      return res.status(400).json({
        status: false,
        message: "Sport ID is required.",
      });
    }

    // Generate title if missing or not a string
    const finalTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim()
        : `Event - ${Math.floor(1000 + Math.random() * 9000)}`;

    // Basic validation for single image object
    if (!image || typeof image !== "object") {
      return res.status(400).json({
        status: false,
        message: "Image object is required.",
      });
    }

    const validatedStatus = status === "active" ? "active" : "inactive";

    const payload = {
      images: JSON.stringify(image), // store as array of one for consistency
      status: validatedStatus as "active" | "inactive",
      title: finalTitle,
      sportId: sportId,
    };

    if (id) {
      await db.update(events).set(payload).where(eq(events.id, id));
      return res
        .status(200)
        .json({ status: true, message: "Event updated successfully." });
    } else {
      await db.insert(events).values(payload);
      return res
        .status(201)
        .json({ status: true, message: "Event created successfully." });
    }
  } catch (error) {
    console.error("createOrUpdateEvent error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const result = await db
      .select({
        id: events.id,
        title: events.title,
        sportId: events.sportId,
        images: events.images,
        createdAt: events.createdAt,
        sportName: sports.name,
        status: events.status,
      })
      .from(events)
      .leftJoin(sports, eq(events.sportId, sports.id))
      .orderBy(desc(events.createdAt));

    // Safely parse images
    const parsed = result.map((event) => ({
      ...event,
      images: event.images ? JSON.parse(event.images) : [],
    }));

    return res.status(200).json({
      status: true,
      data: parsed,
      message: "Events data fetched successfully.",
    });
  } catch (error) {
    console.error("getAllEvents error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const createUpdateFeaturedGame = async (req: Request, res: Response) => {
  try {
    const { image, status, title, gameId } = req.body;

    if (!gameId) {
      return res.status(400).json({
        status: false,
        message: "Game ID is required.",
      });
    }

    // Generate title if missing or not a string
    const finalTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim()
        : `Event - ${Math.floor(1000 + Math.random() * 9000)}`;

    // Basic validation for single image object
    if (!image || typeof image !== "object") {
      return res.status(400).json({
        status: false,
        message: "Image object is required.",
      });
    }

    const validatedStatus = status === "active" ? "active" : "inactive";

    const payload = {
      images: JSON.stringify(image), // store as array of one for consistency
      status: validatedStatus as "active" | "inactive",
      title: finalTitle,
      gameId: gameId,
    };

    // Check if a row already exists
    const existing = await db.select().from(featuredGames).limit(1);

    if (existing.length > 0) {
      // Update the existing row (id = 1)
      await db
        .update(featuredGames)
        .set(payload)
        .where(eq(featuredGames.id, existing[0].id));
      return res
        .status(200)
        .json({ status: true, message: "Featured game updated successfully." });
    } else {
      // Insert a new row with id = 1
      await db.insert(featuredGames).values({ id: 1, ...payload });
      return res
        .status(201)
        .json({ status: true, message: "Featured game created successfully." });
    }
  } catch (error) {
    console.error("create or update featured games error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const getFeaturedGame = async (req: Request, res: Response) => {
  try {
    const result = await db
      .select({
        id: featuredGames.id,
        title: featuredGames.title,
        gameId: featuredGames.gameId,
        images: featuredGames.images,
        createdAt: featuredGames.createdAt,
        gameName: games.name,
        status: featuredGames.status,
      })
      .from(featuredGames)
      .leftJoin(games, eq(featuredGames.gameId, games.id))
      .where(eq(featuredGames.id, 1)) // always fetch id = 1
      .limit(1); // optional but safe

    if (result.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Featured game not found.",
      });
    }

    const featuredGame = {
      ...result[0],
      images: result[0].images ? JSON.parse(result[0].images) : [],
    };

    return res.status(200).json({
      status: true,
      data: featuredGame,
      message: "Featured game fetched successfully.",
    });
  } catch (error) {
    console.error("getFeaturedGame error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const createOrUpdateAnnouncement = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, description, status, title, dateRange } = req.body;

    if (!description || typeof description !== "string") {
      return res.status(400).json({
        status: false,
        message: "Announcement description is required.",
      });
    }

    const validatedStatus = status === "active" ? "active" : "inactive";

    // Generate title if missing or not a string
    const finalTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim()
        : `Announcement - ${Math.floor(1000 + Math.random() * 9000)}`;

    if (id) {
      // If status is active, set all others to inactive first
      if (validatedStatus === "active") {
        await db
          .update(announcements)
          .set({ status: "inactive" })
          .where(ne(announcements.id, id));
      }

      // Update the specific announcement
      await db
        .update(announcements)
        .set({ description, status: validatedStatus })
        .where(eq(announcements.id, id));

      return res.status(200).json({
        status: true,
        message: "Announcement updated successfully.",
      });
    } else {
      const totalCount = await getTotalCount(announcements);

      if (totalCount >= 10) {
        return res.status(400).json({
          status: false,
          message: "You cannot create more than 10 announcements.",
        });
      }

      // If status is active, set all others to inactive first
      if (validatedStatus === "active") {
        await db.update(announcements).set({ status: "inactive" });
      }

      // Create new announcement
      await db.insert(announcements).values({
        description,
        status: validatedStatus,
        title: finalTitle || "",
        dateRange: dateRange,
      });

      return res.status(201).json({
        status: true,
        message: "Announcement created successfully.",
      });
    }
  } catch (error) {
    console.error("createOrUpdateAnnouncement error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getAllAnnouncements = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const result = await getPaginatedAnnouncements(
      Number(page),
      Number(pageSize)
    );

    return res.status(200).json({
      status: true,
      message: "Announcements fetched successfully.",
      data: result.rows,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid Announcement ID." });
  }

  const result = await deleteById(announcements, id);

  if (!result.success) {
    return res.status(404).json({ status: false, message: result.message });
  }

  return res.status(200).json({ status: true, message: result.message });
};

export const createOrUpdateWebsitePopup = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, message, status, title, dateRange } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        status: false,
        message: "Popup description (HTML) is required.",
      });
    }

    const validatedStatus = status === "active" ? "active" : "inactive";

    const finalTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim()
        : `Popup - ${Math.floor(1000 + Math.random() * 9000)}`;

    if (id) {
      if (validatedStatus === "active") {
        await db
          .update(website_popups)
          .set({ status: "inactive" })
          .where(ne(website_popups.id, id));
      }

      await db
        .update(website_popups)
        .set({ message, status: validatedStatus, title: finalTitle })
        .where(eq(website_popups.id, id));

      return res.status(200).json({
        status: true,
        message: "Website popup updated successfully.",
      });
    } else {
      const totalCount = await getTotalCount(website_popups);

      if (totalCount >= 10) {
        return res.status(400).json({
          status: false,
          message: "You cannot create more than 10 website popups.",
        });
      }

      if (validatedStatus === "active") {
        await db.update(website_popups).set({ status: "inactive" });
      }

      await db.insert(website_popups).values({
        message,
        status: validatedStatus,
        title: finalTitle,
        dateRange,
      });

      return res.status(201).json({
        status: true,
        message: "Website popup created successfully.",
      });
    }
  } catch (error) {
    console.error("createOrUpdateWebsitePopup error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const getAllWebsitePopups = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);

    const rows = await db
      .select()
      .from(website_popups)
      .limit(Number(pageSize))
      .offset(offset)
      .orderBy(desc(website_popups.id));

    const totalCount = await getTotalCount(website_popups);

    return res.status(200).json({
      status: true,
      message: "Website popups fetched successfully.",
      data: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(pageSize)),
      },
    });
  } catch (error) {
    console.error("Error fetching website popups:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const deletePopup = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid popup ID." });
  }

  const result = await deleteById(website_popups, id);

  if (!result.success) {
    return res.status(404).json({ status: false, message: result.message });
  }

  return res.status(200).json({ status: true, message: result.message });
};

export const createOrUpdateVideoAdvertisement = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, description, videoUrl, status, title, dateRange } = req.body;

    if (!title || typeof title !== "string") {
      return res.status(400).json({
        status: false,
        message: "Advertisement title is required.",
      });
    }

    const validatedStatus = status === "active" ? "active" : "inactive";

    const finalTitle =
      typeof title === "string" && title.trim().length > 0
        ? title.trim()
        : `Advertisement - ${Math.floor(1000 + Math.random() * 9000)}`;

    if (id) {
      if (validatedStatus === "active") {
        await db
          .update(video_advertisement)
          .set({ status: "inactive" })
          .where(ne(video_advertisement.id, id));
      }

      await db
        .update(video_advertisement)
        .set({ description, status: validatedStatus, title: finalTitle })
        .where(eq(video_advertisement.id, id));

      return res.status(200).json({
        status: true,
        message: "Website advertisement updated successfully.",
      });
    } else {
      const totalCount = await getTotalCount(video_advertisement);

      if (totalCount >= 10) {
        return res.status(400).json({
          status: false,
          message: "You cannot create more than 10 website advertisement.",
        });
      }

      if (validatedStatus === "active") {
        await db.update(video_advertisement).set({ status: "inactive" });
      }

      await db.insert(video_advertisement).values({
        videoUrl,
        description,
        status: validatedStatus,
        title: finalTitle,
        dateRange,
      });

      return res.status(201).json({
        status: true,
        message: "Website advertisement created successfully.",
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const getAllVideoAdvertisement = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);

    const rows = await db
      .select()
      .from(video_advertisement)
      .limit(Number(pageSize))
      .offset(offset)
      .orderBy(desc(video_advertisement.id));

    const totalCount = await getTotalCount(video_advertisement);

    return res.status(200).json({
      status: true,
      message: "Website advertisement fetched successfully.",
      data: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(pageSize)),
      },
    });
  } catch (error) {
    console.error("Error fetching website advertisement:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const deleteAdvertisement = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid advertisement ID." });
  }

  const result = await deleteById(video_advertisement, id);

  if (!result.success) {
    return res.status(404).json({ status: false, message: result.message });
  }

  return res.status(200).json({ status: true, message: result.message });
};

export const createOrUpdateSponsor = async (req: Request, res: Response) => {
  try {
    const { id, name, logo, companyType, description, duration, status } =
      req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Sponsor name is required." });
    }

    if (!logo || typeof logo !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Sponsor logo is required." });
    }

    if (!companyType || typeof companyType !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Company type is required." });
    }

    if (!duration || typeof duration !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Sponsor duration is required." });
    }

    const validatedStatus = status === "active" ? "active" : "inactive";

    if (id) {
      await db
        .update(sponsors)
        .set({
          name,
          logo,
          companyType,
          description,
          duration,
          status: validatedStatus,
        })
        .where(eq(sponsors.id, id));

      return res
        .status(200)
        .json({ status: true, message: "Sponsor updated successfully." });
    } else {
      await db.insert(sponsors).values({
        name,
        logo,
        companyType,
        description,
        duration,
        status: validatedStatus,
      });

      return res
        .status(201)
        .json({ status: true, message: "Sponsor created successfully." });
    }
  } catch (error) {
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

export const getAllSponsors = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);

    const rows = await db
      .select()
      .from(sponsors)
      .limit(Number(pageSize))
      .offset(offset)
      .orderBy(desc(sponsors.id));

    const totalCount = await getTotalCount(sponsors);

    return res.status(200).json({
      status: true,
      message: "Sponsors fetched successfully.",
      data: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(pageSize)),
      },
    });
  } catch (error) {
    console.error("Error fetching sponsors:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const deleteSponsor = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid sponsor ID." });
  }

  const result = await deleteById(sponsors, id);

  if (!result.success) {
    return res.status(404).json({ status: false, message: result.message });
  }

  return res.status(200).json({ status: true, message: result.message });
};

export const createOrUpdateAmbassador = async (req: Request, res: Response) => {
  try {
    const { id, name, photo, signature, description, duration, status } =
      req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Ambassador name is required." });
    }
    if (!photo || typeof photo !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Ambassador photo is required." });
    }
    if (!signature || typeof signature !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Ambassador signature is required." });
    }
    if (!duration || typeof duration !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Duration is required." });
    }

    const validatedStatus = status === "active" ? "active" : "inactive";

    if (id) {
      // Update existing ambassador
      await db
        .update(ambassadors)
        .set({
          name,
          photo,
          signature,
          description,
          duration,
          status: validatedStatus,
        })
        .where(eq(ambassadors.id, id));

      return res
        .status(200)
        .json({ status: true, message: "Ambassador updated successfully." });
    } else {
      // Create new ambassador
      await db.insert(ambassadors).values({
        name,
        photo,
        signature,
        description,
        duration,
        status: validatedStatus,
      });

      return res
        .status(201)
        .json({ status: true, message: "Ambassador created successfully." });
    }
  } catch (error) {
    console.error("Error creating/updating ambassador:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};
export const getAllAmbassador = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);

    const rows = await db
      .select()
      .from(ambassadors)
      .limit(Number(pageSize))
      .offset(offset)
      .orderBy(desc(ambassadors.id));

    const totalCount = await getTotalCount(ambassadors);

    return res.status(200).json({
      status: true,
      message: "Ambassadors fetched successfully.",
      data: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(pageSize)),
      },
    });
  } catch (error) {
    console.error("Error fetching ambassadors:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const deleteAmbassador = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid ambassador ID." });
  }

  const result = await deleteById(ambassadors, id);

  if (!result.success) {
    return res.status(404).json({ status: false, message: result.message });
  }

  return res.status(200).json({ status: true, message: result.message });
};

export const createOrUpdateGamingLicenses = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, name, icon, duration, status } = req.body;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Gaming license name is required." });
    }
    if (!icon || typeof icon !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Gaming license icon is required." });
    }

    const validatedStatus = status === "active" ? "active" : "inactive";

    if (id) {
      // Update existing GamingLicenses
      await db
        .update(gamingLicenses)
        .set({
          name,
          icon,
          duration,
          status: validatedStatus,
        })
        .where(eq(gamingLicenses.id, id));

      return res.status(200).json({
        status: true,
        message: "Gaming license updated successfully.",
      });
    } else {
      // Create new ambassador
      await db.insert(gamingLicenses).values({
        name,
        icon,
        duration,
        status: validatedStatus,
      });

      return res.status(201).json({
        status: true,
        message: "Gaming license created successfully.",
      });
    }
  } catch (error) {
    console.error("Error creating/updating Gaming license:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};
export const getAllGamingLicenses = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);

    const rows = await db
      .select()
      .from(gamingLicenses)
      .limit(Number(pageSize))
      .offset(offset)
      .orderBy(desc(gamingLicenses.id));

    const totalCount = await getTotalCount(gamingLicenses);

    return res.status(200).json({
      status: true,
      message: "Gaming license fetched successfully.",
      data: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(pageSize)),
      },
    });
  } catch (error) {
    console.error("Error fetching gaming license:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const deleteGamingLicenses = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid gaming license ID." });
  }

  const result = await deleteById(gamingLicenses, id);

  if (!result.success) {
    return res.status(404).json({ status: false, message: result.message });
  }

  return res.status(200).json({ status: true, message: result.message });
};

export const createOrUpdateResponsibleGaming = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, name, icon, duration, status } = req.body;

    if (!name || typeof name !== "string") {
      return res.status(400).json({
        status: false,
        message: "Responsible gaming name is required.",
      });
    }
    if (!icon || typeof icon !== "string") {
      return res.status(400).json({
        status: false,
        message: "Responsible gaming icon is required.",
      });
    }

    const validatedStatus = status === "active" ? "active" : "inactive";

    if (id) {
      // Update existing responsibleGaming
      await db
        .update(responsibleGaming)
        .set({
          name,
          icon,
          duration,
          status: validatedStatus,
        })
        .where(eq(responsibleGaming.id, id));

      return res.status(200).json({
        status: true,
        message: "Responsible gaming updated successfully.",
      });
    } else {
      // Create new ambassador
      await db.insert(responsibleGaming).values({
        name,
        icon,
        duration,
        status: validatedStatus,
      });

      return res.status(201).json({
        status: true,
        message: "Responsible gaming created successfully.",
      });
    }
  } catch (error) {
    console.error("Error creating/updating responsible gaming:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};
export const getAllResponsibleGaming = async (req: Request, res: Response) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;

    const offset = (Number(page) - 1) * Number(pageSize);

    const rows = await db
      .select()
      .from(responsibleGaming)
      .limit(Number(pageSize))
      .offset(offset)
      .orderBy(desc(responsibleGaming.id));

    const totalCount = await getTotalCount(responsibleGaming);

    return res.status(200).json({
      status: true,
      message: "Responsible gaming fetched successfully.",
      data: rows,
      pagination: {
        page: Number(page),
        pageSize: Number(pageSize),
        total: totalCount,
        totalPages: Math.ceil(totalCount / Number(pageSize)),
      },
    });
  } catch (error) {
    console.error("Error fetching responsible gaming:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const deleteResponsibleGaming = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    return res
      .status(400)
      .json({ status: false, message: "Invalid responsible gaming ID." });
  }

  const result = await deleteById(responsibleGaming, id);

  if (!result.success) {
    return res.status(404).json({ status: false, message: result.message });
  }

  return res.status(200).json({ status: true, message: result.message });
};

// game provider
export const addOrUpdateGameProvider = async (req: Request, res: Response) => {
  try {
    const userData = (req as unknown as { user: DecodedUser | null })?.user;

    const requiredFields = {
      name: "Name is required",
      minBalanceLimit: "Minimum balance limit is required",
      providerIp: "Provider IP is required",
      licenseKey: "License Key is required",
      phone: "Phone number is required",
      email: "Email is required",
      country: "Country is required",
      logo: "Logo is required",
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!req.body?.[field]) {
        return res.status(400).json({ status: false, message });
      }
    }

    const {
      id,
      name,
      parentId,
      status = "inactive",
      minBalanceLimit,
      providerIp,
      licenseKey,
      phone,
      email,
      whatsapp,
      telegram,
      country,
      logo,
      isMenu,
      icon,
    } = req.body;

    const payload = {
      name,
      parentId: Number(parentId) || null,
      status,
      minBalanceLimit: parseFloat(minBalanceLimit).toFixed(2),
      providerIp,
      licenseKey,
      phone,
      email,
      whatsapp: whatsapp || "",
      telegram: telegram || "",
      country,
      logo,
      createdBy: userData?.username ?? "N/A",
      parentName: "",
      isMenu: isMenu || false,
      icon: icon || null,
    };

    // Add parentName if parentId is provided
    if (payload.parentId) {
      const [parentProvider] = await db
        .select({ name: game_providers.name })
        .from(game_providers)
        .where(eq(game_providers.id, payload.parentId));

      if (parentProvider) {
        payload.parentName = parentProvider.name;
      } else {
        return res.status(400).json({
          status: false,
          message: "Invalid parent provider ID",
        });
      }
    }

    if (id) {
      await updateGameProvider(Number(id), payload);
      return res.status(200).json({
        status: true,
        message: "Game provider updated successfully",
        data: payload,
      });
    } else {
      await createGameProvider(payload);
      return res.status(201).json({
        status: true,
        message: "Game provider created successfully",
      });
    }
  } catch (error: any) {
    console.error("Error in addOrUpdateGameProvider:", error);

    if (error.message === "DUPLICATE_NAME") {
      return res
        .status(409)
        .json({ status: false, message: "Game provider name already exists." });
    }

    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};
export const getGameProvidersList = async (req: Request, res: Response) => {
  try {
    const {
      id,
      page = 1,
      pageSize = 10,
      publicList,
      isParent,
      parentId,
    } = req.query;

    const providerId = id ? Number(id) : undefined;
    const isParentBool = isParent === "true";
    if (providerId) {
      const provider = await getGameProviderById(providerId);
      if (!provider) {
        return res.status(404).json({
          status: false,
          message: "Game provider not found.",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Game provider fetched successfully.",
        data: provider,
      });
    }

    if (parentId) {
      const allSubProviders = await getGameSubProviderByGameProviderId(
        Number(parentId)
      );
      return res.status(200).json({
        status: true,
        message: "All sub game providers fetched successfully.",
        data: allSubProviders,
      });
    }

    if (publicList === "true") {
      const allProviders = await getAllGameProviders(isParentBool);
      return res.status(200).json({
        status: true,
        message: "All game providers fetched successfully.",
        data: allProviders,
      });
    }

    const result = await getPaginatedGameProviders(
      Number(page),
      Number(pageSize),
      Number(parentId)
    );

    return res.status(200).json({
      status: true,
      message: "Game providers fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching game providers:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
export const addOrUpdateGame = async (req: Request, res: Response) => {
  const userData = (req as unknown as { user: DecodedUser | null })?.user;

  const requiredFields = {
    name: "Game name is required",
    apiKey: "API Key is required",
    licenseKey: "License Key is required",
    gameLogo: "Game Logo is required",
    secretPin: "Secret Pin is required",
    gameUrl: "Game URL is required",
    ggrPercent: "GGR Percent is required",
    categoryId: "Category is required",
    providerId: "Game Provider is required",
  };

  for (const [field, message] of Object.entries(requiredFields)) {
    if (!req.body?.[field]) {
      return res.status(400).json({ status: false, message });
    }
  }
  try {
    const userData = (req as any)?.user;
    const {
      id,
      name,
      parentId,
      status = "inactive",
      apiKey,
      licenseKey,
      gameLogo,
      secretPin,
      gameUrl,
      ggrPercent,
      categoryId,
      providerId,
      createdBy,
      isExclusive,
    } = req.body;

    const createdByData = userData?.username ?? createdBy;

    const payload = {
      name,
      parentId: Number(parentId) || null,
      status,
      apiKey,
      licenseKey,
      gameLogo,
      secretPin,
      gameUrl,
      ggrPercent,
      categoryId: Number(categoryId),
      providerId: Number(providerId),
      createdBy: createdByData,
      isExclusive,
    };

    if (id) {
      await updateGame(Number(id), payload);
      return res.status(200).json({
        status: true,
        message: "Game updated successfully",
      });
    } else {
      await createGame(payload);
      return res.status(201).json({
        status: true,
        message: "Game created successfully",
      });
    }
  } catch (error: any) {
    console.error("Error in addOrUpdateGame:", error);
    if (error.message === "DUPLICATE_NAME") {
      return res
        .status(409)
        .json({ status: false, message: "Game name already exists." });
    }
    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};

export const getGameList = async (req: Request, res: Response) => {
  try {
    const { id, page = 1, pageSize = 10 } = req.query;

    const gameId = id ? Number(id) : undefined;
    if (gameId) {
      const gameDetails = await getGameDetailsById(Number(gameId));
      if (!gameDetails) {
        return res.status(404).json({
          status: false,
          message: "Game not found.",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Game fetched successfully.",
        data: gameDetails,
      });
    }

    const result = await getPaginatedGameList(Number(page), Number(pageSize));

    return res.status(200).json({
      status: true,
      message: "Game list fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching game list:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

// sports provider
export const addOrUpdateSportsProvider = async (
  req: Request,
  res: Response
) => {
  try {
    const userData = (req as unknown as { user: DecodedUser | null })?.user;

    const requiredFields = {
      name: "Name is required",
      minBalanceLimit: "Minimum balance limit is required",
      providerIp: "Provider IP is required",
      licenseKey: "License Key is required",
      phone: "Phone number is required",
      email: "Email is required",
      country: "Country is required",
      logo: "Logo is required",
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!req.body?.[field]) {
        return res.status(400).json({ status: false, message });
      }
    }

    const {
      id,
      name,
      parentId,
      status = "inactive",
      minBalanceLimit,
      providerIp,
      licenseKey,
      phone,
      email,
      whatsapp,
      telegram,
      country,
      logo,
      isMenu,
      icon,
    } = req.body;

    const payload = {
      name,
      parentId: Number(parentId) || null,
      status,
      minBalanceLimit: parseFloat(minBalanceLimit).toFixed(2),
      providerIp,
      licenseKey,
      phone,
      email,
      whatsapp: whatsapp || "",
      telegram: telegram || "",
      country,
      logo,
      createdBy: userData?.username ?? "N/A",
      parentName: "",
      isMenu: isMenu || false,
      icon: icon || null,
    };

    // Add parentName if parentId is provided
    if (payload.parentId) {
      const [parentProvider] = await db
        .select({ name: sports_providers.name })
        .from(sports_providers)
        .where(eq(sports_providers.id, payload.parentId));

      if (parentProvider) {
        payload.parentName = parentProvider.name;
      } else {
        return res.status(400).json({
          status: false,
          message: "Invalid parent provider ID",
        });
      }
    }

    if (id) {
      await updateSportsProvider(Number(id), payload);
      return res.status(200).json({
        status: true,
        message: "Sports provider updated successfully",
        data: payload,
      });
    } else {
      await createSportsProvider(payload);
      return res.status(201).json({
        status: true,
        message: "Sports provider created successfully",
      });
    }
  } catch (error: any) {
    console.error("Error in add or update sports provider:", error);

    if (error.message === "DUPLICATE_NAME") {
      return res.status(409).json({
        status: false,
        message: "Sports provider name already exists.",
      });
    }

    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};
export const getSportsProvidersList = async (req: Request, res: Response) => {
  try {
    const {
      id,
      page = 1,
      pageSize = 10,
      publicList,
      isParent,
      parentId,
    } = req.query;

    const providerId = id ? Number(id) : undefined;
    const isParentBool = isParent === "true";
    if (providerId) {
      const provider = await getSportsProviderById(providerId);
      if (!provider) {
        return res.status(404).json({
          status: false,
          message: "Sports provider not found.",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Sports provider fetched successfully.",
        data: provider,
      });
    }

    if (parentId) {
      const allSubProviders = await getSportSubProviderBySportProviderId(
        Number(parentId)
      );
      return res.status(200).json({
        status: true,
        message: "All sub sport providers fetched successfully.",
        data: allSubProviders,
      });
    }

    if (publicList === "true") {
      const allProviders = await getAllSportsProviders(isParentBool);
      return res.status(200).json({
        status: true,
        message: "All sports providers fetched successfully.",
        data: allProviders,
      });
    }

    const result = await getPaginatedSportsProviders(
      Number(page),
      Number(pageSize),
      parentId
    );

    return res.status(200).json({
      status: true,
      message: "Sports providers fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching sports providers:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
export const addOrUpdateSport = async (req: Request, res: Response) => {
  try {
    const userData = (req as unknown as { user: DecodedUser | null })?.user;

    const requiredFields = {
      name: "Sport name is required",
      apiKey: "API Key is required",
      licenseKey: "License Key is required",
      sportLogo: "Sport Logo is required",
      secretPin: "Secret Pin is required",
      sportUrl: "Sport URL is required",
      ggrPercent: "GGR Percent is required",
      categoryId: "Category is required",
      providerId: "Sport Provider is required",
    };

    for (const [field, message] of Object.entries(requiredFields)) {
      if (!req.body?.[field]) {
        return res.status(400).json({ status: false, message });
      }
    }

    const {
      id,
      name,
      parentId,
      status = "inactive",
      apiKey,
      licenseKey,
      sportLogo,
      secretPin,
      sportUrl,
      ggrPercent,
      categoryId,
      providerId,
      createdBy,
      isExclusive,
    } = req.body;

    const createdByData = (req as any)?.user?.username ?? createdBy;
    const payload: any = {
      name,
      parentId: Number(parentId) || null,
      status,
      apiKey,
      licenseKey,
      sportLogo,
      secretPin,
      sportUrl,
      ggrPercent,
      createdBy: Number(createdByData) || undefined,
      categoryId: Number(categoryId),
      providerId: Number(providerId),
      isExclusive,
    };

    if (id) {
      await updateSport(Number(id), payload);
      return res.status(200).json({
        status: true,
        message: "Sport updated successfully",
        data: payload,
      });
    } else {
      await createSport(payload);
      return res.status(201).json({
        status: true,
        message: "Sport created successfully",
      });
    }
  } catch (error: any) {
    console.error("Error in add or update sport:", error);

    if (error.message === "DUPLICATE_NAME") {
      return res
        .status(409)
        .json({ status: false, message: "Sport name already exists." });
    }

    return res
      .status(500)
      .json({ status: false, message: "Internal server error" });
  }
};
export const getSportList = async (req: Request, res: Response) => {
  try {
    const { id, page = 1, pageSize = 10, status, name, publicList } = req.query;

    const sportId = id ? Number(id) : undefined;
    if (sportId) {
      const sportDetails = await getSportDetailsById(sportId);
      if (!sportDetails) {
        return res.status(404).json({
          status: false,
          message: "Sport not found.",
        });
      }

      return res.status(200).json({
        status: true,
        message: "Sport fetched successfully.",
        data: sportDetails,
      });
    }

    const validSearchKeyword = (name as string) || "";
    const validStatus =
      status === "active"
        ? "active"
        : status === "inactive"
        ? "inactive"
        : undefined;

    const validPublicList = publicList === "true" ? true : false;
    const result = await getPaginatedSportList(
      Number(page),
      Number(pageSize),
      validSearchKeyword,
      validStatus,
      validPublicList
    );

    return res.status(200).json({
      status: true,
      message: "Sport list fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching sport list:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getMenuProviders = async (req: Request, res: Response) => {
  try {
    const result = await getAllMenuProviders();
    return res.status(200).json({
      status: true,
      message: "Menu providers fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching menu providers:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
export const updateMenuPriority = async (req: Request, res: Response) => {
  try {
    const {
      id,
      type,
      currentPosition,
      updatedPosition,
      updatedStatus = false,
    } = req.body;

    let table;
    if (type === "game") table = game_providers;
    else if (type === "sports") table = sports_providers;
    else if (type === "category") table = dropdownOptions;
    else {
      return res.status(400).json({ status: false, message: "Invalid type." });
    }

    if (updatedStatus) {
      if (id) {
        const validStatus = updatedStatus === "active" ? true : false;
        const payload = { isMenu: validStatus };
        await updateGameProvider(Number(id), payload);
        await updateSportsProvider(Number(id), payload);
        // Update status
        await db
          .update(dropdownOptions)
          .set(payload)
          .where(eq(dropdownOptions.id, Number(id)));
        return res.status(200).json({
          status: true,
          message: "Menu status updated successfully",
          data: payload,
        });
      } else {
        return res.status(400).json({
          status: false,
          message: "ID is required for status update.",
        });
      }
    }

    if (!updatedPosition) {
      return res.status(400).json({
        status: false,
        message: "Updated position is required.",
      });
    }

    // Function to swap menuPriority if it exists
    const swapMenuPriorityIfExists = async (
      table: any,
      updatedPosition: number,
      currentPosition: number
    ) => {
      const existingItem = await db
        .select()
        .from(table)
        .where(eq(table.menuPriority, updatedPosition))
        .execute();

      if (existingItem.length > 0) {
        await db
          .update(table)
          .set({ menuPriority: currentPosition })
          .where(eq(table.id, existingItem[0].id));
      }
    };

    // Check all 3 tables for the updatedPosition
    if (currentPosition !== 0) {
      await swapMenuPriorityIfExists(
        game_providers,
        updatedPosition,
        currentPosition
      );
      await swapMenuPriorityIfExists(
        sports_providers,
        updatedPosition,
        currentPosition
      );
      await swapMenuPriorityIfExists(
        dropdownOptions,
        updatedPosition,
        currentPosition
      );
    }

    // Update the menu being moved
    await db
      .update(table)
      .set({ menuPriority: updatedPosition })
      .where(eq(table.id, id));

    return res.status(200).json({
      status: true,
      message: "Menu priority updated successfully",
    });
  } catch (error) {
    console.error("Error updating menu priority:", error);
    return res.status(500).json({ status: false, message: "Server error" });
  }
};

export const createUpdateKyc = async (req: Request, res: Response) => {
  try {
    const {
      id,
      documentType,
      documentNo,
      expiryDate,
      documentFront,
      documentBack,
      selfie,
      holderId,
      holderType,
      status,
      dob,
      fullName,
    } = req.body;

    // ---------------------- Validation ----------------------
    if (!documentType || typeof documentType !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Document type is required." });
    }
    if (!fullName || typeof fullName !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Full name is required." });
    }
    if (!documentNo || typeof documentNo !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Document number is required." });
    }
    if (!expiryDate || typeof expiryDate !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Expiry date is required." });
    }
    if (!documentFront || typeof documentFront !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Document front is required." });
    }
    if (!documentBack || typeof documentBack !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Document back is required." });
    }
    if (!selfie || typeof selfie !== "string") {
      return res
        .status(400)
        .json({ status: false, message: "Selfie is required." });
    }
    if (!dob) {
      return res
        .status(400)
        .json({ status: false, message: "Date of Birth is required." });
    }
    if (!holderId || typeof holderId !== "number") {
      return res
        .status(400)
        .json({ status: false, message: "Holder ID is required." });
    }
    if (!holderType || !["player", "affiliate", "agent"].includes(holderType)) {
      return res
        .status(400)
        .json({ status: false, message: "Holder type is not valid." });
    }

    // ---------------------- Prepare Status ----------------------
    const validatedStatus =
      status === "approved" || status === "rejected" ? status : "pending";

    // ---------------------- Update or Create ----------------------
    let kycToUpdate;

    if (id) {
      // Update by provided ID
      kycToUpdate = await db.select().from(kyc).where(eq(kyc.id, id));
    }

    if (!kycToUpdate || kycToUpdate.length === 0) {
      // If no ID or record not found by ID, check holderId + holderType
      kycToUpdate = await db
        .select()
        .from(kyc)
        .where(and(eq(kyc.holderId, holderId), eq(kyc.holderType, holderType)));
    }

    console.log(kycToUpdate);

    if (kycToUpdate && kycToUpdate.length > 0) {
      // Update existing KYC
      await db
        .update(kyc)
        .set({
          documentType,
          documentNo,
          expiryDate,
          documentFront,
          documentBack,
          selfie,
          fullName,
          holderId,
          holderType,
          status: validatedStatus,
          updated_at: new Date(),
          dob,
        })
        .where(eq(kyc.id, kycToUpdate[0].id));

      return res
        .status(200)
        .json({ status: true, message: "KYC updated successfully." });
    } else {
      // Create new KYC
      await db.insert(kyc).values({
        documentType,
        documentNo,
        expiryDate,
        documentFront,
        documentBack,
        fullName,
        selfie,
        holderId,
        holderType,
        status: "pending",
        dob,
      });

      return res
        .status(200)
        .json({ status: true, message: "KYC created successfully." });
    }
  } catch (error) {
    console.error("Error creating/updating KYC:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};
export const sendKycVerificationRequest = async (
  req: Request,
  res: Response
) => {
  try {
    const { holderType, holderId } = req.body;
    console.log("holder info from front", holderId, holderType);

    // ---------------------- Validation ----------------------
    if (!holderType || !["player", "affiliate", "agent"].includes(holderType)) {
      return res
        .status(400)
        .json({ status: false, message: "Holder type is not valid." });
    }

    if (!holderId || typeof holderId !== "number") {
      return res.status(400).json({
        status: false,
        message: "Holder ID is required and must be a number.",
      });
    }

    // ---------------------- Update KYC Status ----------------------
    if (holderType === "player") {
      const updated = await db
        .select()
        .from(users)
        .where(eq(users.id, Number(holderId)));

      if (!updated.length) {
        return res
          .status(404)
          .json({ status: false, message: "Player not found." });
      }
      await db
        .update(users)
        .set({ kyc_status: "required" })
        .where(eq(users.id, Number(holderId)));

      const updatedKyc = await db
        .select()
        .from(kyc)
        .where(
          and(
            eq(kyc.holderId, Number(holderId)),
            eq(kyc.holderType, holderType)
          )
        );

      if (updatedKyc.length) {
        const result = await db
          .update(kyc)
          .set({ status: "pending" })
          .where(
            and(
              eq(kyc.holderId, Number(holderId)),
              eq(kyc.holderType, holderType)
            )
          );
        console.log("updated kyc", result);
      }
    } else {
      const updated = await db
        .select()
        .from(adminUsers)
        .where(eq(adminUsers.id, Number(holderId)));

      if (!updated.length) {
        return res
          .status(404)
          .json({ status: false, message: "Affiliate/Agent not found." });
      }

      await db
        .update(adminUsers)
        .set({ kyc_status: "required" })
        .where(eq(adminUsers.id, Number(holderId)));

      const updatedKyc = await db
        .select()
        .from(kyc)
        .where(
          and(
            eq(kyc.holderId, Number(holderId)),
            eq(kyc.holderType, holderType)
          )
        );

      if (updatedKyc.length) {
        const result = await db
          .update(kyc)
          .set({ status: "pending" })
          .where(
            and(
              eq(kyc.holderId, Number(holderId)),
              eq(kyc.holderType, holderType)
            )
          );
        console.log("updated kyc", result);
      }
    }

    // ---------------------- Success ----------------------
    return res.status(200).json({
      status: true,
      message: "KYC verification request sent successfully.",
    });
  } catch (error) {
    console.error("Error sending KYC verification request:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

export const updateKycStatus = async (req: Request, res: Response) => {
  try {
    const { kycId, holderId, status, holderType } = req.body;

    // ---------------------- Validation ----------------------
    if (!kycId || typeof kycId !== "number") {
      return res
        .status(400)
        .json({ status: false, message: "KYC ID is required." });
    }

    if (!holderId || typeof holderId !== "number") {
      return res
        .status(400)
        .json({ status: false, message: "Holder ID is required." });
    }

    if (!holderType || !["player", "affiliate", "agent"].includes(holderType)) {
      return res
        .status(400)
        .json({ status: false, message: "Holder type is not valid." });
    }

    if (!status || !["approved", "rejected", "pending"].includes(status)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid status value." });
    }

    // ---------------------- Update KYC Table ----------------------
    const result = await db
      .update(kyc)
      .set({ status, updated_at: new Date() })
      .where(and(eq(kyc.id, kycId), eq(kyc.holderId, holderId)));

    if (!result) {
      return res.status(404).json({ status: false, message: "KYC not found." });
    }

    // ---------------------- Update User/Admin User KYC Status ----------------------
    if (status === "approved") {
      if (holderType === "player") {
        // Update kyc_status in users table
        await db
          .update(users)
          .set({ kyc_status: "verified" })
          .where(eq(users.id, holderId));
      } else if (holderType === "affiliate" || holderType === "agent") {
        // Update kyc_status in adminUsers table
        await db
          .update(adminUsers)
          .set({ kyc_status: "verified" })
          .where(eq(adminUsers.id, holderId));
      }
    } else {
      if (holderType === "player") {
        const updated = await db
          .select()
          .from(users)
          .where(eq(users.id, Number(holderId)));

        if (!updated.length) {
          return res
            .status(404)
            .json({ status: false, message: "Player not found." });
        }
        await db
          .update(users)
          .set({ kyc_status: "required" })
          .where(eq(users.id, Number(holderId)));

        const updatedKyc = await db
          .select()
          .from(kyc)
          .where(
            and(
              eq(kyc.holderId, Number(holderId)),
              eq(kyc.holderType, holderType)
            )
          );

        if (updatedKyc.length) {
          const result = await db
            .update(kyc)
            .set({ status: "pending" })
            .where(
              and(
                eq(kyc.holderId, Number(holderId)),
                eq(kyc.holderType, holderType)
              )
            );
          console.log("updated kyc", result);
        }
      } else {
        const updated = await db
          .select()
          .from(adminUsers)
          .where(eq(adminUsers.id, Number(holderId)));

        if (!updated.length) {
          return res
            .status(404)
            .json({ status: false, message: "Affiliate/Agent not found." });
        }

        await db
          .update(adminUsers)
          .set({ kyc_status: "required" })
          .where(eq(adminUsers.id, Number(holderId)));

        const updatedKyc = await db
          .select()
          .from(kyc)
          .where(
            and(
              eq(kyc.holderId, Number(holderId)),
              eq(kyc.holderType, holderType)
            )
          );

        if (updatedKyc.length) {
          const result = await db
            .update(kyc)
            .set({ status: "pending" })
            .where(
              and(
                eq(kyc.holderId, Number(holderId)),
                eq(kyc.holderType, holderType)
              )
            );
          console.log("updated kyc", result);
        }
      }
    }

    return res
      .status(200)
      .json({ status: true, message: "KYC status updated successfully." });
  } catch (error) {
    console.error("Error updating KYC status:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};

export const getKycList = async (req: Request, res: Response) => {
  try {
    const { kycId, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const offset = (pageNum - 1) * limitNum;

    // Base query with LEFT JOINs for holder details
    const baseQuery = db
      .select({
        id: kyc.id,
        documentType: kyc.documentType,
        fullName: kyc.fullName,
        documentNo: kyc.documentNo,
        expiryDate: kyc.expiryDate,
        documentFront: kyc.documentFront,
        documentBack: kyc.documentBack,
        selfie: kyc.selfie,
        holderId: kyc.holderId,
        holderType: kyc.holderType,
        status: kyc.status,
        created_at: kyc.created_at,
        updated_at: kyc.updated_at,
        dob: kyc.dob,
        holderUsername:
          sql<string>`COALESCE(users.username, admin_users.username)`.as(
            "holderUsername"
          ),
        holderEmail: sql<string>`COALESCE(users.email, admin_users.email)`.as(
          "holderEmail"
        ),
        holderKycStatus:
          sql<string>`COALESCE(users.kyc_status, admin_users.kyc_status)`.as(
            "holderKycStatus"
          ),
      })
      .from(kyc)
      .leftJoin(
        users,
        and(eq(kyc.holderId, users.id), eq(kyc.holderType, "player"))
      )
      .leftJoin(
        adminUsers,
        and(
          eq(kyc.holderId, adminUsers.id),
          inArray(kyc.holderType, ["affiliate", "agent"])
        )
      )
      .orderBy(desc(kyc.created_at));

    // Single KYC by ID
    if (kycId) {
      const kycData = await baseQuery
        .where(and(eq(kyc.holderId, Number(kycId))))
        .limit(1);

      if (!kycData || kycData.length === 0) {
        return res
          .status(400)
          .json({ status: false, message: "KYC not found." });
      }

      return res.status(200).json({ status: true, data: kycData[0] });
    }

    // Paginated list
    const [totalCountResult] = await db
      .select({ count: sql<number>`COUNT(*)`.as("count") })
      .from(kyc);

    const totalCount = totalCountResult?.count ?? 0;

    const kycList = await baseQuery.limit(limitNum).offset(offset);

    return res.status(200).json({
      status: true,
      data: kycList,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      },
    });
  } catch (error) {
    console.error("Error fetching KYC data:", error);
    return res.status(500).json({ status: false, message: "Server error." });
  }
};
