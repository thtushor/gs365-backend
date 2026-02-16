import { sendSMS, sendOTPSMS, SmsChannel } from "./utils/smsService";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testSMS() {
    console.log("Testing SMS Service...");

    const testNumber = "8801625265912";
    // const testNumber = "8801854107699";

    console.log(`Sending test SMS to ${testNumber}...`);

    try {
        // Test 1: Generic SMS via Zaman IT
        const res1 = await sendSMS(
            testNumber,
            "Hello from Fashion Glory! This is a test message.",
            SmsChannel.BD_ZamanIt
        );
        console.log("Test 1 Result:", res1);

        // Test 2: OTP SMS
        console.log(`Sending OTP SMS to ${testNumber}...`);
        const res2 = await sendOTPSMS(testNumber, "123456");
        console.log("Test 2 Result:", res2);

    } catch (error) {
        console.error("Test failed:", error);
    }
}

testSMS();
