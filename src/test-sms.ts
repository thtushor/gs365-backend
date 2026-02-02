import { sendSMS, sendOTPSMS } from "./utils/smsService";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function testSMS() {
    console.log("Testing SMS Service...");

    // Replace with a valid test number if you want to receive the SMS
    const testNumber = "01854107699"; // You might want to change this to your number for testing

    console.log(`Sending test SMS to ${testNumber}...`);

    try {
        // Test 1: Generic SMS
        const res1 = await sendSMS({
            to: testNumber,
            msg: "Hello from Fashion Glory! This is a test message.",
        });
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
