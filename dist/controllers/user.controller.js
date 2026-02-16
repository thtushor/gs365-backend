"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotificationStatus = exports.getMyNotifications = exports.getFavorites = exports.removeFavorite = exports.addFavorite = exports.userProfile = exports.deleteUser = exports.updateUser = exports.logoutUser = exports.loginUser = exports.registerUser = exports.getUsersByReferrerTypeController = exports.getUserDetailsController = exports.getUsersWithFiltersController = exports.getAllUsers = void 0;
exports.getClientIp = getClientIp;
const user_model_1 = require("../models/user.model");
const UAParser = __importStar(require("ua-parser-js"));
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const refCode_1 = require("../utils/refCode");
const user_model_2 = require("../models/user.model");
const admin_model_1 = require("../models/admin.model");
const jwt_1 = require("../utils/jwt");
const userLoginHistory_model_1 = require("../models/userLoginHistory.model");
const user_favorites_1 = require("../db/schema/user_favorites");
const __1 = require("..");
const getAllUsers = async (req, res) => {
    try {
        const users = await (0, user_model_1.getUsersWithFilters)({});
        return res.json({ status: true, users });
    }
    catch (error) {
        return res
            .status(500)
            .json({ status: false, message: "Failed to fetch users" });
    }
};
exports.getAllUsers = getAllUsers;
const getUsersWithFiltersController = async (req, res) => {
    try {
        const { playerId, phone, status, keyword, page = 1, pageSize = 10, createdBy, referred_by, referred_by_admin_user, userType = "all", currencyId, dateFrom, dateTo, } = req.query;
        const filters = {
            playerId: playerId ? Number(playerId) : undefined,
            phone: phone,
            status: status,
            keyword: keyword,
            page: Number(page),
            pageSize: Number(pageSize),
            createdBy: createdBy ? Number(createdBy) : undefined,
            referred_by: referred_by ? Number(referred_by) : undefined,
            referred_by_admin_user: referred_by_admin_user
                ? Number(referred_by_admin_user)
                : undefined,
            userType: userType,
            currencyId: currencyId ? Number(currencyId) : undefined,
            dateFrom: dateFrom,
            dateTo: dateTo,
        };
        const result = await (0, user_model_1.getUsersWithFilters)(filters);
        return res.json({
            status: true,
            message: "Users fetched successfully",
            data: result,
        });
    }
    catch (error) {
        console.error("Error fetching users with filters:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to fetch users" });
    }
};
exports.getUsersWithFiltersController = getUsersWithFiltersController;
const getUserDetailsController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res
                .status(400)
                .json({ status: false, message: "User ID is required" });
        }
        const userDetails = await (0, user_model_1.getUserDetailsById)(Number(id));
        if (!userDetails) {
            return res.status(404).json({ status: false, message: "User not found" });
        }
        return res.json({
            status: true,
            message: "User details fetched successfully",
            data: userDetails,
        });
    }
    catch (error) {
        console.error("Error fetching user details:", error);
        return res
            .status(500)
            .json({ status: false, message: "Failed to fetch user details" });
    }
};
exports.getUserDetailsController = getUserDetailsController;
const getUsersByReferrerTypeController = async (req, res) => {
    try {
        const { type } = req.params;
        const { page = 1, pageSize = 10 } = req.query;
        if (type !== "affiliate" && type !== "agent") {
            return res.status(400).json({
                status: false,
                message: "Type must be 'affiliate' or 'agent'",
            });
        }
        const result = await (0, user_model_1.getUsersByReferrerType)(type, Number(page), Number(pageSize));
        return res.json({
            status: true,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} users fetched successfully`,
            data: result,
        });
    }
    catch (error) {
        console.error(`Error fetching ${req.params.type} users:`, error);
        return res.status(500).json({
            status: false,
            message: `Failed to fetch ${req.params.type} users`,
        });
    }
};
exports.getUsersByReferrerTypeController = getUsersByReferrerTypeController;
const registerUser = async (req, res) => {
    try {
        const { username, fullname, phone, email, password, currency_id, refer_code, isAgreeWithTerms, createdBy, country_id, } = req.body;
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
        const existingUserName = await (0, user_model_1.findUserByUsernameOrEmail)(username);
        const existingPhone = await (0, user_model_1.findUserByUsernameOrEmail)(phone);
        const existingEmail = await (0, user_model_1.findUserByUsernameOrEmail)(email);
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
        const uniqueReferCode = await (0, refCode_1.generateUniqueRefCode)("user");
        // If refer_code is provided, find the referring user
        let referred_by = undefined;
        let referred_by_admin_user = undefined;
        console.log("the refer code", refer_code);
        if (refer_code) {
            const referringUser = await (0, user_model_2.findUserByReferCode)(refer_code);
            console.log("refer by user:", referringUser);
            if (referringUser && referringUser.id) {
                referred_by = referringUser.id;
            }
            else {
                const referringAdmin = await (0, admin_model_1.findAdminByRefCode)(refer_code);
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
        const user = await (0, user_model_1.createUser)({
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
            isVerified: false, // User needs to verify email
        });
        // Send OTP email
        const { sendOTPEmail } = await Promise.resolve().then(() => __importStar(require("../utils/emailService")));
        await sendOTPEmail(email, otp, 10);
        return res.status(201).json({
            status: true,
            message: "User registered successfully. Please verify your email with the OTP sent.",
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
            },
        });
    }
    catch (error) {
        return res
            .status(500)
            .json({ status: false, message: "Failed to register user", error });
    }
};
exports.registerUser = registerUser;
function getClientIp(req) {
    let ip = req.headers["x-forwarded-for"]
        ?.split(",")
        .map((s) => s.trim())[0] ||
        req.headers["x-real-ip"] ||
        req.socket?.remoteAddress ||
        req.connection?.remoteAddress ||
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
const loginUser = async (req, res) => {
    try {
        const { userNameOrEmailorPhone, password } = req.body;
        if (!userNameOrEmailorPhone || !password) {
            return res.status(400).json({
                status: false,
                message: "Missing username/email/phone or password",
            });
        }
        const user = await (0, user_model_1.findUserByUsernameOrEmail)(userNameOrEmailorPhone);
        if (!user || typeof user.password !== "string") {
            return res
                .status(401)
                .json({ status: false, message: "Invalid credentials" });
        }
        // Check if email is verified
        // Check if email is verified
        if (!user.isVerified) {
            // Check if current OTP is valid (not expired)
            const now = new Date();
            const otpExpiry = user.otp_expiry ? new Date(user.otp_expiry) : null;
            const isOtpValid = otpExpiry && otpExpiry > now;
            if (isOtpValid) {
                // OTP is still valid, don't resend
                return res.status(403).json({
                    status: false,
                    message: "Email not verified. Please verify your email with the One Time Password (OTP) sent to your registered email address.",
                    requiresVerification: true,
                    email: user.email,
                });
            }
            else {
                // OTP is expired or missing, generate and send a new one
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const newOtpExpiry = new Date();
                newOtpExpiry.setMinutes(newOtpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
                // Update user with new OTP
                await (0, user_model_1.updateUser)(user.id, {
                    otp,
                    otp_expiry: newOtpExpiry,
                });
                // Send OTP email
                if (user.email) {
                    const { sendOTPEmail } = await Promise.resolve().then(() => __importStar(require("../utils/emailService")));
                    await sendOTPEmail(user.email, otp, 10);
                }
                return res.status(403).json({
                    status: false,
                    message: "Email not verified. A new One Time Password (OTP) has been sent to your registered email address.",
                    requiresVerification: true,
                    email: user.email,
                });
            }
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
        const token = (0, jwt_1.generateJwtToken)({
            id: user.id,
            email: user.email,
            username: user.username,
            // token version for new browser or new login
            tokenVersion: tokenVersion,
            userType: "user",
        }, "5Mins");
        await connection_1.db
            .update(schema_1.users)
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
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        const getUserVerifyToken = await connection_1.db.query.userTokens.findFirst({
            where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userTokens.user_id, user.id), (0, drizzle_orm_1.eq)(schema_1.userTokens.type, "verify")),
        });
        if (getUserVerifyToken?.id) {
            await connection_1.db
                .update(schema_1.userTokens)
                .set({
                user_id: user.id,
                token: token,
                type: "verify",
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userTokens.user_id, user.id)));
        }
        else {
            await connection_1.db.insert(schema_1.userTokens).values({
                user_id: user.id,
                token: token,
                type: "verify",
                expires_at: new Date(),
            });
        }
        // Notify all connected clients for this user to validate their token.
        // Clients should compare their stored token with `latestToken`; if mismatched, auto-logout.
        __1.io.emit(`logout-user-${user.id}`, {
            userId: user.id,
            latestToken: token,
        });
        // Record login history
        try {
            await (0, userLoginHistory_model_1.createUserLoginHistory)({
                userId: user.id,
                ipAddress: ip_address,
                userAgent: userAgent,
                deviceType: device_type,
                deviceName: device_name,
                osVersion: os_version,
                browser: browser,
                browserVersion: browser_version,
            });
        }
        catch (historyError) {
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
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Failed to login" });
    }
};
exports.loginUser = loginUser;
const logoutUser = async (req, res) => {
    try {
        const user = req.user;
        if (!Boolean(user.id) || user.userType !== "user") {
            res.status(401).json({ status: false, message: "Unauthorized" });
            return;
        }
        user.id &&
            (await connection_1.db
                .update(schema_1.users)
                .set({ isLoggedIn: false })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id)));
        return res
            .status(200)
            .json({ status: true, message: "Logged out successfully" });
    }
    catch (error) { }
};
exports.logoutUser = logoutUser;
const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res
                .status(400)
                .json({ status: false, message: "User ID is required" });
        }
        const data = req.body;
        const updated = await (0, user_model_1.updateUser)(Number(id), data);
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
    }
    catch (error) {
        return res
            .status(500)
            .json({ status: false, message: "Failed to update user", error });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res
                .status(400)
                .json({ status: false, message: "User ID is required" });
        }
        const result = await (0, user_model_1.deleteUser)(Number(id));
        if (!result) {
            return res
                .status(404)
                .json({ status: false, message: "User not found or not deleted" });
        }
        return res.json({ status: true, message: "User deleted successfully" });
    }
    catch (error) {
        return res
            .status(500)
            .json({ status: false, message: "Failed to delete user" });
    }
};
exports.deleteUser = deleteUser;
const userProfile = async (req, res) => {
    const user = req.user;
    if (!Boolean(user.id) || user.userType !== "user") {
        res.status(401).json({ status: false, message: "Unauthorized" });
        return;
    }
    try {
        const userData = await (0, user_model_1.getUserById)(user?.id);
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
                        const updateRes = await (0, user_model_1.updateUser)(Number(userData?.id), data);
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
            }
            else {
                res.status(401).json({
                    status: false,
                    message: "User is inactive",
                    data: null,
                });
            }
        }
        else {
            res.status(200).json({
                status: false,
                message: "Profile not found",
                data: userData,
            });
            return;
        }
    }
    catch (error) {
        if (!res.headersSent) {
            res
                .status(200)
                .json({ message: "Something went wrong", status: false, error });
        }
    }
};
exports.userProfile = userProfile;
// Add favorite
const addFavorite = async (req, res) => {
    try {
        const { userId, gameId } = req.body;
        // Check if already favorited
        const exists = await connection_1.db
            .select()
            .from(user_favorites_1.user_favorites)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_favorites_1.user_favorites.gameId, Number(gameId)), (0, drizzle_orm_1.eq)(user_favorites_1.user_favorites.userId, Number(userId))));
        if (exists.length > 0) {
            return res.status(400).json({ message: "Game already in favorites" });
        }
        await connection_1.db
            .insert(user_favorites_1.user_favorites)
            .values({ userId: Number(userId), gameId: Number(gameId) });
        return res.status(200).json({ message: "Added to favorites" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.addFavorite = addFavorite;
// Remove favorite
const removeFavorite = async (req, res) => {
    try {
        const { userId, gameId } = req.body;
        await connection_1.db
            .delete(user_favorites_1.user_favorites)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(user_favorites_1.user_favorites.gameId, Number(gameId)), (0, drizzle_orm_1.eq)(user_favorites_1.user_favorites.userId, Number(userId))));
        return res.status(200).json({ message: "Removed from favorites" });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.removeFavorite = removeFavorite;
// Get user's favorite games
const getFavorites = async (req, res) => {
    try {
        const { userId } = req.query;
        const favorites = await connection_1.db
            .select({
            gameId: schema_1.games.id,
            gameName: schema_1.games.name,
            gameLogo: schema_1.games.gameLogo,
            gameUrl: schema_1.games.gameUrl,
            gameApiKey: schema_1.games.apiKey,
            gameLicenseKey: schema_1.games.licenseKey,
            userId: schema_1.users.id,
            username: schema_1.users.username,
            userFullname: schema_1.users.fullname,
            userEmail: schema_1.users.email,
            createdAt: user_favorites_1.user_favorites.createdAt,
            id: user_favorites_1.user_favorites.id,
        })
            .from(user_favorites_1.user_favorites)
            .leftJoin(schema_1.games, (0, drizzle_orm_1.eq)(user_favorites_1.user_favorites.gameId, schema_1.games.id))
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(user_favorites_1.user_favorites.userId, schema_1.users.id))
            .where((0, drizzle_orm_1.eq)(user_favorites_1.user_favorites.userId, Number(userId)));
        return res.status(200).json(favorites);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};
exports.getFavorites = getFavorites;
const getMyNotifications = async (req, res) => {
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
            condition = (0, drizzle_orm_1.sql) `${schema_1.notifications.notificationType} LIKE 'admin_%'`;
        }
        else {
            condition = (0, drizzle_orm_1.sql) `FIND_IN_SET(${userId}, ${schema_1.notifications.playerIds})`;
        }
        // Fetch notifications where status is active
        // and userId is included in the comma-separated playerIds column
        const notificationsList = await connection_1.db
            .select()
            .from(schema_1.notifications)
            .where((0, drizzle_orm_1.sql) `
       ${condition}
        AND ${schema_1.notifications.status} = 'active'
      `)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.notifications.id));
        return res.json({
            status: true,
            data: notificationsList,
            message: "Notifications fetched successfully",
        });
    }
    catch (error) {
        console.error("Fetch notifications error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
};
exports.getMyNotifications = getMyNotifications;
const updateNotificationStatus = async (req, res) => {
    try {
        const { status, id } = req.body;
        // const { userType } = req?.query;
        if (!status) {
            return res.status(400).json({
                status: false,
                message: "Status is required",
            });
        }
        const result = await connection_1.db
            .update(schema_1.notifications)
            .set({
            status,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.notifications.id, Number(id || 0)));
        return res.json({
            status: true,
            data: result,
            message: "Notifications fetched successfully",
        });
    }
    catch (error) {
        console.error("Fetch notifications error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
};
exports.updateNotificationStatus = updateNotificationStatus;
