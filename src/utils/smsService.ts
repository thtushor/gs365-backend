import dotenv from "dotenv";
dotenv.config();

const SMS_API_KEY = process.env.SMS_API_KEY;
const SMS_API_URL = "https://api.sms.net.bd/sendsms";

// SMS response type
interface SMSResponse {
    success: boolean;
    data?: any;
    error?: number;
    msg?: string;
}

// SMS options interface
interface SendSMSOptions {
    to: string; // Recipient numbers, comma separated
    msg: string; // Message content
    schedule?: string; // Y-m-d H:i:s
    sender_id?: string;
    content_id?: string;
}

/**
 * Send SMS using sms.net.bd
 * @param options - SMS options (to, msg, schedule, sender_id, content_id)
 * @returns SMSResponse with success status
 */
export const sendSMS = async (options: SendSMSOptions): Promise<SMSResponse> => {
    try {
        if (!SMS_API_KEY) {
            console.error("SMS_API_KEY is not defined in environment variables");
            return { success: false, msg: "SMS_API_KEY missing" };
        }

        const url = new URL(SMS_API_URL);
        url.searchParams.append("api_key", SMS_API_KEY);
        url.searchParams.append("msg", options.msg);
        url.searchParams.append("to", options.to);

        if (options.schedule) {
            url.searchParams.append("schedule", options.schedule);
        }
        if (options.sender_id) {
            url.searchParams.append("sender_id", options.sender_id);
        }
        if (options.content_id) {
            url.searchParams.append("content_id", options.content_id);
        }

        const response = await fetch(url.toString(), {
            method: "GET",
        });

        const result = await response.json();

        // { "error": 0, "msg": "Request successfully submitted", "data": { "request_id": 0000 } }
        if (result.error === 0) {
            console.log("SMS sent successfully:", result);
            return { success: true, data: result.data, msg: result.msg };
        } else {
            console.error("SMS sending failed:", result);
            return { success: false, error: result.error, msg: result.msg };
        }
    } catch (error) {
        console.error("SMS sending error:", error);
        return { success: false, msg: "Internal server error" };
    }
};

/**
 * Send OTP SMS
 * @param to - Recipient number
 * @param otp - OTP code
 * @param expiryMinutes - Expiry time in minutes
 */
export const sendOTPSMS = async (
    to: string,
    otp: string,
    expiryMinutes: number = 5
): Promise<SMSResponse> => {
    const msg = `Your verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
    return sendSMS({ to, msg });
};
