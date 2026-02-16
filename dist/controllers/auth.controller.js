"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.resendOtp = exports.verifyOtp = void 0;
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const emailService_1 = require("../utils/emailService");
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generate a 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
/**
 * Verify OTP for email verification
 * POST /api/users/verify-otp
 * Body: { email, otp }
 */
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({
                status: false,
                message: "Email and OTP are required",
            });
        }
        // Find user by email
        const user = await connection_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }
        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({
                status: false,
                message: "Email is already verified",
            });
        }
        // Check if OTP matches
        if (user.otp !== otp) {
            return res.status(400).json({
                status: false,
                message: "Invalid OTP",
            });
        }
        // Check if OTP has expired
        if (!user.otp_expiry || new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({
                status: false,
                message: "OTP has expired. Please request a new one.",
            });
        }
        // Verify user and clear OTP
        await connection_1.db
            .update(schema_1.users)
            .set({
            isVerified: true,
            otp: null,
            otp_expiry: null,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        return res.json({
            status: true,
            message: "Email verified successfully. You can now login.",
        });
    }
    catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to verify OTP",
        });
    }
};
exports.verifyOtp = verifyOtp;
/**
 * Resend OTP for email verification
 * POST /api/users/resend-otp
 * Body: { email }
 */
const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                status: false,
                message: "Email is required",
            });
        }
        // Find user by email
        const user = await connection_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }
        // Check if user is already verified
        if (user.isVerified) {
            return res.status(400).json({
                status: false,
                message: "Email is already verified",
            });
        }
        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes
        // Update user with new OTP
        await connection_1.db
            .update(schema_1.users)
            .set({
            otp,
            otp_expiry: otpExpiry,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        // Send OTP email
        const emailResult = await (0, emailService_1.sendOTPEmail)(email, otp, 10);
        if (!emailResult.success) {
            return res.status(500).json({
                status: false,
                message: "Failed to send OTP email. Please try again.",
            });
        }
        return res.json({
            status: true,
            message: "OTP has been resent to your email",
        });
    }
    catch (error) {
        console.error("Resend OTP error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to resend OTP",
        });
    }
};
exports.resendOtp = resendOtp;
/**
 * Forgot Password - Send reset token
 * POST /api/users/forgot-password
 * Body: { email }
 */
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                status: false,
                message: "Email is required",
            });
        }
        // Find user by email
        const user = await connection_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
        if (!user) {
            // Return success even if user not found (security best practice)
            return res.json({
                status: true,
                message: "If the email exists, a password reset link has been sent.",
            });
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date();
        resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 30); // Token valid for 30 minutes
        // Update user with reset token
        await connection_1.db
            .update(schema_1.users)
            .set({
            reset_password_token: resetToken,
            reset_password_token_expiry: resetTokenExpiry,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        // Create reset link (adjust frontend URL as needed)
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
        // Send password reset email
        const emailResult = await (0, emailService_1.sendPasswordResetEmail)(email, resetLink, 30);
        if (!emailResult.success) {
            return res.status(500).json({
                status: false,
                message: "Failed to send password reset email. Please try again.",
            });
        }
        return res.json({
            status: true,
            message: "If the email exists, a password reset link has been sent.",
        });
    }
    catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to process password reset request",
        });
    }
};
exports.forgotPassword = forgotPassword;
/**
 * Reset Password - Update password with token
 * POST /api/users/reset-password
 * Body: { token, newPassword }
 */
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                status: false,
                message: "Token and new password are required",
            });
        }
        // Validate password length
        if (newPassword.length < 6) {
            return res.status(400).json({
                status: false,
                message: "Password must be at least 6 characters long",
            });
        }
        // Find user by reset token
        const user = await connection_1.db.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.reset_password_token, token),
        });
        if (!user) {
            return res.status(400).json({
                status: false,
                message: "Invalid or expired reset token",
            });
        }
        // Check if token has expired
        if (!user.reset_password_token_expiry ||
            new Date() > new Date(user.reset_password_token_expiry)) {
            return res.status(400).json({
                status: false,
                message: "Reset token has expired. Please request a new one.",
            });
        }
        // Hash new password - DISABLED to match registration logic (plain text)
        // const hashedPassword = await bcrypt.hash(newPassword, 10);
        // Update password and clear reset token
        await connection_1.db
            .update(schema_1.users)
            .set({
            password: newPassword, // Store as plain text
            reset_password_token: null,
            reset_password_token_expiry: null,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, user.id));
        return res.json({
            status: true,
            message: "Password has been reset successfully. You can now login.",
        });
    }
    catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to reset password",
        });
    }
};
exports.resetPassword = resetPassword;
