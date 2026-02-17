import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default sender email
const DEFAULT_FROM = process.env.EMAIL_FROM || "noreply@gamestar365.com";

// Email response type
interface EmailResponse {
  success: boolean;
  data?: any;
  error?: any;
}

// Email options interface
interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
}

/**
 * Send email using Resend
 * @param options - Email options (to, subject, html, from, replyTo)
 * @returns EmailResponse with success status
 */
export const sendEmail = async (options: SendEmailOptions): Promise<EmailResponse> => {
  try {
    const data = await resend.emails.send({
      from: options.from || DEFAULT_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      replyTo: options.replyTo,
    });
    console.log("Email sent successfully:", data);
    return { success: true, data };
  } catch (error) {
    console.error("Email sending failed:", error);
    return { success: false, error };
  }
};

// ========================================
// Pre-built Email Templates
// ========================================

/**
 * Send OTP verification email
 */
export const sendOTPEmail = async (
  email: string,
  otp: string,
  expiryMinutes: number = 5
): Promise<EmailResponse> => {
  return sendEmail({
    to: email,
    subject: "Your Verification Code - GameStar365",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">GameStar365</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code</h2>
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; color: #667eea; letter-spacing: 8px;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px; line-height: 1.6;">
            This code will expire in <strong>${expiryMinutes} minutes</strong>. 
            Do not share this code with anyone.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            If you didn't request this code, please ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Send welcome email to new user
 */
export const sendWelcomeEmail = async (
  email: string,
  name: string
): Promise<EmailResponse> => {
  return sendEmail({
    to: email,
    subject: "Welcome to GameStar365! 🎮",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to GameStar365!</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Hello, ${name}! 👋</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            Your account has been created successfully. You're now part of the GameStar365 community!
          </p>
          <div style="background-color: #f0f7ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p style="color: #333; margin: 0; font-size: 14px;">
              🎯 Start playing your favorite games<br>
              💰 Make deposits and withdrawals easily<br>
              🏆 Win exciting rewards and bonuses
            </p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            Need help? Contact our support team anytime.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Send password reset email
 */
export const sendPasswordResetEmail = async (
  email: string = "",
  resetLink: string,
  expiryMinutes: number = 30
): Promise<EmailResponse> => {
  if (!email) return { success: false, error: "Email address is required" };
  return sendEmail({
    to: email,
    subject: "Reset Your Password - GameStar365",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">GameStar365</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-bottom: 20px;">Reset Your Password</h2>
          <p style="color: #666; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in <strong>${expiryMinutes} minutes</strong>.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            If you didn't request a password reset, please ignore this email.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Send transaction notification email
 */
export const sendTransactionEmail = async (
  email: string,
  type: "deposit" | "withdraw",
  amount: number,
  status: "pending" | "approved" | "rejected",
  transactionId: string
): Promise<EmailResponse> => {
  const statusColors = {
    pending: "#f59e0b",
    approved: "#10b981",
    rejected: "#ef4444",
  };

  const statusText = {
    pending: "Pending Review",
    approved: "Approved ✓",
    rejected: "Rejected ✗",
  };

  return sendEmail({
    to: email,
    subject: `${type === "deposit" ? "Deposit" : "Withdrawal"} ${status === "approved" ? "Successful" : status === "rejected" ? "Rejected" : "Pending"} - GameStar365`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Transaction Update</h1>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 20px;">
            <span style="background-color: ${statusColors[status]}; color: white; padding: 8px 20px; border-radius: 20px; font-size: 14px; font-weight: bold;">
              ${statusText[status]}
            </span>
          </div>
          <div style="background-color: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #666;">Type:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right; text-transform: capitalize;">${type}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Amount:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${amount.toLocaleString()} BDT</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #666;">Transaction ID:</td>
                <td style="padding: 8px 0; color: #333; font-weight: bold; text-align: right;">${transactionId}</td>
              </tr>
            </table>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; text-align: center;">
            For any queries, please contact our support team.
          </p>
        </div>
      </div>
    `,
  });
};

/**
 * Send custom HTML email
 */
export const sendCustomEmail = async (
  to: string | string[],
  subject: string,
  html: string,
  from?: string
): Promise<EmailResponse> => {
  return sendEmail({ to, subject, html, from });
};
