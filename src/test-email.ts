import "dotenv/config";
import { sendEmail, sendOTPEmail } from "./utils/emailService";

const TEST_EMAIL = "mdmahfuzrp@gmail.com"; // Change to your email
// const TEST_EMAIL = "tushorgsotp@gmail.com"; // Change to your email

async function testEmail() {
    console.log("🚀 Testing Resend Email Service...\n");

    // Test 1: Simple email
    console.log("📧 Test 1: Sending simple email...");
    const result1 = await sendEmail({
        to: TEST_EMAIL,
        subject: "Test Email from GameStar365",
        html: `
      <div style="padding: 20px; font-family: Arial;">
        <h2>🎉 Email Service is Working!</h2>
        <p>This is a test email from your GameStar365 backend.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      </div>
    `,
    });
    console.log("Result:", result1.success ? "✅ Success" : "❌ Failed", "\n");

    // Test 2: OTP email
    console.log("📧 Test 2: Sending OTP email...");
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const result2 = await sendOTPEmail(TEST_EMAIL, testOTP);
    console.log("Result:", result2.success ? "✅ Success" : "❌ Failed", "\n");

    console.log("✨ Email testing complete!");
    console.log(`Check your inbox: ${TEST_EMAIL}`);
}

testEmail().catch(console.error);
