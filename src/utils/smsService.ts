import dotenv from "dotenv";
dotenv.config();

// ─── Enums ───────────────────────────────────────────────
export enum SmsChannel {
    BD_SmsNet = "BD_SmsNet",
    BD_ZamanIt = "BD_ZamanIt",
    IN_Default = "IN_Default",
    TH_Default = "TH_Default",
    CN_Default = "CN_Default",
}

// ─── Interfaces ──────────────────────────────────────────
export interface SMSResponse {
    success: boolean;
    data?: any;
    error?: number;
    msg?: string;
}

export interface SMSPayload {
    to: string;
    message: string;
}

/**
 * Abstract SMS channel – every channel must implement `send()`.
 */
abstract class BaseSmsChannel {
    abstract readonly channel: SmsChannel;
    abstract send(payload: SMSPayload): Promise<SMSResponse>;
}

// ─── BD – sms.net.bd ─────────────────────────────────────
class BdSmsNetChannel extends BaseSmsChannel {
    readonly channel = SmsChannel.BD_SmsNet;
    private apiKey = process.env.SMS_API_KEY || "";
    private baseUrl = "https://api.sms.net.bd/sendsms";

    async send(payload: SMSPayload): Promise<SMSResponse> {
        if (!this.apiKey) return { success: false, msg: "SMS_API_KEY missing" };

        const url = new URL(this.baseUrl);
        url.searchParams.append("api_key", this.apiKey);
        url.searchParams.append("msg", payload.message);
        url.searchParams.append("to", payload.to);

        const res = await fetch(url.toString(), { method: "GET" });
        const result = await res.json();

        if (result.error === 0) {
            console.log("SMS sent (BD_SMSNET):", result);
            return { success: true, data: result.data, msg: result.msg };
        }
        console.error("SMS failed (BD_SMSNET):", result);
        return { success: false, error: result.error, msg: result.msg };
    }
}

// ─── BD – Zaman IT ───────────────────────────────────────
class BdZamanItChannel extends BaseSmsChannel {
    readonly channel = SmsChannel.BD_ZamanIt;
    private apiKey = process.env.ZAMAN_IT_SMS_API_KEY || "";
    private baseUrl = process.env.ZAMAN_IT_SMS_URL || "http://103.89.240.228";
    private senderId = process.env.ZAMAN_IT_SENDER_ID || "8809604903051";

    async send(payload: SMSPayload): Promise<SMSResponse> {
        if (!this.apiKey) return { success: false, msg: "ZAMAN_IT_SMS_API_KEY missing" };

        const url = new URL(`${this.baseUrl}/api/sendsms`);
        url.searchParams.append("api_key", this.apiKey);
        url.searchParams.append("type", "text");
        url.searchParams.append("phone", payload.to);
        url.searchParams.append("senderid", this.senderId);
        url.searchParams.append("message", payload.message);

        const res = await fetch(url.toString(), { method: "GET" });
        const result = await res.json();

        // Zaman IT error codes: 1001-1007 mean failure
        if (result.error && result.error >= 1001) {
            console.error("SMS failed (BD_ZAMAN_IT):", result);
            return { success: false, error: result.error, msg: result.msg };
        }
        console.log("SMS sent (BD_ZAMAN_IT):", result);
        return { success: true, data: result, msg: "Sent via Zaman IT" };
    }
}

// ─── Placeholder channels (implement when ready) ────────
class IndianChannel extends BaseSmsChannel {
    readonly channel = SmsChannel.IN_Default;
    async send(_payload: SMSPayload): Promise<SMSResponse> {
        return { success: false, msg: "Indian SMS channel not implemented yet" };
    }
}

class ThaiChannel extends BaseSmsChannel {
    readonly channel = SmsChannel.TH_Default;
    async send(_payload: SMSPayload): Promise<SMSResponse> {
        return { success: false, msg: "Thai SMS channel not implemented yet" };
    }
}

class ChineseChannel extends BaseSmsChannel {
    readonly channel = SmsChannel.CN_Default;
    async send(_payload: SMSPayload): Promise<SMSResponse> {
        return { success: false, msg: "Chinese SMS channel not implemented yet" };
    }
}

// ─── Channel Registry ───────────────────────────────────
const channelMap: Record<SmsChannel, BaseSmsChannel> = {
    [SmsChannel.BD_SmsNet]: new BdSmsNetChannel(),
    [SmsChannel.BD_ZamanIt]: new BdZamanItChannel(),
    [SmsChannel.IN_Default]: new IndianChannel(),
    [SmsChannel.TH_Default]: new ThaiChannel(),
    [SmsChannel.CN_Default]: new ChineseChannel(),
};

// Country‑code → default channel mapping
const countryCodeChannelMap: Record<string, SmsChannel> = {
    "880": SmsChannel.BD_ZamanIt,   // Bangladesh
    "91": SmsChannel.IN_Default,    // India
    "66": SmsChannel.TH_Default,    // Thailand
    "86": SmsChannel.CN_Default,    // China
};

/**
 * Resolve channel from country code in the phone number.
 * Falls back to BD_ZAMAN_IT if no match.
 */
function resolveChannel(phone: string): SmsChannel {
    const cleaned = phone.replace(/[^0-9]/g, "");
    for (const [code, ch] of Object.entries(countryCodeChannelMap)) {
        if (cleaned.startsWith(code)) return ch;
    }
    return SmsChannel.BD_ZamanIt;
}

// ─── Public API ──────────────────────────────────────────

/**
 * Send SMS – pass an explicit channel or let it auto-resolve from the phone number.
 */
export const sendSMS = async (
    to: string,
    message: string,
    channel?: SmsChannel
): Promise<SMSResponse> => {
    try {
        const selectedChannel = channel ?? resolveChannel(to);
        const provider = channelMap[selectedChannel];
        return await provider.send({ to, message });
    } catch (error) {
        console.error("SMS sending error:", error);
        return { success: false, msg: "Internal server error" };
    }
};

/**
 * Send OTP SMS (convenience wrapper).
 */
export const sendOTPSMS = async (
    to: string,
    otp: string,
    expiryMinutes: number = 5,
    channel: SmsChannel = SmsChannel.BD_ZamanIt
): Promise<SMSResponse> => {
    const msg = `Your verification code is: ${otp}. Valid for ${expiryMinutes} minutes. Do not share this code.`;
    return sendSMS(to, msg, channel);
};
