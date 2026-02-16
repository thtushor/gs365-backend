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
exports.deleteGamingLicenses = exports.getAllGamingLicenses = exports.createOrUpdateGamingLicenses = exports.deleteAmbassador = exports.getAllAmbassador = exports.createOrUpdateAmbassador = exports.deleteSponsor = exports.getAllSponsors = exports.createOrUpdateSponsor = exports.deleteAdvertisement = exports.getAllVideoAdvertisement = exports.createOrUpdateVideoAdvertisement = exports.deleteFaq = exports.getAllWebsiteFaq = exports.createOrUpdateWebsiteFaq = exports.deletePopup = exports.getAllWebsitePopups = exports.createOrUpdateWebsitePopup = exports.deleteAnnouncement = exports.getAllAnnouncements = exports.createOrUpdateAnnouncement = exports.getFeaturedGame = exports.createUpdateFeaturedGame = exports.getAllSocial = exports.createUpdateSocial = exports.getAllEvents = exports.createUpdateEvent = exports.getAllBanners = exports.createUpdateBanners = exports.getPromotionsList = exports.addOrUpdatePromotion = exports.getDropdownOptionsList = exports.updateDropdownOptionStatus = exports.deleteDropdownOption = exports.addOrUpdateDropdownOption = exports.getDropdownsList = exports.deleteAdmin = exports.updateAdminProfile = exports.getPlayersListByAffiliateId = exports.getSubAffiliatesListByAffiliateId = exports.getAffiliates = exports.getAgents = exports.getDetailsByReferer = exports.getAdmins = exports.getUserProfile = exports.getPlayers = exports.adminProfile = exports.adminLogout = exports.adminLogin = exports.adminRegistration = void 0;
exports.updateCustomNotification = exports.getCustomNotifications = exports.createCustomNotification = exports.getConversionList = exports.deleteConversionById = exports.createOrUpdateConversion = exports.getKycList = exports.updateKycStatus = exports.sendKycVerificationRequest = exports.createUpdateKyc = exports.updateMenuPriority = exports.getMenuProviders = exports.getSportList = exports.addOrUpdateSport = exports.getSportsProvidersList = exports.addOrUpdateSportsProvider = exports.getGameList = exports.addOrUpdateGame = exports.getGameProvidersList = exports.addOrUpdateGameProvider = exports.deleteResponsibleGaming = exports.getAllResponsibleGaming = exports.createOrUpdateResponsibleGaming = void 0;
exports.getClientIp = getClientIp;
const emailService_1 = require("../utils/emailService");
const admin_model_1 = require("../models/admin.model");
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const jwt_1 = require("../utils/jwt");
const __1 = require("..");
const user_model_1 = require("../models/user.model");
const UAParser = __importStar(require("ua-parser-js"));
const requiredFields_1 = require("../utils/requiredFields");
const refCode_1 = require("../utils/refCode");
const kyc_1 = require("../db/schema/kyc");
const mysql_core_1 = require("drizzle-orm/mysql-core");
/**
 * Helper function to get client IP address
 */
