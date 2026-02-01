import { Request, Response } from "express";
import { db } from "../db/connection";
import { users } from "../db/schema";
import { eq, and, gt } from "drizzle-orm";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/emailService";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * Generate a 6-digit OTP
 */
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Verify OTP for email verification
 * POST /api/users/verify-otp
 * Body: { email, otp }
 */
export const verifyOtp = async (req: Request, res: Response) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                status: false,
                message: "Email and OTP are required",
            });
        }

        // Find user by email
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
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
        await db
            .update(users)
            .set({
                isVerified: true,
                otp: null,
                otp_expiry: null,
            })
            .where(eq(users.id, user.id));

        return res.json({
            status: true,
            message: "Email verified successfully. You can now login.",
        });
    } catch (error) {
        console.error("Verify OTP error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to verify OTP",
        });
    }
};

/**
 * Resend OTP for email verification
 * POST /api/users/resend-otp
 * Body: { email }
 */
export const resendOtp = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: false,
                message: "Email is required",
            });
        }

        // Find user by email
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
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
        await db
            .update(users)
            .set({
                otp,
                otp_expiry: otpExpiry,
            })
            .where(eq(users.id, user.id));

        // Send OTP email
        const emailResult = await sendOTPEmail(email, otp, 10);

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
    } catch (error) {
        console.error("Resend OTP error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to resend OTP",
        });
    }
};

/**
 * Forgot Password - Send reset token
 * POST /api/users/forgot-password
 * Body: { email }
 */
export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: false,
                message: "Email is required",
            });
        }

        // Find user by email
        const user = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (!user) {
            // Return success even if user not found (security best practice)
            return res.json({
                status: true,
                message: "If the email exists, a password reset link has been sent.",
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date();
        resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 30); // Token valid for 30 minutes

        // Update user with reset token
        await db
            .update(users)
            .set({
                reset_password_token: resetToken,
                reset_password_token_expiry: resetTokenExpiry,
            })
            .where(eq(users.id, user.id));

        // Create reset link (adjust frontend URL as needed)
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

        // Send password reset email
        const emailResult = await sendPasswordResetEmail(email, resetLink, 30);

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
    } catch (error) {
        console.error("Forgot password error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to process password reset request",
        });
    }
};

/**
 * Reset Password - Update password with token
 * POST /api/users/reset-password
 * Body: { token, newPassword }
 */
export const resetPassword = async (req: Request, res: Response) => {
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
        const user = await db.query.users.findFirst({
            where: eq(users.reset_password_token, token),
        });

        if (!user) {
            return res.status(400).json({
                status: false,
                message: "Invalid or expired reset token",
            });
        }

        // Check if token has expired
        if (
            !user.reset_password_token_expiry ||
            new Date() > new Date(user.reset_password_token_expiry)
        ) {
            return res.status(400).json({
                status: false,
                message: "Reset token has expired. Please request a new one.",
            });
        }

        // Hash new password - DISABLED to match registration logic (plain text)
        // const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset token
        await db
            .update(users)
            .set({
                password: newPassword, // Store as plain text
                reset_password_token: null,
                reset_password_token_expiry: null,
            })
            .where(eq(users.id, user.id));

        return res.json({
            status: true,
            message: "Password has been reset successfully. You can now login.",
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return res.status(500).json({
            status: false,
            message: "Failed to reset password",
        });
    }
};
