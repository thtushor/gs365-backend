import { Request, Response } from "express";
import { db } from "../db/connection";
import { adminUsers } from "../db/schema";
import { eq, or } from "drizzle-orm";
import { sendOTPEmail, sendPasswordResetEmail } from "../utils/emailService";
import { sendOTPSMS } from "../utils/smsService";
import crypto from "crypto";

/**
 * Generate a 6-digit OTP
 */
const generateOTP = (): string => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Verify OTP for admin email verification
 * POST /api/admin/verify-otp
 * Body: { email, otp }
 */
export const verifyAdminOtp = async (req: Request, res: Response) => {
    try {
        const { email, phone, otp } = req.body;
        const identifier = email || phone;

        if (!identifier || !otp) {
            return res.status(400).json({
                status: false,
                message: "Email or Phone and OTP are required",
            });
        }

        const isPhoneVerification = !!phone && !email;

        // Find admin by email or phone
        const user = await db.query.adminUsers.findFirst({
            where: isPhoneVerification
                ? eq(adminUsers.phone, phone)
                : eq(adminUsers.email, email),
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        // Check if already verified for this type
        if (isPhoneVerification && user.isPhoneVerified) {
            return res.status(400).json({
                status: false,
                message: "Phone is already verified",
            });
        }
        if (!isPhoneVerification && user.isEmailVerified) {
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

        // Set the appropriate verification flags
        const updateData: any = {
            otp: null,
            otp_expiry: null,
            isVerified: true,
        };

        if (isPhoneVerification) {
            updateData.isPhoneVerified = true;
        } else {
            updateData.isEmailVerified = true;
        }

        await db
            .update(adminUsers)
            .set(updateData)
            .where(eq(adminUsers.id, user.id));

        const verifiedType = isPhoneVerification ? "Phone" : "Email";
        return res.json({
            status: true,
            message: `${verifiedType} verified successfully. You can now login.`,
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
 * Resend OTP for admin email verification
 * POST /api/admin/resend-otp
 * Body: { email }
 */
export const resendAdminOtp = async (req: Request, res: Response) => {
    try {
        const { email, phone } = req.body;
        const identifier = email || phone;

        if (!identifier) {
            return res.status(400).json({
                status: false,
                message: "Email or Phone is required",
            });
        }

        const isPhoneResend = !!phone && !email;

        // Find admin by email or phone
        const user = await db.query.adminUsers.findFirst({
            where: isPhoneResend
                ? eq(adminUsers.phone, phone)
                : eq(adminUsers.email, email),
        });

        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found",
            });
        }

        // Check if already verified
        if (isPhoneResend && user.isPhoneVerified) {
            return res.status(400).json({
                status: false,
                message: "Phone is already verified",
            });
        }
        if (!isPhoneResend && user.isEmailVerified) {
            return res.status(400).json({
                status: false,
                message: "Email is already verified",
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date();
        otpExpiry.setMinutes(otpExpiry.getMinutes() + 10);

        // Update admin with new OTP
        await db
            .update(adminUsers)
            .set({
                otp,
                otp_expiry: otpExpiry,
            })
            .where(eq(adminUsers.id, user.id));

        // Send OTP via SMS or Email
        if (isPhoneResend) {
            const smsResult = await sendOTPSMS(phone, otp, 10);
            if (!smsResult.success) {
                return res.status(500).json({
                    status: false,
                    message: "Failed to send OTP SMS. Please try again.",
                });
            }
            return res.json({
                status: true,
                message: "OTP has been resent to your phone",
            });
        } else {
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
        }
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
 * POST /api/admin/forgot-password
 * Body: { email }
 */
export const forgotAdminPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: false,
                message: "Email is required",
            });
        }

        // Find admin by email
        const user = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.email, email),
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
            .update(adminUsers)
            .set({
                reset_password_token: resetToken,
                reset_password_token_expiry: resetTokenExpiry,
            })
            .where(eq(adminUsers.id, user.id));

        // Create reset link 
        const frontendUrl = process.env.ADMIN_FRONTEND_URL || "http://localhost:5174"; // Admin console usually on different port/url
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
 * POST /api/admin/reset-password
 * Body: { token, newPassword }
 */
export const resetAdminPassword = async (req: Request, res: Response) => {
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

        // Find admin by reset token
        const user = await db.query.adminUsers.findFirst({
            where: eq(adminUsers.reset_password_token, token),
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

        // Store new password as PLAIN TEXT as per user request/consistency
        await db
            .update(adminUsers)
            .set({
                password: newPassword,
                reset_password_token: null,
                reset_password_token_expiry: null,
            })
            .where(eq(adminUsers.id, user.id));

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