function getClientIp(req) {
    const xForwardedFor = req.headers["x-forwarded-for"];
    let ip = "Unknown";
    if (typeof xForwardedFor === "string") {
        ip = xForwardedFor.split(",")[0].trim();
    }
    else if (Array.isArray(xForwardedFor)) {
        ip = xForwardedFor[0].trim();
    }
    else {
        ip =
            req.headers["x-real-ip"] ||
                req.socket?.remoteAddress ||
                req.connection?.remoteAddress ||
                req.ip ||
                "Unknown";
    }
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
const adminRegistration = async (req, res) => {
    try {
        const { username, fullname, phone, email, password, role, country, city, street, minTrx, maxTrx, currency, createdBy, status, refer_code, commission_percent, country_id, designation, } = req.body;
        // Generate OTP for email verification
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
        const userData = req?.user;
        if (!username) {
            res.status(400).json({ status: false, message: "Username is required" });
            return;
        }
        if (!fullname) {
            res.status(400).json({ status: false, message: "Full name is required" });
            return;
        }
        if (!phone) {
            res
                .status(400)
                .json({ status: false, message: "Phone number is required" });
            return;
        }
        if (!email) {
            res.status(400).json({ status: false, message: "Email is required" });
            return;
        }
        if (!password) {
            res.status(400).json({ status: false, message: "Password is required" });
            return;
        }
        if (!role) {
            res.status(400).json({ status: false, message: "Role is required" });
            return;
        }
        const createdByData = req?.user?.id ?? createdBy;
        if (userData?.role === "superAgent" &&
            ["admin", "superAgent", "superAffiliate", "affiliate"].includes(role)) {
            res
                .status(400)
                .json({ status: false, message: `Super agent can't create ${role}` });
            return;
        }
        if (userData?.role === "agent" &&
            ["admin", "superAgent", "agent", "superAffiliate", "affiliate"].includes(role)) {
            res
                .status(400)
                .json({ status: false, message: `Agent can't create ${role}` });
            return;
        }
        if (userData?.role === "superAffiliate" &&
            ["admin", "superAgent", "agent", "superAffiliate"].includes(role)) {
            res.status(400).json({
                status: false,
                message: `Super Affiliate can't create ${role}`,
            });
            return;
        }
        if (userData?.role === "affiliate" &&
            ["admin", "superAgent", "agent", "superAffiliate", "affiliate"].includes(role)) {
            res.status(400).json({
                status: false,
                message: `Affiliate can't create ${role}`,
            });
            return;
        }
        const existingUser = await (0, admin_model_1.findAdminByUsernameOrEmail)(username);
        const existingEmail = await (0, admin_model_1.findAdminByUsernameOrEmail)(email);
        const existingPhone = await (0, admin_model_1.findAdminByUsernameOrEmail)(phone);
        if (existingUser) {
            res
                .status(400)
                .json({ status: false, message: `${username} - already exist` });
            return;
        }
        if (existingEmail) {
            res
                .status(400)
                .json({ status: false, message: `${email} - already exist` });
        }
        if (existingPhone) {
            res
                .status(400)
                .json({ status: false, message: `${phone} - already exist` });
        }
        // Generate unique refCode for this admin
        const uniqueRefCode = await (0, refCode_1.generateUniqueRefCode)("admin");
        // If refCode is provided, find the referring admin
        let referred_by = undefined;
        console.log("refer_code", refer_code);
        if (refer_code) {
            const referringAdmin = await (0, admin_model_1.findAdminByRefCode)(refer_code);
            console.log("referringAdmin", referringAdmin);
            if (referringAdmin &&
                referringAdmin.id &&
                referringAdmin?.role === "superAffiliate") {
                // const hashedPassword = await bcrypt.hash(password, 10);
                const admin = await (0, admin_model_1.createAdmin)({
                    username,
                    fullname,
                    phone,
                    email,
                    password: password,
                    role: "affiliate",
                    country: country_id,
                    city,
                    street,
                    minTrx: minTrx !== undefined
                        ? String(minTrx)
                        : referringAdmin?.minTrx
                            ? referringAdmin?.minTrx
                            : undefined,
                    maxTrx: maxTrx !== undefined
                        ? String(maxTrx)
                        : referringAdmin?.maxTrx
                            ? referringAdmin?.maxTrx
                            : undefined,
                    currency: currency ? currency : referringAdmin?.currency,
                    createdBy: Number(createdByData) || undefined,
                    refCode: uniqueRefCode,
                    status: "active",
                    referred_by: referringAdmin?.id,
                    commission_percent: commission_percent
                        ? commission_percent
                        : referringAdmin?.commission_percent
                            ? referringAdmin?.commission_percent / 2
                            : commission_percent,
                    designation,
                    otp,
                    otp_expiry: otpExpiry,
                    isVerified: false,
                });
                if (email) {
                    await (0, emailService_1.sendOTPEmail)(email, otp, 10);
                }
                if (["superAffiliate", "affiliate"].includes(role)) {
                    // ✅ Notification for new affiliate (created via referral)
                    await connection_1.db.insert(schema_1.notifications).values({
                        notificationType: "admin_others",
                        title: `New affiliate registered (#${admin.insertId})`,
                        description: `
            A new <strong>affiliate</strong> has been registered by <strong>${userData?.username}</strong>.<br/>
            Username: <strong>${username}</strong><br/>
            Full Name: <strong>${fullname}</strong><br/>
            Email: <strong>${email}</strong><br/>
            Role: <strong>${role}</strong><br/>
            Referred by: <strong>${referringAdmin.username}</strong>
          `,
                        amount: "0",
                        // playerIds: String(admin.insertId),
                        link: `/affiliate-list`,
                        startDate: new Date(),
                        endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                        status: "active",
                        createdBy: Number(userData?.id ?? 0),
                    });
                    __1.io.emit("admin-notifications", {
                        notificationType: "admin_registration",
                        title: `New affiliate registered (#${admin.insertId})`,
                        description: `
            A new <strong>affiliate</strong> has been registered by <strong>${userData?.username}</strong>.<br/>
            Username: <strong>${username}</strong><br/>
            Full Name: <strong>${fullname}</strong><br/>
            Email: <strong>${email}</strong><br/>
            Role: <strong>${role}</strong><br/>
            Referred by: <strong>${referringAdmin.username}</strong>
          `,
                    });
                }
                res.status(201).json({
                    status: true,
                    message: "Admin registered successfully",
                    data: admin,
                });
            }
        }
        // const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await (0, admin_model_1.createAdmin)({
            username,
            fullname,
            phone,
            email,
            password: password,
            role,
            country: country_id,
            city,
            street,
            minTrx: minTrx ? String(minTrx) : undefined,
            maxTrx: maxTrx ? String(maxTrx) : undefined,
            currency,
            createdBy: Number(createdByData) || undefined,
            refCode: uniqueRefCode,
            status,
            referred_by,
            commission_percent,
            designation,
            otp,
            otp_expiry: otpExpiry,
            isVerified: false,
        });
        if (email) {
            await (0, emailService_1.sendOTPEmail)(email, otp, 10);
        }
        if (["superAffiliate", "affiliate"].includes(role)) {
            // ✅ Notification for new affiliate (created via referral)
            await connection_1.db.insert(schema_1.notifications).values({
                notificationType: "admin_others",
                title: `New affiliate registered (#${admin.insertId})`,
                description: `
            A new <strong>affiliate</strong> has been registered by <strong>${userData?.username}</strong>.<br/>
            Username: <strong>${username}</strong><br/>
            Full Name: <strong>${fullname}</strong><br/>
            Email: <strong>${email}</strong><br/>
            Role: <strong>${role}</strong><br/>
          `,
                amount: "0",
                // playerIds: String(admin.insertId),
                link: `/affiliate-list`,
                startDate: new Date(),
                endDate: new Date(new Date().setDate(new Date().getDate() + 7)),
                status: "active",
                createdBy: Number(userData?.id ?? 0),
            });
            __1.io.emit("admin-notifications", {
                notificationType: "admin_registration",
                title: `New affiliate registered (#${admin.insertId})`,
                description: `
            A new <strong>affiliate</strong> has been registered by <strong>${userData?.username}</strong>.<br/>
            Username: <strong>${username}</strong><br/>
            Full Name: <strong>${fullname}</strong><br/>
            Email: <strong>${email}</strong><br/>
            Role: <strong>${role}</strong><br/>
          `,
            });
        }
        res.status(201).json({
            status: true,
            message: "Admin registered successfully",
            data: admin,
        });
    }
    catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ status: false, message: "Failed to register admin", error });
    }
};
exports.adminRegistration = adminRegistration;
const adminLogin = async (req, res) => {
    try {
        const { userNameOrEmailorPhone, password, userType } = req.body;
        if (!userNameOrEmailorPhone || !password) {
            res.status(400).json({
                status: false,
                message: "Missing username/email/phone or password",
            });
            return;
        }
        const admin = await (0, admin_model_1.findAdminByUsernameOrEmail)(userNameOrEmailorPhone);
        if (!admin || typeof admin.password !== "string") {
            res.status(401).json({ status: false, message: "Invalid credentials" });
            return;
        }
        // --- OTP Verification Check ---
        if (!admin.isVerified) {
            const now = new Date();
            const otpExpiry = admin.otp_expiry ? new Date(admin.otp_expiry) : null;
            const isOtpValid = otpExpiry && otpExpiry > now;
            if (isOtpValid) {
                // OTP is still valid, don't resend
                res.status(403).json({
                    status: false,
                    message: "Email not verified. Please verify your email with the One Time Password (OTP) sent to your registered email address.",
                    requiresVerification: true,
                    email: admin.email,
                });
                return;
            }
            else {
                // OTP is expired or missing, generate and send a new one
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                const newOtpExpiry = new Date();
                newOtpExpiry.setMinutes(newOtpExpiry.getMinutes() + 10);
                await (0, admin_model_1.updateAdmin)(admin.id, {
                    otp,
                    otp_expiry: newOtpExpiry,
                });
                if (admin.email) {
                    await (0, emailService_1.sendOTPEmail)(admin.email, otp, 10);
                }
                res.status(403).json({
                    status: false,
                    message: "Email not verified. A new One Time Password (OTP) has been sent to your registered email address.",
                    requiresVerification: true,
                    email: admin.email,
                });
                return;
            }
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
        if (["admin", "superAdmin"].includes(admin.role || "") &&
            userType === "affiliate") {
            res.status(403).json({
                status: false,
                message: "Provide your affiliate credentials!",
            });
            return;
        }
        if (["admin", "superAdmin"].includes(admin.role || "") &&
            userType === "agent") {
            res.status(403).json({
                status: false,
                message: "Provide your agent credentials!",
            });
            return;
        }
        if (!["admin", "superAdmin"].includes(admin.role || "") &&
            userType === "admin") {
            res.status(403).json({
                status: false,
                message: "Provide your admin credentials!",
            });
            return;
        }
        if (admin.id)
            await connection_1.db
                .update(schema_1.adminUsers)
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
                .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, admin.id));
        const token = (0, jwt_1.generateJwtToken)({
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
    }
    catch (error) {
        res.status(500).json({ status: false, message: "Failed to login", error });
    }
};
exports.adminLogin = adminLogin;
// Middleware to extract admin from JWT
const getAdminFromToken = async (req) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
        return null;
    const token = authHeader.split(" ")[1];
    try {
        const decoded = (0, jwt_1.verifyJwt)(token);
        if (!decoded?.id)
            return null;
        const admin = await (0, admin_model_1.getAdminById)(decoded.id);
        return admin;
    }
    catch {
        return null;
    }
};
const adminLogout = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const err = new Error("No token provided");
        err.status = 401;
        throw err;
    }
    const token = authHeader.split(" ")[1];
    const decoded = (0, jwt_1.verifyJwt)(token);
    const user = decoded;
    if (!user || !user.id) {
        res.status(401).json({ status: false, message: "Unauthorized" });
        return;
    }
    await connection_1.db
        .update(schema_1.adminUsers)
        .set({ isLoggedIn: false })
        .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, user.id));
    res.json({ status: true, message: "Logout successful" });
};
exports.adminLogout = adminLogout;
const adminProfile = async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const err = new Error("No token provided");
        err.status = 401;
        throw err;
    }
    const token = authHeader.split(" ")[1];
    const decoded = (0, jwt_1.verifyJwt)(token);
    const user = decoded;
    if (!user || !user.id) {
        res.status(401).json({ status: false, message: "Unauthorized" });
        return;
    }
    try {
        const admin = await (0, admin_model_1.getAdminById)(user.id);
        console.log({ admin });
        if (admin?.id) {
            if (admin.status === "active") {
                res.status(200).json({
                    status: true,
                    message: "Profile fetched successfully",
                    data: admin,
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
                data: admin,
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
exports.adminProfile = adminProfile;
const getPlayers = async (req, res) => {
    const { playerId, phone, status, keyword, page = 1, pageSize = 10, referred_by_admin_user, referred_by, dateFrom, dateTo, } = req.query;
    const userData = req.user;
    const filters = {
        playerId: playerId ? Number(playerId) : undefined,
        phone: phone,
        status: status,
        keyword: keyword,
        createdBy: userData.role !== "admin" ? userData.id : undefined,
        page: page ? Number(page) : 1,
        pageSize: pageSize ? Number(pageSize) : 10,
        referred_by: Number(referred_by || 0),
        referred_by_admin_user: Number(referred_by_admin_user || 0),
        dateFrom: typeof dateFrom === "string" ? dateFrom : undefined,
        dateTo: typeof dateTo === "string" ? dateTo : undefined,
    };
    const result = await (0, user_model_1.getUsersWithFilters)(filters);
    res.json({ status: true, data: result });
};
exports.getPlayers = getPlayers;
const getUserProfile = async (req, res) => {
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
        const userProfile = await (0, user_model_1.getUserProfileById)(userId);
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
    }
    catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({
            status: false,
            message: "Failed to fetch user profile",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.getUserProfile = getUserProfile;
const getAdmins = async (req, res) => {
    try {
        const { role, page = 1, pageSize = 10, keyword } = req.query;
        const filters = {
            role: role,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 10,
            searchKeyword: keyword,
            roleList: ["admin", "superAdmin"],
            designation: req.query.designation
                ? Number(req.query.designation)
                : undefined,
        };
        const result = await (0, admin_model_1.getAdminsWithFilters)(filters);
        res.json({ status: true, ...result });
    }
    catch (error) {
        res
            .status(500)
            .json({ status: false, message: "Failed to fetch admins", error });
    }
};
exports.getAdmins = getAdmins;
const getDetailsByReferer = async (req, res) => {
    try {
        const { refererCode } = req.params;
        const result = await (0, admin_model_1.getAdminsDetailsByReferCode)(refererCode);
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
    }
    catch (error) {
        res.status(500).json({
            status: false,
            message: "Failed to fetch referred by user data",
            error,
        });
    }
};
exports.getDetailsByReferer = getDetailsByReferer;
const getAgents = async (req, res) => {
    try {
        let { role, page = 1, pageSize = 10, keyword, status } = req.query;
        let roles = ["superAgent", "agent"];
        let roleFilter = ["superAgent", "agent"];
        if (role) {
            roleFilter = role;
        }
        // Validate and sanitize status
        const validStatuses = ["active", "inactive"];
        // Ensure status is valid
        let statusFilter = undefined;
        if (status && validStatuses.includes(status)) {
            statusFilter = status;
        }
        const filters = {
            role: roleFilter,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 10,
            searchKeyword: keyword,
            roleList: ["superAgent", "agent"],
            status: statusFilter,
        };
        const result = await (0, admin_model_1.getAdminsWithFilters)(filters);
        // If no role is specified, filter the result to only include superAgent and agent
        if (!roleFilter && result?.data) {
            result.data = result.data.filter((admin) => roles.includes(admin.role));
        }
        res.json({ status: true, ...result });
    }
    catch (error) {
        res
            .status(500)
            .json({ status: false, message: "Failed to fetch agents", error });
    }
};
exports.getAgents = getAgents;
const getAffiliates = async (req, res) => {
    try {
        let { id, role, page = 1, pageSize = 10, keyword, status } = req.query;
        if (id) {
            const affiliate = await (0, admin_model_1.getAdminById)(Number(id));
            if (!affiliate) {
                return res.status(404).json({
                    status: false,
                    message: "Affiliate not found",
                });
            }
            return res.json({ status: true, data: affiliate });
        }
        let roles = [
            "superAffiliate",
            "affiliate",
        ];
        let roleFilter = ["superAffiliate", "affiliate"];
        if (role) {
            roleFilter = role;
        }
        // Validate and sanitize status
        const validStatuses = ["active", "inactive"];
        // Ensure status is valid
        let statusFilter = undefined;
        if (status && validStatuses.includes(status)) {
            statusFilter = status;
        }
        console.log(keyword);
        const filters = {
            role: roleFilter,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 10,
            searchKeyword: keyword,
            roleList: ["superAffiliate", "affiliate"],
            status: statusFilter,
        };
        const result = await (0, admin_model_1.getAdminsWithFilters)(filters);
        // If no role is specified, filter the result to only include superAffiliate and affiliate
        if (!roleFilter && result?.data) {
            result.data = result.data.filter((admin) => roles.includes(admin.role));
        }
        res.json({ status: true, ...result });
    }
    catch (error) {
        res
            .status(500)
            .json({ status: false, message: "Failed to fetch affiliates", error });
    }
};
exports.getAffiliates = getAffiliates;
const getSubAffiliatesListByAffiliateId = async (req, res) => {
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
        const statusFilter = status && validStatuses.includes(status)
            ? status
            : undefined;
        const whereClauses = [
            (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.adminUsers.createdBy, affiliateId), (0, drizzle_orm_1.eq)(schema_1.adminUsers.referred_by, affiliateId)),
            (0, drizzle_orm_1.eq)(schema_1.adminUsers.role, "affiliate"), // ✅ Only include users with role "affiliate"
        ];
        if (statusFilter) {
            whereClauses.push((0, drizzle_orm_1.eq)(schema_1.adminUsers.status, statusFilter));
        }
        const where = (0, drizzle_orm_1.and)(...whereClauses);
        // Get total count
        const total = await connection_1.db
            .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
            .from(schema_1.adminUsers)
            .where(where)
            .then((rows) => Number(rows[0]?.count || 0));
        // Get paginated data
        const data = await connection_1.db
            .select()
            .from(schema_1.adminUsers)
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
    }
    catch (error) {
        console.error("Error fetching sub-affiliates:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to fetch sub-affiliates",
            error,
        });
    }
};
exports.getSubAffiliatesListByAffiliateId = getSubAffiliatesListByAffiliateId;
const getPlayersListByAffiliateId = async (req, res) => {
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
        const statusFilter = status && validStatuses.includes(status)
            ? status
            : undefined;
        const whereClauses = [
            (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.users.referred_by_admin_user, affiliateId), (0, drizzle_orm_1.eq)(schema_1.users.referred_by, affiliateId)),
        ];
        if (statusFilter) {
            whereClauses.push((0, drizzle_orm_1.eq)(schema_1.users.status, statusFilter));
        }
        const where = (0, drizzle_orm_1.and)(...whereClauses);
        // Get total count
        const total = await connection_1.db
            .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
            .from(schema_1.users)
            .where(where)
            .then((rows) => Number(rows[0]?.count || 0));
        // Get paginated data
        const data = await connection_1.db
            .select()
            .from(schema_1.users)
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
    }
    catch (error) {
        console.error("Error fetching player list:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to fetch player list",
            error,
        });
    }
};
exports.getPlayersListByAffiliateId = getPlayersListByAffiliateId;
const updateAdminProfile = async (req, res, next) => {
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
        const updatedAdmin = await (0, admin_model_1.updateAdmin)(Number(id), updateData);
        if (!updatedAdmin) {
            res.status(404).json({ status: false, message: "Admin not found" });
            return;
        }
        res.status(200).json({
            status: true,
            message: "Admin updated successfully",
            data: updatedAdmin,
        });
    }
    catch (error) {
        res
            .status(500)
            .json({ status: false, message: "Failed to update admin", error });
    }
};
exports.updateAdminProfile = updateAdminProfile;
const deleteAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            res.status(400).json({ status: false, message: "Missing admin id" });
            return;
        }
        const result = await (0, admin_model_1.deleteAdmin)(Number(id));
        if (!result) {
            res
                .status(404)
                .json({ status: false, message: "Admin not found or not deleted" });
            return;
        }
        res
            .status(200)
            .json({ status: true, message: "Admin deleted successfully" });
    }
    catch (error) {
        res
            .status(500)
            .json({ status: false, message: "Failed to delete admin", error });
    }
};
exports.deleteAdmin = deleteAdmin;
// ----------------------------
// Configuration-------------------
// ---------------------
const getDropdownsList = async (req, res) => {
    try {
        const { id, page = 1, pageSize = 10 } = req.query;
        const dropdownId = id ? Number(id) : undefined;
        if (dropdownId) {
            const dropdown = await (0, admin_model_1.getDropdownById)(dropdownId);
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
        const result = await (0, admin_model_1.getPaginatedDropdowns)(Number(page), Number(pageSize));
        return res.status(200).json({
            status: true,
            message: "Dropdowns fetched successfully.",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching dropdowns:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getDropdownsList = getDropdownsList;
const addOrUpdateDropdownOption = async (req, res) => {
    try {
        const { id, dropdownId, title, status, imgUrl, isMenu } = req.body;
        const userData = req?.user;
        if (!dropdownId || !title) {
            return res.status(400).json({
                status: false,
                message: "Dropdown ID and option title are required.",
            });
        }
        // Check if dropdown exists
        const [dropdown] = await connection_1.db
            .select()
            .from(schema_1.dropdowns)
            .where((0, drizzle_orm_1.eq)(schema_1.dropdowns.id, dropdownId));
        if (!dropdown) {
            return res
                .status(404)
                .json({ status: false, message: "Dropdown not found." });
        }
        // If ID is provided, attempt update
        if (id) {
            // Check if the option exists
            const [option] = await connection_1.db
                .select()
                .from(schema_1.dropdownOptions)
                .where((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.id, id));
            if (!option) {
                return res
                    .status(404)
                    .json({ status: false, message: "Option not found." });
            }
            // Case-insensitive duplicate check (for other options)
            const [duplicate] = await connection_1.db
                .select()
                .from(schema_1.dropdownOptions)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.dropdown_id, dropdownId), (0, drizzle_orm_1.sql) `LOWER(${schema_1.dropdownOptions.title}) = ${title.toLowerCase()}`, (0, drizzle_orm_1.sql) `${schema_1.dropdownOptions.id} != ${id}`));
            if (duplicate) {
                return res.status(409).json({
                    status: false,
                    message: "Another option with this title already exists.",
                });
            }
            // Perform update
            await connection_1.db
                .update(schema_1.dropdownOptions)
                .set({
                title,
                status: status || option.status,
                imgUrl: imgUrl ?? option.imgUrl,
                isMenu: isMenu === "Yes" ? true : false,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.id, id));
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
        const [existingOption] = await connection_1.db
            .select()
            .from(schema_1.dropdownOptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.dropdown_id, dropdownId), (0, drizzle_orm_1.eq)(schema_1.dropdownOptions.dropdown_id, dropdownId), (0, drizzle_orm_1.sql) `LOWER(${schema_1.dropdownOptions.title}) = ${title.toLowerCase()}`));
        if (existingOption) {
            return res.status(409).json({
                status: false,
                message: "This option title already exists.",
            });
        }
        await connection_1.db.insert(schema_1.dropdownOptions).values({
            title,
            dropdown_id: dropdownId,
            status: status || "inactive",
            created_by: userData?.username ?? "N/A",
            imgUrl: imgUrl,
            isMenu: isMenu === "Yes" ? true : false,
        });
        const allOptions = await connection_1.db
            .select()
            .from(schema_1.dropdownOptions)
            .where((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.dropdown_id, dropdownId));
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
    }
    catch (error) {
        console.error("Error adding/updating dropdown option:", error);
        return res.status(500).json({ status: false, message: "Server error." });
    }
};
exports.addOrUpdateDropdownOption = addOrUpdateDropdownOption;
const deleteDropdownOption = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid dropdown option id",
        });
    }
    try {
        const result = await connection_1.db
            .delete(schema_1.dropdownOptions)
            .where((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.id, id));
        return res.status(200).json({
            success: true,
            message: "Dropdown option deleted successfully",
            result,
        });
    }
    catch (error) {
        console.error("Error deleting dropdown option:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete dropdown option",
            error,
        });
    }
};
exports.deleteDropdownOption = deleteDropdownOption;
const updateDropdownOptionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        // Validate input
        if (!id || !["active", "inactive"].includes(status)) {
            return res.status(400).json({
                status: false,
                message: "Valid option ID and status ('active' or 'inactive') are required.",
            });
        }
        // Check if option exists
        const [existing] = await connection_1.db
            .select()
            .from(schema_1.dropdownOptions)
            .where((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.id, Number(id)));
        if (!existing) {
            return res.status(404).json({
                status: false,
                message: "Dropdown option not found.",
            });
        }
        // Update status
        await connection_1.db
            .update(schema_1.dropdownOptions)
            .set({ status })
            .where((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.id, Number(id)));
        return res.status(200).json({
            status: true,
            message: "Option status updated successfully.",
            data: {
                id: existing.id,
                previousStatus: existing.status,
                newStatus: status,
            },
        });
    }
    catch (error) {
        console.error("Error updating dropdown option status:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.updateDropdownOptionStatus = updateDropdownOptionStatus;
const getDropdownOptionsList = async (req, res) => {
    try {
        const { id, page = 1, pageSize = 10 } = req.query;
        const optionId = id ? Number(id) : undefined;
        if (optionId) {
            const option = await (0, admin_model_1.getSingleDropdownOptionById)(optionId);
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
        const result = await (0, admin_model_1.getPaginatedDropdownOptions)(Number(page), Number(pageSize));
        console.log(result);
        return res.status(200).json({
            status: true,
            message: "Dropdown options fetched successfully.",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching dropdown options:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getDropdownOptionsList = getDropdownOptionsList;
// ----------------------------
// Promotions-------------------
// ---------------------
const addOrUpdatePromotion = async (req, res) => {
    try {
        console.log(req.body);
        const userData = req?.user;
        // Validation
        for (const [field, errorMessage] of Object.entries(requiredFields_1.createPromotionRequiredFields)) {
            if (!req.body?.[field]) {
                return res.status(400).json({ status: false, message: errorMessage });
            }
        }
        const { id, promotionName, promotionTypeId, status = "inactive", dateRange, startDate, endDate, minimumDepositAmount, maximumDepositAmount, turnoverMultiply, bannerImg, bonus, description, isRecommended, } = req.body;
        // Normalize bannerImg
        let bannerImgValue = "";
        if (Array.isArray(bannerImg)) {
            bannerImgValue = bannerImg;
        }
        else if (typeof bannerImg === "object" &&
            bannerImg !== null &&
            bannerImg.original) {
            bannerImgValue = bannerImg;
        }
        else if (typeof bannerImg === "string") {
            try {
                bannerImgValue = JSON.parse(bannerImg);
            }
            catch (error) {
                bannerImgValue = bannerImg;
            }
        }
        // Ensure promotionTypeId is always an array
        const promotionTypeIds = Array.isArray(promotionTypeId)
            ? promotionTypeId
            : [promotionTypeId];
        // Validate all promotion type IDs
        const validTypeOptions = await connection_1.db
            .select()
            .from(schema_1.dropdownOptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.dropdownOptions.id, promotionTypeIds), (0, drizzle_orm_1.eq)(schema_1.dropdownOptions.status, "active")));
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
        if (promotionPayload.isRecommended) {
            await connection_1.db
                .update(schema_1.promotions)
                .set({ isRecommended: false })
                .where((0, drizzle_orm_1.sql) `1=1`);
        }
        if (id) {
            await (0, admin_model_1.updatePromotion)(id, promotionPayload);
            return res.status(200).json({
                status: true,
                message: "Promotion updated successfully.",
                data: promotionPayload,
            });
        }
        else {
            await (0, admin_model_1.createPromotion)(promotionPayload);
            return res.status(201).json({
                status: true,
                message: "Promotion created successfully.",
            });
        }
    }
    catch (error) {
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
exports.addOrUpdatePromotion = addOrUpdatePromotion;
const getPromotionsList = async (req, res) => {
    try {
        const { id, page = 1, pageSize = 10, name, status } = req.query;
        const promotionId = id ? Number(id) : undefined;
        if (promotionId) {
            const promotion = await (0, admin_model_1.getPromotionById)(promotionId);
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
        // Validate and sanitize status
        const validStatuses = ["active", "inactive"];
        // Ensure status is valid
        let statusFilter = undefined;
        if (status && validStatuses.includes(status)) {
            statusFilter = status;
        }
        const result = await (0, admin_model_1.getPaginatedPromotions)(Number(page), Number(pageSize), String(name), statusFilter);
        return res.status(200).json({
            status: true,
            message: "Promotion fetched successfully.",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching promotion:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getPromotionsList = getPromotionsList;
// cms
const createUpdateBanners = async (req, res) => {
    try {
        const { id, images, dateRange, status, title } = req.body;
        // Generate title if missing or not a string
        const finalTitle = typeof title === "string" && title.trim().length > 0
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
            status: validatedStatus,
            title: title,
        };
        if (id) {
            // Update existing banner
            await connection_1.db.update(schema_1.banners).set(payload).where((0, drizzle_orm_1.eq)(schema_1.banners.id, id));
            return res.status(200).json({
                status: true,
                message: "Banner updated successfully.",
            });
        }
        else {
            // Create new banner
            await connection_1.db.insert(schema_1.banners).values({ ...payload, title: finalTitle });
            return res.status(201).json({
                status: true,
                message: "Banner created successfully.",
            });
        }
    }
    catch (error) {
        console.error("createUpdateBanners error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.createUpdateBanners = createUpdateBanners;
const getAllBanners = async (req, res) => {
    try {
        const result = await connection_1.db
            .select()
            .from(schema_1.banners)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.banners.createdAt));
        const parsed = result.map((banner) => ({
            ...banner,
            images: JSON.parse(banner.images),
        }));
        return res.status(200).json({
            status: true,
            data: parsed,
            message: "Banner data fetched successfully.",
        });
    }
    catch (error) {
        console.error("getAllBanners error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllBanners = getAllBanners;
const createUpdateEvent = async (req, res) => {
    try {
        const { id, image, status, title, sportId } = req.body;
        if (!sportId) {
            return res.status(400).json({
                status: false,
                message: "Sport ID is required.",
            });
        }
        // Generate title if missing or not a string
        const finalTitle = typeof title === "string" && title.trim().length > 0
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
            status: validatedStatus,
            title: finalTitle,
            sportId: sportId,
        };
        if (id) {
            await connection_1.db.update(schema_1.events).set(payload).where((0, drizzle_orm_1.eq)(schema_1.events.id, id));
            return res
                .status(200)
                .json({ status: true, message: "Event updated successfully." });
        }
        else {
            await connection_1.db.insert(schema_1.events).values(payload);
            return res
                .status(201)
                .json({ status: true, message: "Event created successfully." });
        }
    }
    catch (error) {
        console.error("createOrUpdateEvent error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.createUpdateEvent = createUpdateEvent;
const getAllEvents = async (req, res) => {
    try {
        const result = await connection_1.db
            .select({
            id: schema_1.events.id,
            title: schema_1.events.title,
            sportId: schema_1.events.sportId,
            images: schema_1.events.images,
            createdAt: schema_1.events.createdAt,
            sportName: schema_1.sports.name,
            status: schema_1.events.status,
        })
            .from(schema_1.events)
            .leftJoin(schema_1.sports, (0, drizzle_orm_1.eq)(schema_1.events.sportId, schema_1.sports.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.events.createdAt));
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
    }
    catch (error) {
        console.error("getAllEvents error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllEvents = getAllEvents;
// social media
const createUpdateSocial = async (req, res) => {
    try {
        const { id, image, status, title, link } = req.body;
        if (!link) {
            return res.status(400).json({
                status: false,
                message: "Social link is required.",
            });
        }
        // Generate title if missing or not a string
        const finalTitle = typeof title === "string" && title.trim().length > 0
            ? title.trim()
            : `Event - ${Math.floor(1000 + Math.random() * 9000)}`;
        // Basic validation for single image object
        if (!image || typeof image !== "object") {
            return res.status(400).json({
                status: false,
                message: "Social icon is required.",
            });
        }
        const validatedStatus = status === "active" ? "active" : "inactive";
        const payload = {
            images: JSON.stringify(image), // store as array of one for consistency
            status: validatedStatus,
            title: finalTitle,
            link: link,
        };
        if (id) {
            await connection_1.db.update(schema_1.socials).set(payload).where((0, drizzle_orm_1.eq)(schema_1.socials.id, id));
            return res.status(200).json({
                status: true,
                message: "Social platform updated successfully.",
            });
        }
        else {
            await connection_1.db.insert(schema_1.socials).values(payload);
            return res.status(201).json({
                status: true,
                message: "Social platform created successfully.",
            });
        }
    }
    catch (error) {
        console.error("social error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.createUpdateSocial = createUpdateSocial;
const getAllSocial = async (req, res) => {
    try {
        const result = await connection_1.db
            .select()
            .from(schema_1.socials)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.socials.createdAt));
        // Safely parse images
        const parsed = result.map((social) => ({
            ...social,
            images: social.images ? JSON.parse(social.images) : [],
        }));
        return res.status(200).json({
            status: true,
            data: parsed,
            message: "Social data fetched successfully.",
        });
    }
    catch (error) {
        console.error("social get error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllSocial = getAllSocial;
const createUpdateFeaturedGame = async (req, res) => {
    try {
        const { image, status, title, gameId } = req.body;
        if (!gameId) {
            return res.status(400).json({
                status: false,
                message: "Game ID is required.",
            });
        }
        // Generate title if missing or not a string
        const finalTitle = typeof title === "string" && title.trim().length > 0
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
            status: validatedStatus,
            title: finalTitle,
            gameId: gameId,
        };
        // Check if a row already exists
        const existing = await connection_1.db.select().from(schema_1.featuredGames).limit(1);
        if (existing.length > 0) {
            // Update the existing row (id = 1)
            await connection_1.db
                .update(schema_1.featuredGames)
                .set(payload)
                .where((0, drizzle_orm_1.eq)(schema_1.featuredGames.id, existing[0].id));
            return res
                .status(200)
                .json({ status: true, message: "Featured game updated successfully." });
        }
        else {
            // Insert a new row with id = 1
            await connection_1.db.insert(schema_1.featuredGames).values({ id: 1, ...payload });
            return res
                .status(201)
                .json({ status: true, message: "Featured game created successfully." });
        }
    }
    catch (error) {
        console.error("create or update featured games error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.createUpdateFeaturedGame = createUpdateFeaturedGame;
const getFeaturedGame = async (req, res) => {
    try {
        const result = await connection_1.db
            .select({
            id: schema_1.featuredGames.id,
            title: schema_1.featuredGames.title,
            gameId: schema_1.featuredGames.gameId,
            images: schema_1.featuredGames.images,
            createdAt: schema_1.featuredGames.createdAt,
            gameName: schema_1.games.name,
            status: schema_1.featuredGames.status,
        })
            .from(schema_1.featuredGames)
            .leftJoin(schema_1.games, (0, drizzle_orm_1.eq)(schema_1.featuredGames.gameId, schema_1.games.id))
            .where((0, drizzle_orm_1.eq)(schema_1.featuredGames.id, 1)) // always fetch id = 1
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
    }
    catch (error) {
        console.error("getFeaturedGame error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getFeaturedGame = getFeaturedGame;
const createOrUpdateAnnouncement = async (req, res) => {
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
        const finalTitle = typeof title === "string" && title.trim().length > 0
            ? title.trim()
            : `Announcement - ${Math.floor(1000 + Math.random() * 9000)}`;
        if (id) {
            // If status is active, set all others to inactive first
            if (validatedStatus === "active") {
                await connection_1.db
                    .update(schema_1.announcements)
                    .set({ status: "inactive" })
                    .where((0, drizzle_orm_1.ne)(schema_1.announcements.id, id));
            }
            // Update the specific announcement
            await connection_1.db
                .update(schema_1.announcements)
                .set({ description, status: validatedStatus })
                .where((0, drizzle_orm_1.eq)(schema_1.announcements.id, id));
            return res.status(200).json({
                status: true,
                message: "Announcement updated successfully.",
            });
        }
        else {
            const totalCount = await (0, admin_model_1.getTotalCount)(schema_1.announcements);
            if (totalCount >= 10) {
                return res.status(400).json({
                    status: false,
                    message: "You cannot create more than 10 announcements.",
                });
            }
            // If status is active, set all others to inactive first
            if (validatedStatus === "active") {
                await connection_1.db.update(schema_1.announcements).set({ status: "inactive" });
            }
            // Create new announcement
            await connection_1.db.insert(schema_1.announcements).values({
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
    }
    catch (error) {
        console.error("createOrUpdateAnnouncement error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.createOrUpdateAnnouncement = createOrUpdateAnnouncement;
const getAllAnnouncements = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const result = await (0, admin_model_1.getPaginatedAnnouncements)(Number(page), Number(pageSize));
        return res.status(200).json({
            status: true,
            message: "Announcements fetched successfully.",
            data: result.rows,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching announcements:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllAnnouncements = getAllAnnouncements;
const deleteAnnouncement = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: false, message: "Invalid Announcement ID." });
    }
    const result = await (0, admin_model_1.deleteById)(schema_1.announcements, id);
    if (!result.success) {
        return res.status(404).json({ status: false, message: result.message });
    }
    return res.status(200).json({ status: true, message: result.message });
};
exports.deleteAnnouncement = deleteAnnouncement;
const createOrUpdateWebsitePopup = async (req, res) => {
    try {
        const { id, message, status, title, dateRange } = req.body;
        if (!message || typeof message !== "string") {
            return res.status(400).json({
                status: false,
                message: "Popup description (HTML) is required.",
            });
        }
        const validatedStatus = status === "active" ? "active" : "inactive";
        const finalTitle = typeof title === "string" && title.trim().length > 0
            ? title.trim()
            : `Popup - ${Math.floor(1000 + Math.random() * 9000)}`;
        if (id) {
            if (validatedStatus === "active") {
                await connection_1.db
                    .update(schema_1.website_popups)
                    .set({ status: "inactive" })
                    .where((0, drizzle_orm_1.ne)(schema_1.website_popups.id, id));
            }
            await connection_1.db
                .update(schema_1.website_popups)
                .set({ message, status: validatedStatus, title: finalTitle })
                .where((0, drizzle_orm_1.eq)(schema_1.website_popups.id, id));
            return res.status(200).json({
                status: true,
                message: "Website popup updated successfully.",
            });
        }
        else {
            const totalCount = await (0, admin_model_1.getTotalCount)(schema_1.website_popups);
            if (totalCount >= 10) {
                return res.status(400).json({
                    status: false,
                    message: "You cannot create more than 10 website popups.",
                });
            }
            if (validatedStatus === "active") {
                await connection_1.db.update(schema_1.website_popups).set({ status: "inactive" });
            }
            await connection_1.db.insert(schema_1.website_popups).values({
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
    }
    catch (error) {
        console.error("createOrUpdateWebsitePopup error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.createOrUpdateWebsitePopup = createOrUpdateWebsitePopup;
const getAllWebsitePopups = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        const rows = await connection_1.db
            .select()
            .from(schema_1.website_popups)
            .limit(Number(pageSize))
            .offset(offset)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.website_popups.id));
        const totalCount = await (0, admin_model_1.getTotalCount)(schema_1.website_popups);
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
    }
    catch (error) {
        console.error("Error fetching website popups:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllWebsitePopups = getAllWebsitePopups;
const deletePopup = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: false, message: "Invalid popup ID." });
    }
    const result = await (0, admin_model_1.deleteById)(schema_1.website_popups, id);
    if (!result.success) {
        return res.status(404).json({ status: false, message: result.message });
    }
    return res.status(200).json({ status: true, message: result.message });
};
exports.deletePopup = deletePopup;
const createOrUpdateWebsiteFaq = async (req, res) => {
    try {
        const { id, message, status, title, dropdownOptionsId } = req.body;
        if (!message || typeof message !== "string") {
            return res.status(400).json({
                status: false,
                message: "Faq answer is required.",
            });
        }
        if (!dropdownOptionsId) {
            return res.status(400).json({
                status: false,
                message: "Category is required.",
            });
        }
        const validatedStatus = status === "active" ? "active" : "inactive";
        const finalTitle = typeof title === "string" && title.trim().length > 0
            ? title.trim()
            : `Faq - ${Math.floor(1000 + Math.random() * 9000)}`;
        if (id) {
            await connection_1.db
                .update(schema_1.faqs)
                .set({
                message,
                status: validatedStatus,
                title: finalTitle,
                dropdownOptionsId: dropdownOptionsId,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.faqs.id, id));
            return res.status(200).json({
                status: true,
                message: "Faq updated successfully.",
            });
        }
        else {
            await connection_1.db.insert(schema_1.faqs).values({
                message,
                status: validatedStatus,
                title: finalTitle,
                dropdownOptionsId: dropdownOptionsId,
            });
            return res.status(201).json({
                status: true,
                message: "Faq created successfully.",
            });
        }
    }
    catch (error) {
        console.error("create or update faq error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.createOrUpdateWebsiteFaq = createOrUpdateWebsiteFaq;
const getAllWebsiteFaq = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        const rows = await connection_1.db
            .select({
            id: schema_1.faqs.id,
            category: schema_1.dropdownOptions.title,
            dropdownOptionsId: schema_1.faqs.dropdownOptionsId,
            title: schema_1.faqs.title,
            createdAt: schema_1.faqs.createdAt,
            status: schema_1.faqs.status,
            message: schema_1.faqs.message,
        })
            .from(schema_1.faqs)
            .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.dropdownOptions.id, schema_1.faqs.dropdownOptionsId))
            .limit(Number(pageSize))
            .offset(offset)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.faqs.id));
        const totalCount = await (0, admin_model_1.getTotalCount)(schema_1.faqs);
        return res.status(200).json({
            status: true,
            message: "Faq lists fetched successfully.",
            data: rows,
            pagination: {
                page: Number(page),
                pageSize: Number(pageSize),
                total: totalCount,
                totalPages: Math.ceil(totalCount / Number(pageSize)),
            },
        });
    }
    catch (error) {
        console.error("Error fetching faqs:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllWebsiteFaq = getAllWebsiteFaq;
const deleteFaq = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ status: false, message: "Invalid faq ID." });
    }
    const result = await (0, admin_model_1.deleteById)(schema_1.faqs, id);
    if (!result.success) {
        return res.status(404).json({ status: false, message: result.message });
    }
    return res.status(200).json({ status: true, message: result.message });
};
exports.deleteFaq = deleteFaq;
const createOrUpdateVideoAdvertisement = async (req, res) => {
    try {
        const { id, description, videoUrl, status, title, dateRange } = req.body;
        if (!title || typeof title !== "string") {
            return res.status(400).json({
                status: false,
                message: "Advertisement title is required.",
            });
        }
        const validatedStatus = status === "active" ? "active" : "inactive";
        const finalTitle = typeof title === "string" && title.trim().length > 0
            ? title.trim()
            : `Advertisement - ${Math.floor(1000 + Math.random() * 9000)}`;
        if (id) {
            if (validatedStatus === "active") {
                await connection_1.db
                    .update(schema_1.video_advertisement)
                    .set({ status: "inactive" })
                    .where((0, drizzle_orm_1.ne)(schema_1.video_advertisement.id, id));
            }
            await connection_1.db
                .update(schema_1.video_advertisement)
                .set({ description, status: validatedStatus, title: finalTitle })
                .where((0, drizzle_orm_1.eq)(schema_1.video_advertisement.id, id));
            return res.status(200).json({
                status: true,
                message: "Website advertisement updated successfully.",
            });
        }
        else {
            const totalCount = await (0, admin_model_1.getTotalCount)(schema_1.video_advertisement);
            if (totalCount >= 10) {
                return res.status(400).json({
                    status: false,
                    message: "You cannot create more than 10 website advertisement.",
                });
            }
            if (validatedStatus === "active") {
                await connection_1.db.update(schema_1.video_advertisement).set({ status: "inactive" });
            }
            await connection_1.db.insert(schema_1.video_advertisement).values({
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
    }
    catch (error) {
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.createOrUpdateVideoAdvertisement = createOrUpdateVideoAdvertisement;
const getAllVideoAdvertisement = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        const rows = await connection_1.db
            .select()
            .from(schema_1.video_advertisement)
            .limit(Number(pageSize))
            .offset(offset)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.video_advertisement.id));
        const totalCount = await (0, admin_model_1.getTotalCount)(schema_1.video_advertisement);
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
    }
    catch (error) {
        console.error("Error fetching website advertisement:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllVideoAdvertisement = getAllVideoAdvertisement;
const deleteAdvertisement = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: false, message: "Invalid advertisement ID." });
    }
    const result = await (0, admin_model_1.deleteById)(schema_1.video_advertisement, id);
    if (!result.success) {
        return res.status(404).json({ status: false, message: result.message });
    }
    return res.status(200).json({ status: true, message: result.message });
};
exports.deleteAdvertisement = deleteAdvertisement;
const createOrUpdateSponsor = async (req, res) => {
    try {
        const { id, name, logo, companyType, description, duration, status } = req.body;
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
            await connection_1.db
                .update(schema_1.sponsors)
                .set({
                name,
                logo,
                companyType,
                description,
                duration,
                status: validatedStatus,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.sponsors.id, id));
            return res
                .status(200)
                .json({ status: true, message: "Sponsor updated successfully." });
        }
        else {
            await connection_1.db.insert(schema_1.sponsors).values({
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
    }
    catch (error) {
        return res.status(500).json({ status: false, message: "Server error." });
    }
};
exports.createOrUpdateSponsor = createOrUpdateSponsor;
const getAllSponsors = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        const rows = await connection_1.db
            .select()
            .from(schema_1.sponsors)
            .limit(Number(pageSize))
            .offset(offset)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.sponsors.id));
        const totalCount = await (0, admin_model_1.getTotalCount)(schema_1.sponsors);
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
    }
    catch (error) {
        console.error("Error fetching sponsors:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllSponsors = getAllSponsors;
const deleteSponsor = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: false, message: "Invalid sponsor ID." });
    }
    const result = await (0, admin_model_1.deleteById)(schema_1.sponsors, id);
    if (!result.success) {
        return res.status(404).json({ status: false, message: result.message });
    }
    return res.status(200).json({ status: true, message: result.message });
};
exports.deleteSponsor = deleteSponsor;
const createOrUpdateAmbassador = async (req, res) => {
    try {
        const { id, name, photo, signature, description, duration, status } = req.body;
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
            await connection_1.db
                .update(schema_1.ambassadors)
                .set({
                name,
                photo,
                signature,
                description,
                duration,
                status: validatedStatus,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.ambassadors.id, id));
            return res
                .status(200)
                .json({ status: true, message: "Ambassador updated successfully." });
        }
        else {
            // Create new ambassador
            await connection_1.db.insert(schema_1.ambassadors).values({
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
    }
    catch (error) {
        console.error("Error creating/updating ambassador:", error);
        return res.status(500).json({ status: false, message: "Server error." });
    }
};
exports.createOrUpdateAmbassador = createOrUpdateAmbassador;
const getAllAmbassador = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        const rows = await connection_1.db
            .select()
            .from(schema_1.ambassadors)
            .limit(Number(pageSize))
            .offset(offset)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.ambassadors.id));
        const totalCount = await (0, admin_model_1.getTotalCount)(schema_1.ambassadors);
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
    }
    catch (error) {
        console.error("Error fetching ambassadors:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllAmbassador = getAllAmbassador;
const deleteAmbassador = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: false, message: "Invalid ambassador ID." });
    }
    const result = await (0, admin_model_1.deleteById)(schema_1.ambassadors, id);
    if (!result.success) {
        return res.status(404).json({ status: false, message: result.message });
    }
    return res.status(200).json({ status: true, message: result.message });
};
exports.deleteAmbassador = deleteAmbassador;
const createOrUpdateGamingLicenses = async (req, res) => {
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
            await connection_1.db
                .update(schema_1.gamingLicenses)
                .set({
                name,
                icon,
                duration,
                status: validatedStatus,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.gamingLicenses.id, id));
            return res.status(200).json({
                status: true,
                message: "Gaming license updated successfully.",
            });
        }
        else {
            // Create new ambassador
            await connection_1.db.insert(schema_1.gamingLicenses).values({
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
    }
    catch (error) {
        console.error("Error creating/updating Gaming license:", error);
        return res.status(500).json({ status: false, message: "Server error." });
    }
};
exports.createOrUpdateGamingLicenses = createOrUpdateGamingLicenses;
const getAllGamingLicenses = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        const rows = await connection_1.db
            .select()
            .from(schema_1.gamingLicenses)
            .limit(Number(pageSize))
            .offset(offset)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.gamingLicenses.id));
        const totalCount = await (0, admin_model_1.getTotalCount)(schema_1.gamingLicenses);
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
    }
    catch (error) {
        console.error("Error fetching gaming license:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllGamingLicenses = getAllGamingLicenses;
const deleteGamingLicenses = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: false, message: "Invalid gaming license ID." });
    }
    const result = await (0, admin_model_1.deleteById)(schema_1.gamingLicenses, id);
    if (!result.success) {
        return res.status(404).json({ status: false, message: result.message });
    }
    return res.status(200).json({ status: true, message: result.message });
};
exports.deleteGamingLicenses = deleteGamingLicenses;
const createOrUpdateResponsibleGaming = async (req, res) => {
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
            await connection_1.db
                .update(schema_1.responsibleGaming)
                .set({
                name,
                icon,
                duration,
                status: validatedStatus,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.responsibleGaming.id, id));
            return res.status(200).json({
                status: true,
                message: "Responsible gaming updated successfully.",
            });
        }
        else {
            // Create new ambassador
            await connection_1.db.insert(schema_1.responsibleGaming).values({
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
    }
    catch (error) {
        console.error("Error creating/updating responsible gaming:", error);
        return res.status(500).json({ status: false, message: "Server error." });
    }
};
exports.createOrUpdateResponsibleGaming = createOrUpdateResponsibleGaming;
const getAllResponsibleGaming = async (req, res) => {
    try {
        const { page = 1, pageSize = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(pageSize);
        const rows = await connection_1.db
            .select()
            .from(schema_1.responsibleGaming)
            .limit(Number(pageSize))
            .offset(offset)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.responsibleGaming.id));
        const totalCount = await (0, admin_model_1.getTotalCount)(schema_1.responsibleGaming);
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
    }
    catch (error) {
        console.error("Error fetching responsible gaming:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllResponsibleGaming = getAllResponsibleGaming;
const deleteResponsibleGaming = async (req, res) => {
    const id = Number(req.params.id);
    if (isNaN(id)) {
        return res
            .status(400)
            .json({ status: false, message: "Invalid responsible gaming ID." });
    }
    const result = await (0, admin_model_1.deleteById)(schema_1.responsibleGaming, id);
    if (!result.success) {
        return res.status(404).json({ status: false, message: result.message });
    }
    return res.status(200).json({ status: true, message: result.message });
};
exports.deleteResponsibleGaming = deleteResponsibleGaming;
// game provider
const addOrUpdateGameProvider = async (req, res) => {
    try {
        const userData = req?.user;
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
        const { id, name, parentId, status = "inactive", minBalanceLimit, providerIp, licenseKey, phone, email, whatsapp, telegram, country, logo, isMenu, icon, } = req.body;
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
            const [parentProvider] = await connection_1.db
                .select({ name: schema_1.game_providers.name })
                .from(schema_1.game_providers)
                .where((0, drizzle_orm_1.eq)(schema_1.game_providers.id, payload.parentId));
            if (parentProvider) {
                payload.parentName = parentProvider.name;
            }
            else {
                return res.status(400).json({
                    status: false,
                    message: "Invalid parent provider ID",
                });
            }
        }
        if (id) {
            await (0, admin_model_1.updateGameProvider)(Number(id), payload);
            return res.status(200).json({
                status: true,
                message: "Game provider updated successfully",
                data: payload,
            });
        }
        else {
            await (0, admin_model_1.createGameProvider)(payload);
            return res.status(201).json({
                status: true,
                message: "Game provider created successfully",
            });
        }
    }
    catch (error) {
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
exports.addOrUpdateGameProvider = addOrUpdateGameProvider;
const getGameProvidersList = async (req, res) => {
    try {
        const { id, page = 1, pageSize = 10, publicList, isParent, parentId, name, status, } = req.query;
        const providerId = id ? Number(id) : undefined;
        const isParentBool = isParent === "true";
        if (providerId) {
            const provider = await (0, admin_model_1.getGameProviderById)(providerId);
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
            const allSubProviders = await (0, admin_model_1.getGameSubProviderByGameProviderId)(Number(parentId));
            return res.status(200).json({
                status: true,
                message: "All sub game providers fetched successfully.",
                data: allSubProviders,
            });
        }
        if (publicList === "true") {
            const allProviders = await (0, admin_model_1.getAllGameProviders)(isParentBool);
            return res.status(200).json({
                status: true,
                message: "All game providers fetched successfully.",
                data: allProviders,
            });
        }
        // Validate and sanitize status
        const validStatuses = ["active", "inactive"];
        // Ensure status is valid
        let statusFilter = undefined;
        if (status && validStatuses.includes(status)) {
            statusFilter = status;
        }
        const result = await (0, admin_model_1.getPaginatedGameProviders)(Number(page), Number(pageSize), Number(parentId), String(name), statusFilter);
        return res.status(200).json({
            status: true,
            message: "Game providers fetched successfully.",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching game providers:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getGameProvidersList = getGameProvidersList;
const addOrUpdateGame = async (req, res) => {
    const userData = req?.user;
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
        const userData = req?.user;
        const { id, name, parentId, status = "inactive", apiKey, licenseKey, gameLogo, secretPin, gameUrl, ggrPercent, categoryId, providerId, createdBy, isExclusive, } = req.body;
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
            await (0, admin_model_1.updateGame)(Number(id), payload);
            return res.status(200).json({
                status: true,
                message: "Game updated successfully",
            });
        }
        else {
            await (0, admin_model_1.createGame)(payload);
            return res.status(201).json({
                status: true,
                message: "Game created successfully",
            });
        }
    }
    catch (error) {
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
exports.addOrUpdateGame = addOrUpdateGame;
const getGameList = async (req, res) => {
    try {
        const { id, page = 1, pageSize = 10, name, status } = req.query;
        const gameId = id ? Number(id) : undefined;
        if (gameId) {
            const gameDetails = await (0, admin_model_1.getGameDetailsById)(Number(gameId));
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
        // Validate and sanitize status
        const validStatuses = ["active", "inactive"];
        // Ensure status is valid
        let statusFilter = undefined;
        if (status && validStatuses.includes(status)) {
            statusFilter = status;
        }
        const result = await (0, admin_model_1.getPaginatedGameList)(Number(page), Number(pageSize), String(name), statusFilter);
        return res.status(200).json({
            status: true,
            message: "Game list fetched successfully.",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching game list:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getGameList = getGameList;
// sports provider
const addOrUpdateSportsProvider = async (req, res) => {
    try {
        const userData = req?.user;
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
        const { id, name, parentId, status = "inactive", minBalanceLimit, providerIp, licenseKey, phone, email, whatsapp, telegram, country, logo, isMenu, icon, } = req.body;
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
            const [parentProvider] = await connection_1.db
                .select({ name: schema_1.sports_providers.name })
                .from(schema_1.sports_providers)
                .where((0, drizzle_orm_1.eq)(schema_1.sports_providers.id, payload.parentId));
            if (parentProvider) {
                payload.parentName = parentProvider.name;
            }
            else {
                return res.status(400).json({
                    status: false,
                    message: "Invalid parent provider ID",
                });
            }
        }
        if (id) {
            await (0, admin_model_1.updateSportsProvider)(Number(id), payload);
            return res.status(200).json({
                status: true,
                message: "Sports provider updated successfully",
                data: payload,
            });
        }
        else {
            await (0, admin_model_1.createSportsProvider)(payload);
            return res.status(201).json({
                status: true,
                message: "Sports provider created successfully",
            });
        }
    }
    catch (error) {
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
exports.addOrUpdateSportsProvider = addOrUpdateSportsProvider;
const getSportsProvidersList = async (req, res) => {
    try {
        const { id, page = 1, pageSize = 10, publicList, isParent, parentId, name, status, } = req.query;
        const providerId = id ? Number(id) : undefined;
        const isParentBool = isParent === "true";
        if (providerId) {
            const provider = await (0, admin_model_1.getSportsProviderById)(providerId);
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
            const allSubProviders = await (0, admin_model_1.getSportSubProviderBySportProviderId)(Number(parentId));
            return res.status(200).json({
                status: true,
                message: "All sub sport providers fetched successfully.",
                data: allSubProviders,
            });
        }
        if (publicList === "true") {
            const allProviders = await (0, admin_model_1.getAllSportsProviders)(isParentBool);
            return res.status(200).json({
                status: true,
                message: "All sports providers fetched successfully.",
                data: allProviders,
            });
        }
        // Validate and sanitize status
        const validStatuses = ["active", "inactive"];
        // Ensure status is valid
        let statusFilter = undefined;
        if (status && validStatuses.includes(status)) {
            statusFilter = status;
        }
        const result = await (0, admin_model_1.getPaginatedSportsProviders)(Number(page), Number(pageSize), parentId, String(name), statusFilter);
        return res.status(200).json({
            status: true,
            message: "Sports providers fetched successfully.",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching sports providers:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getSportsProvidersList = getSportsProvidersList;
const addOrUpdateSport = async (req, res) => {
    try {
        const userData = req?.user;
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
        const { id, name, parentId, status = "inactive", apiKey, licenseKey, sportLogo, secretPin, sportUrl, ggrPercent, categoryId, providerId, createdBy, isExclusive, } = req.body;
        const createdByData = req?.user?.username ?? createdBy;
        const payload = {
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
            await (0, admin_model_1.updateSport)(Number(id), payload);
            return res.status(200).json({
                status: true,
                message: "Sport updated successfully",
                data: payload,
            });
        }
        else {
            await (0, admin_model_1.createSport)(payload);
            return res.status(201).json({
                status: true,
                message: "Sport created successfully",
            });
        }
    }
    catch (error) {
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
exports.addOrUpdateSport = addOrUpdateSport;
const getSportList = async (req, res) => {
    try {
        const { id, page = 1, pageSize = 10, status, name, publicList } = req.query;
        const sportId = id ? Number(id) : undefined;
        if (sportId) {
            const sportDetails = await (0, admin_model_1.getSportDetailsById)(sportId);
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
        // Validate and sanitize status
        const validStatuses = ["active", "inactive"];
        // Ensure status is valid
        let statusFilter = undefined;
        if (status && validStatuses.includes(status)) {
            statusFilter = status;
        }
        const validPublicList = publicList === "true" ? true : false;
        const result = await (0, admin_model_1.getPaginatedSportList)(Number(page), Number(pageSize), validPublicList, String(name), statusFilter);
        return res.status(200).json({
            status: true,
            message: "Sport list fetched successfully.",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching sport list:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getSportList = getSportList;
const getMenuProviders = async (req, res) => {
    try {
        const result = await (0, admin_model_1.getAllMenuProviders)();
        return res.status(200).json({
            status: true,
            message: "Menu providers fetched successfully.",
            data: result,
        });
    }
    catch (error) {
        console.error("Error fetching menu providers:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getMenuProviders = getMenuProviders;
const updateMenuPriority = async (req, res) => {
    try {
        const { id, type, currentPosition, updatedPosition, updatedStatus = false, } = req.body;
        let table;
        if (type === "game")
            table = schema_1.game_providers;
        else if (type === "sports")
            table = schema_1.sports_providers;
        else if (type === "category")
            table = schema_1.dropdownOptions;
        else {
            return res.status(400).json({ status: false, message: "Invalid type." });
        }
        if (updatedStatus) {
            if (id) {
                const validStatus = updatedStatus === "active" ? true : false;
                const payload = { isMenu: validStatus };
                await (0, admin_model_1.updateGameProvider)(Number(id), payload);
                await (0, admin_model_1.updateSportsProvider)(Number(id), payload);
                // Update status
                await connection_1.db
                    .update(schema_1.dropdownOptions)
                    .set(payload)
                    .where((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.id, Number(id)));
                return res.status(200).json({
                    status: true,
                    message: "Menu status updated successfully",
                    data: payload,
                });
            }
            else {
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
        const swapMenuPriorityIfExists = async (table, updatedPosition, currentPosition) => {
            const existingItem = await connection_1.db
                .select()
                .from(table)
                .where((0, drizzle_orm_1.eq)(table.menuPriority, updatedPosition))
                .execute();
            if (existingItem.length > 0) {
                await connection_1.db
                    .update(table)
                    .set({ menuPriority: currentPosition })
                    .where((0, drizzle_orm_1.eq)(table.id, existingItem[0].id));
            }
        };
        // Check all 3 tables for the updatedPosition
        if (currentPosition !== 0) {
            await swapMenuPriorityIfExists(schema_1.game_providers, updatedPosition, currentPosition);
            await swapMenuPriorityIfExists(schema_1.sports_providers, updatedPosition, currentPosition);
            await swapMenuPriorityIfExists(schema_1.dropdownOptions, updatedPosition, currentPosition);
        }
        // Update the menu being moved
        await connection_1.db
            .update(table)
            .set({ menuPriority: updatedPosition })
            .where((0, drizzle_orm_1.eq)(table.id, id));
        return res.status(200).json({
            status: true,
            message: "Menu priority updated successfully",
        });
    }
    catch (error) {
        console.error("Error updating menu priority:", error);
        return res.status(500).json({ status: false, message: "Server error" });
    }
};
exports.updateMenuPriority = updateMenuPriority;
const createUpdateKyc = async (req, res) => {
    try {
        const { id, documentType, documentNo, expiryDate, documentFront, documentBack, selfie, holderId, holderType, status, dob, fullName, } = req.body;
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
        const validatedStatus = status === "approved" || status === "rejected" ? status : "pending";
        // ---------------------- Update or Create ----------------------
        let kycToUpdate;
        if (id) {
            // Update by provided ID
            kycToUpdate = await connection_1.db.select().from(kyc_1.kyc).where((0, drizzle_orm_1.eq)(kyc_1.kyc.id, id));
        }
        if (!kycToUpdate || kycToUpdate.length === 0) {
            // If no ID or record not found by ID, check holderId + holderType
            kycToUpdate = await connection_1.db
                .select()
                .from(kyc_1.kyc)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, holderId), (0, drizzle_orm_1.eq)(kyc_1.kyc.holderType, holderType)));
        }
        const updateKycUserStatus = async () => {
            if (holderType === "player") {
                await connection_1.db
                    .update(schema_1.users)
                    .set({ kyc_status: "pending" })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, holderId));
            }
            else {
                await connection_1.db
                    .update(schema_1.adminUsers)
                    .set({ kyc_status: "pending" })
                    .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, holderId));
            }
        };
        const insertKycNotification = async (isUpdate) => {
            const type = (holderType === "player" ? "admin_player_kyc" : "admin_affiliate_kyc");
            const title = isUpdate
                ? `KYC updated for ${holderType} #${holderId}`
                : `New KYC submitted by ${holderType} #${holderId}`;
            const description = `
        KYC ${isUpdate ? "updated" : "created"} for <strong>${fullName}</strong>.<br/>
        Document Type: <strong>${documentType}</strong><br/>
        Document Number: <strong>${documentNo}</strong><br/>
        Status: <strong>${validatedStatus}</strong>
      `;
            await connection_1.db.insert(schema_1.notifications).values({
                notificationType: type,
                title,
                description,
                playerIds: String(holderId),
                startDate: new Date(),
                link: holderType === "player" ? `/kyc-request-history` : `/affiliate-list/${holderId}/kyc-verification`,
                endDate: new Date(new Date().setDate(new Date().getDate() + 7)), // visible for 7 days
                status: "active",
                createdBy: holderId, // or admin ID if available
            });
        };
        if (kycToUpdate && kycToUpdate.length > 0) {
            // Update existing KYC
            await connection_1.db
                .update(kyc_1.kyc)
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
                .where((0, drizzle_orm_1.eq)(kyc_1.kyc.id, kycToUpdate[0].id));
            await updateKycUserStatus();
            return res
                .status(200)
                .json({ status: true, message: "KYC updated successfully." });
        }
        else {
            // Create new KYC
            await connection_1.db.insert(kyc_1.kyc).values({
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
            await updateKycUserStatus();
            return res
                .status(200)
                .json({ status: true, message: "KYC created successfully." });
        }
    }
    catch (error) {
        console.error("Error creating/updating KYC:", error);
        return res.status(500).json({ status: false, message: "Server error." });
    }
};
exports.createUpdateKyc = createUpdateKyc;
const sendKycVerificationRequest = async (req, res) => {
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
            const updated = await connection_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, Number(holderId)));
            if (!updated.length) {
                return res
                    .status(404)
                    .json({ status: false, message: "Player not found." });
            }
            await connection_1.db
                .update(schema_1.users)
                .set({ kyc_status: "required" })
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, Number(holderId)));
            const updatedKyc = await connection_1.db
                .select()
                .from(kyc_1.kyc)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, Number(holderId)), (0, drizzle_orm_1.eq)(kyc_1.kyc.holderType, holderType)));
            if (updatedKyc.length) {
                const result = await connection_1.db
                    .update(kyc_1.kyc)
                    .set({ status: "pending" })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, Number(holderId)), (0, drizzle_orm_1.eq)(kyc_1.kyc.holderType, holderType)));
                console.log("updated kyc", result);
            }
        }
        else {
            const updated = await connection_1.db
                .select()
                .from(schema_1.adminUsers)
                .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, Number(holderId)));
            if (!updated.length) {
                return res
                    .status(404)
                    .json({ status: false, message: "Affiliate/Agent not found." });
            }
            await connection_1.db
                .update(schema_1.adminUsers)
                .set({ kyc_status: "required" })
                .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, Number(holderId)));
            const updatedKyc = await connection_1.db
                .select()
                .from(kyc_1.kyc)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, Number(holderId)), (0, drizzle_orm_1.eq)(kyc_1.kyc.holderType, holderType)));
            if (updatedKyc.length) {
                const result = await connection_1.db
                    .update(kyc_1.kyc)
                    .set({ status: "pending" })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, Number(holderId)), (0, drizzle_orm_1.eq)(kyc_1.kyc.holderType, holderType)));
                console.log("updated kyc", result);
            }
        }
        // ---------------------- Success ----------------------
        return res.status(200).json({
            status: true,
            message: "KYC verification request sent successfully.",
        });
    }
    catch (error) {
        console.error("Error sending KYC verification request:", error);
        return res.status(500).json({ status: false, message: "Server error." });
    }
};
exports.sendKycVerificationRequest = sendKycVerificationRequest;
const updateKycStatus = async (req, res) => {
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
        const result = await connection_1.db
            .update(kyc_1.kyc)
            .set({ status, updated_at: new Date() })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.id, kycId), (0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, holderId)));
        if (!result) {
            return res.status(404).json({ status: false, message: "KYC not found." });
        }
        // ---------------------- Update User/Admin User KYC Status ----------------------
        if (status === "approved") {
            if (holderType === "player") {
                // Update kyc_status in users table
                await connection_1.db
                    .update(schema_1.users)
                    .set({ kyc_status: "verified" })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, holderId));
            }
            else if (holderType === "affiliate" || holderType === "agent") {
                // Update kyc_status in adminUsers table
                await connection_1.db
                    .update(schema_1.adminUsers)
                    .set({ kyc_status: "verified" })
                    .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, holderId));
            }
        }
        else {
            if (holderType === "player") {
                const updated = await connection_1.db
                    .select()
                    .from(schema_1.users)
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, Number(holderId)));
                if (!updated.length) {
                    return res
                        .status(404)
                        .json({ status: false, message: "Player not found." });
                }
                await connection_1.db
                    .update(schema_1.users)
                    .set({ kyc_status: "required" })
                    .where((0, drizzle_orm_1.eq)(schema_1.users.id, Number(holderId)));
                const updatedKyc = await connection_1.db
                    .select()
                    .from(kyc_1.kyc)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, Number(holderId)), (0, drizzle_orm_1.eq)(kyc_1.kyc.holderType, holderType)));
                if (updatedKyc.length) {
                    const result = await connection_1.db
                        .update(kyc_1.kyc)
                        .set({ status: status })
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, Number(holderId)), (0, drizzle_orm_1.eq)(kyc_1.kyc.holderType, holderType)));
                    console.log("updated kyc", result);
                }
            }
            else {
                const updated = await connection_1.db
                    .select()
                    .from(schema_1.adminUsers)
                    .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, Number(holderId)));
                if (!updated.length) {
                    return res
                        .status(404)
                        .json({ status: false, message: "Affiliate/Agent not found." });
                }
                await connection_1.db
                    .update(schema_1.adminUsers)
                    .set({ kyc_status: "required" })
                    .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, Number(holderId)));
                const updatedKyc = await connection_1.db
                    .select()
                    .from(kyc_1.kyc)
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, Number(holderId)), (0, drizzle_orm_1.eq)(kyc_1.kyc.holderType, holderType)));
                if (updatedKyc.length) {
                    const result = await connection_1.db
                        .update(kyc_1.kyc)
                        .set({ status: status })
                        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, Number(holderId)), (0, drizzle_orm_1.eq)(kyc_1.kyc.holderType, holderType)));
                    console.log("updated kyc", result);
                }
            }
        }
        return res
            .status(200)
            .json({ status: true, message: "KYC status updated successfully." });
    }
    catch (error) {
        console.error("Error updating KYC status:", error);
        return res.status(500).json({ status: false, message: "Server error." });
    }
};
exports.updateKycStatus = updateKycStatus;
const getKycList = async (req, res) => {
    try {
        const { kycId, page = 1, limit = 10, status, search, holderType, } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const offset = (pageNum - 1) * limitNum;
        // Filter and sanitize status
        const validStatuses = ["approved", "rejected", "pending"];
        let statusFilter = undefined;
        if (status && validStatuses.includes(status)) {
            statusFilter = status;
        }
        const whereClauses = [];
        if (search) {
            const kw = `%${search}%`;
            whereClauses.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(kyc_1.kyc.fullName, kw), (0, drizzle_orm_1.like)(kyc_1.kyc.documentNo, kw)));
        }
        if (statusFilter) {
            whereClauses.push((0, drizzle_orm_1.eq)(kyc_1.kyc.status, statusFilter));
        }
        // Single KYC by ID
        // Add kycId and holderType filter if provided
        if (Boolean(Number(kycId || 0))) {
            whereClauses.push((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, Number(kycId || 0)));
            if (holderType) {
                whereClauses.push((0, drizzle_orm_1.eq)(kyc_1.kyc.holderType, holderType));
            }
        }
        // Base query with LEFT JOINs for holder details
        const baseQuery = connection_1.db
            .select({
            id: kyc_1.kyc.id,
            documentType: kyc_1.kyc.documentType,
            fullName: kyc_1.kyc.fullName,
            documentNo: kyc_1.kyc.documentNo,
            expiryDate: kyc_1.kyc.expiryDate,
            documentFront: kyc_1.kyc.documentFront,
            documentBack: kyc_1.kyc.documentBack,
            selfie: kyc_1.kyc.selfie,
            holderId: kyc_1.kyc.holderId,
            holderType: kyc_1.kyc.holderType,
            status: kyc_1.kyc.status,
            created_at: kyc_1.kyc.created_at,
            updated_at: kyc_1.kyc.updated_at,
            dob: kyc_1.kyc.dob,
            holderUsername: (0, drizzle_orm_1.sql) `COALESCE(users.username, admin_users.username)`.as("holderUsername"),
            holderEmail: (0, drizzle_orm_1.sql) `COALESCE(users.email, admin_users.email)`.as("holderEmail"),
            holderKycStatus: (0, drizzle_orm_1.sql) `COALESCE(users.kyc_status, admin_users.kyc_status)`.as("holderKycStatus"),
        })
            .from(kyc_1.kyc)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, schema_1.users.id), (0, drizzle_orm_1.eq)(kyc_1.kyc.holderType, "player")))
            .leftJoin(schema_1.adminUsers, (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(kyc_1.kyc.holderId, schema_1.adminUsers.id), (0, drizzle_orm_1.inArray)(kyc_1.kyc.holderType, ["affiliate", "agent"])))
            .where((0, drizzle_orm_1.and)(...whereClauses))
            .orderBy((0, drizzle_orm_1.desc)(kyc_1.kyc.created_at));
        // Paginated list
        const [totalCountResult] = await connection_1.db
            .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)`.as("count") })
            .from(kyc_1.kyc);
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
    }
    catch (error) {
        console.error("Error fetching KYC data:", error);
        return res.status(500).json({ status: false, message: "Server error." });
    }
};
exports.getKycList = getKycList;
const createOrUpdateConversion = async (req, res) => {
    try {
        const { id, fromCurrency, toCurrency, rate } = req.body;
        // ---------------------- Validation ----------------------
        if (!fromCurrency || typeof fromCurrency !== "number") {
            return res.status(400).json({
                status: false,
                message: "From currency is required and must be a number.",
            });
        }
        if (!toCurrency || typeof toCurrency !== "number") {
            return res.status(400).json({
                status: false,
                message: "To currency is required and must be a number.",
            });
        }
        if (!rate || isNaN(rate)) {
            return res.status(400).json({
                status: false,
                message: "Rate is required and must be a number.",
            });
        }
        let conversionToUpdate;
        if (id) {
            // If ID is provided, find by ID
            conversionToUpdate = await connection_1.db
                .select()
                .from(schema_1.currencyConversion)
                .where((0, drizzle_orm_1.eq)(schema_1.currencyConversion.id, id));
        }
        else {
            // If no ID, check if a record with same fromCurrency and toCurrency exists
            conversionToUpdate = await connection_1.db
                .select()
                .from(schema_1.currencyConversion)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.currencyConversion.fromCurrency, fromCurrency), (0, drizzle_orm_1.eq)(schema_1.currencyConversion.toCurrency, toCurrency)));
        }
        if (conversionToUpdate && conversionToUpdate.length > 0) {
            // Update existing record
            await connection_1.db
                .update(schema_1.currencyConversion)
                .set({
                rate: Number(rate).toFixed(2),
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.currencyConversion.id, conversionToUpdate[0].id));
            return res
                .status(200)
                .json({ status: true, message: "Conversion updated successfully." });
        }
        else {
            // Create new record
            await connection_1.db.insert(schema_1.currencyConversion).values({
                fromCurrency,
                toCurrency,
                rate: Number(rate).toFixed(2),
            });
            return res
                .status(200)
                .json({ status: true, message: "Conversion created successfully." });
        }
    }
    catch (error) {
        console.error("Error creating/updating conversion:", error);
        return res.status(500).json({ status: false, message: "Server error." });
    }
};
exports.createOrUpdateConversion = createOrUpdateConversion;
const deleteConversionById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!id) {
            return res.status(400).json({
                status: false,
                message: "ID is required to delete a conversion.",
            });
        }
        // Check if record exists
        const existing = await connection_1.db
            .select()
            .from(schema_1.currencyConversion)
            .where((0, drizzle_orm_1.eq)(schema_1.currencyConversion.id, Number(id)));
        if (!existing || existing.length === 0) {
            return res.status(404).json({
                status: false,
                message: "Conversion not found.",
            });
        }
        // Delete record
        await connection_1.db
            .delete(schema_1.currencyConversion)
            .where((0, drizzle_orm_1.eq)(schema_1.currencyConversion.id, Number(id)));
        return res.status(200).json({
            status: true,
            message: "Conversion deleted successfully.",
        });
    }
    catch (error) {
        console.error("Error deleting conversion:", error);
        return res.status(500).json({ status: false, message: "Server error." });
    }
};
exports.deleteConversionById = deleteConversionById;
const getConversionList = async (req, res) => {
    try {
        const { id } = req.query;
        // Aliases for joining currencies twice
        const fromCurrency = (0, mysql_core_1.alias)(schema_1.currencies, "fromCurrency");
        const toCurrency = (0, mysql_core_1.alias)(schema_1.currencies, "toCurrency");
        // Base query builder
        const baseQuery = connection_1.db
            .select({
            id: schema_1.currencyConversion.id,
            rate: schema_1.currencyConversion.rate,
            createdAt: schema_1.currencyConversion.createdAt,
            updatedAt: schema_1.currencyConversion.updatedAt,
            // from currency details
            fromId: fromCurrency.id,
            fromCode: fromCurrency.code,
            fromSymbol: fromCurrency.symbol,
            fromName: fromCurrency.name,
            // to currency details
            toId: toCurrency.id,
            toCode: toCurrency.code,
            toSymbol: toCurrency.symbol,
            toName: toCurrency.name,
        })
            .from(schema_1.currencyConversion)
            .leftJoin(fromCurrency, (0, drizzle_orm_1.eq)(schema_1.currencyConversion.fromCurrency, fromCurrency.id))
            .leftJoin(toCurrency, (0, drizzle_orm_1.eq)(schema_1.currencyConversion.toCurrency, toCurrency.id));
        if (id) {
            // Add where clause directly before execution
            const [single] = await baseQuery.where((0, drizzle_orm_1.eq)(schema_1.currencyConversion.id, Number(id)));
            if (!single) {
                return res
                    .status(404)
                    .json({ success: false, message: "Conversion not found" });
            }
            return res.json({ success: true, data: single });
        }
        const result = await baseQuery; // fetch all
        return res.json({ success: true, data: result });
    }
    catch (error) {
        console.error("Error fetching conversions:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getConversionList = getConversionList;
const createCustomNotification = async (req, res) => {
    try {
        const { notificationType, title, description, posterImg, amount, turnoverMultiply, promotionId, startDate, endDate, status, playerIds, } = req.body;
        // ===== Validation =====
        if (!notificationType || !title || !startDate || !endDate) {
            return res.status(400).json({
                status: false,
                message: "Missing required fields",
            });
        }
        if (!playerIds) {
            return res.status(400).json({
                status: false,
                message: "Select a player and try again",
            });
        }
        const createdByData = req?.user?.id ?? undefined;
        // Insert notification
        const [newNotification] = await connection_1.db.insert(schema_1.notifications).values({
            notificationType,
            title,
            description: description || null,
            posterImg: posterImg || null,
            amount: amount ?? null,
            turnoverMultiply: turnoverMultiply ?? null,
            promotionId: promotionId ?? null,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            createdBy: Number(createdByData) ?? undefined,
            status: status || "active",
            playerIds: playerIds.join(","),
        });
        // Emit socket events so clients can refresh notifications in real-time
        try {
            const targetIds = Array.isArray(playerIds)
                ? playerIds
                    .map((v) => Number(v))
                    .filter((v) => Number.isFinite(v) && v > 0)
                : [];
            const uniqueIds = Array.from(new Set(targetIds));
            uniqueIds.forEach((uid) => {
                __1.io.emit(`user-notifications-${uid}`, {
                    userId: uid,
                    event: "notification_created",
                    notificationId: newNotification?.insertId,
                    // Clients should call the API to fetch fresh notifications
                    refresh: true,
                });
            });
        }
        catch (socketErr) {
            console.error("Socket emit error (createCustomNotification):", socketErr);
            // Do not fail the request if socket broadcasting fails
        }
        return res.json({
            status: true,
            data: newNotification,
            message: "Notification created successfully",
        });
    }
    catch (error) {
        console.error("Insert notification error:", error);
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
        });
    }
};
exports.createCustomNotification = createCustomNotification;
const getCustomNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page || "1");
        const pageSize = parseInt(req.query.pageSize || "20");
        const status = req.query.status || "";
        const type = req.query.type || "";
        const search = req.query.search || "";
        const offset = (page - 1) * pageSize;
        // Query total count
        const countResult = await connection_1.db
            .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)`.as("count") })
            .from(schema_1.notifications);
        const total = Number(countResult[0].count);
        // Query paginated data
        const data = await connection_1.db
            .select()
            .from(schema_1.notifications)
            .limit(Number(pageSize))
            .offset(offset)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.notifications.createdAt));
        res.json({
            success: true,
            data,
            pagination: {
                total: total || 0,
                page,
                pageSize,
            },
        });
    }
    catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.getCustomNotifications = getCustomNotifications;
const updateCustomNotification = async (req, res) => {
    try {
        const id = Number(req.params.notifyId);
        const { status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ success: false, message: "Invalid data" });
        }
        const updated = await connection_1.db
            .update(schema_1.notifications)
            .set({ status, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(schema_1.notifications.id, id));
        res.json({
            success: true,
            message: "Status updated successfully",
            data: updated[0],
        });
    }
    catch (err) {
        console.error("Error updating notification:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
exports.updateCustomNotification = updateCustomNotification;
