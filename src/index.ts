import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import type { ConnectionOptions } from "mysql2";
import process from "process";
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import { pool } from "./db/connection";
import { Request, Response, NextFunction } from "express";

// Routes import
import userRouter from "./routes/user.route";
import publicRouter from "./routes/public.route";
import adminRouter from "./routes/admin.route";
import countryRouter from "./routes/country.route";

import paymentMethodRouter from "./routes/paymentMethods.route";
import paymentMethodTypeRouter from "./routes/paymentMethodTypes.route";
import paymentGatewayRoute from "./routes/paymentGateway.route";
import paymentProviderRoute from "./routes/paymentProvider.route";
import paymentGatewayProviderRoute from "./routes/paymentGatewayProvider.route";
import transactionsRoute from "./routes/transactions.route";
import paymentGateWayAccountsRoute from "./routes/paymentGatewayProviderAccount.route";
import turnoverRoute from "./routes/turnover.route";
import settingsRoute from "./routes/settings.route";
import balanceRoute from "./routes/balance.route";
import gameRoute from "./routes/game.route";
import betResultRoute from "./routes/betResult.route";
import commissionRoute from "./routes/commission.route";
import userLoginHistoryRouter from "./routes/userLoginHistory.route";
import dashboardRouter from "./routes/dashboard.route";
import gameStatsRouter from "./routes/gameStats.route";
import withdrawalPaymentAccountRouter from "./routes/withdrawalPaymentAccount.route";
import adminMainBalanceRouter from "./routes/adminMainBalance.route";
import { errorHandler } from "./middlewares/errorHandler";
import { setupSwagger } from "./utils/swagger";
import designationRouter from "./routes/designation.route";
// Ensure process.env.DATABASE_URL is defined and of correct type
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set.");
}

// Test DB connection
(async () => {
  try {
    await pool.query("SELECT 1");
    console.log("✅ Database connection successful!");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1); // Optionally exit if DB is critical
  }
})();

const app = express();

// CORS configuration
app.use(cors());
// app.use(
//   cors({
//     origin:
//       process.env.NODE_ENV === "production"
//         ? [
//             "https://fashionglory-gaming.vercel.app",
//             "https://fashionglory-gaming.vercel.app/",
//           ] // Replace with your actual domain
//         : [
//             "http://localhost:3000",
//             "http://localhost:3001",
//             "http://localhost:5173",
//             "http://127.0.0.1:5173",
//             "https://fashionglory-gaming.vercel.app",
//             "https://fashionglory-gaming.vercel.app/",
//           ],
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   })
// );

app.use(express.json());

// Public routes
app.use("/api/public", publicRouter);

// User routes (to be implemented in controllers/routes)

app.use("/api/users", userRouter);

// Admin routes (to be implemented in controllers/routes)

app.use("/api/admin", adminRouter);

app.use("/api/countries", countryRouter);

app.use("/api/payment-method", paymentMethodRouter);
app.use("/api/payment-method-types", paymentMethodTypeRouter);
app.use("/api/payment-gateways", paymentGatewayRoute);
app.use("/api/payment-providers", paymentProviderRoute);
app.use("/api/gateway-providers", paymentGatewayProviderRoute);
app.use("/api/gateway-provider-accounts", paymentGateWayAccountsRoute);
app.use("/api/transactions", transactionsRoute);
app.use("/api/turnover", turnoverRoute);
app.use("/api/settings", settingsRoute);
app.use("/api/balance", balanceRoute);
app.use("/api/games", gameRoute);
app.use("/api/bet-results", betResultRoute);
app.use("/api/commissions", commissionRoute);
app.use("/api/user-login-history", userLoginHistoryRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/game-stats", gameStatsRouter);
app.use("/api/withdrawal-payment-accounts", withdrawalPaymentAccountRouter);
app.use("/api/admin-main-balance", adminMainBalanceRouter);
app.use("/api/designations", designationRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Fashion Glory API!");
});

// Global error handler
app.use(errorHandler);
setupSwagger(app);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
