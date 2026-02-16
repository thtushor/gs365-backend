"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
require("dotenv/config");
const process_1 = __importDefault(require("process"));
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const connection_1 = require("./db/connection");
// Routes import
const user_route_1 = __importDefault(require("./routes/user.route"));
const public_route_1 = __importDefault(require("./routes/public.route"));
const admin_route_1 = __importDefault(require("./routes/admin.route"));
const country_route_1 = __importDefault(require("./routes/country.route"));
const paymentMethods_route_1 = __importDefault(require("./routes/paymentMethods.route"));
const paymentMethodTypes_route_1 = __importDefault(require("./routes/paymentMethodTypes.route"));
const paymentGateway_route_1 = __importDefault(require("./routes/paymentGateway.route"));
const paymentProvider_route_1 = __importDefault(require("./routes/paymentProvider.route"));
const paymentGatewayProvider_route_1 = __importDefault(require("./routes/paymentGatewayProvider.route"));
const transactions_route_1 = __importDefault(require("./routes/transactions.route"));
const paymentGatewayProviderAccount_route_1 = __importDefault(require("./routes/paymentGatewayProviderAccount.route"));
const turnover_route_1 = __importDefault(require("./routes/turnover.route"));
const settings_route_1 = __importDefault(require("./routes/settings.route"));
const balance_route_1 = __importDefault(require("./routes/balance.route"));
const game_route_1 = __importDefault(require("./routes/game.route"));
const betResult_route_1 = __importDefault(require("./routes/betResult.route"));
const commission_route_1 = __importDefault(require("./routes/commission.route"));
const userLoginHistory_route_1 = __importDefault(require("./routes/userLoginHistory.route"));
const dashboard_route_1 = __importDefault(require("./routes/dashboard.route"));
const gameStats_route_1 = __importDefault(require("./routes/gameStats.route"));
const withdrawalPaymentAccount_route_1 = __importDefault(require("./routes/withdrawalPaymentAccount.route"));
const adminMainBalance_route_1 = __importDefault(require("./routes/adminMainBalance.route"));
const chat_route_1 = require("./routes/chat.route");
const message_route_1 = require("./routes/message.route");
const autoReply_route_1 = require("./routes/autoReply.route");
const userPhone_route_1 = __importDefault(require("./routes/userPhone.route"));
const errorHandler_1 = require("./middlewares/errorHandler");
const swagger_1 = require("./utils/swagger");
const designation_route_1 = __importDefault(require("./routes/designation.route"));
const spin_route_1 = __importDefault(require("./routes/spin.route"));
const backupRestore_route_1 = __importDefault(require("./routes/backupRestore.route"));
const socket_1 = require("./socket");
const path_1 = __importDefault(require("path"));
const backupRestore_controller_1 = require("./controllers/backupRestore.controller");
// Ensure process.env.DATABASE_URL is defined and of correct type
if (!process_1.default.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is not set.");
}
// Test DB connection
(async () => {
    try {
        await connection_1.pool.query("SELECT 1");
        console.log("✅ Database connection successful!");
    }
    catch (err) {
        console.error("❌ Database connection failed:", err);
        process_1.default.exit(1); // Optionally exit if DB is critical
    }
})();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
exports.io = new socket_io_1.Server(httpServer, {
    // path:"/gs-server/socket/socket.io/",
    cors: {
        origin: "*", // Adjust this in production to your client's URL
        methods: ["GET", "POST"],
    },
    pingInterval: 10 * 1000, // Send ping every 10 seconds
    pingTimeout: 3 * 1000, // Disconnect if no pong received within 5 seconds
    transports: ["websocket", "polling"], // Prioritize websocket
});
// CORS configuration
app.use((0, cors_1.default)());
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
app.use(express_1.default.json());
// Public routes
app.use("/api/public", public_route_1.default);
// User routes (to be implemented in controllers/routes)
app.use("/api/users", user_route_1.default);
// Admin routes (to be implemented in controllers/routes)
app.use("/api/admin", admin_route_1.default);
app.use("/api/countries", country_route_1.default);
app.use("/api/payment-method", paymentMethods_route_1.default);
app.use("/api/payment-method-types", paymentMethodTypes_route_1.default);
app.use("/api/payment-gateways", paymentGateway_route_1.default);
app.use("/api/payment-providers", paymentProvider_route_1.default);
app.use("/api/gateway-providers", paymentGatewayProvider_route_1.default);
app.use("/api/gateway-provider-accounts", paymentGatewayProviderAccount_route_1.default);
app.use("/api/transactions", transactions_route_1.default);
app.use("/api/turnover", turnover_route_1.default);
app.use("/api/settings", settings_route_1.default);
app.use("/api/balance", balance_route_1.default);
app.use("/api/games", game_route_1.default);
app.use("/api/bet-results", betResult_route_1.default);
app.use("/api/commissions", commission_route_1.default);
app.use("/api/user-login-history", userLoginHistory_route_1.default);
app.use("/api/dashboard", dashboard_route_1.default);
app.use("/api/game-stats", gameStats_route_1.default);
app.use("/api/withdrawal-payment-accounts", withdrawalPaymentAccount_route_1.default);
app.use("/api/admin-main-balance", adminMainBalance_route_1.default);
app.use("/api/designations", designation_route_1.default);
app.use("/api/spin", spin_route_1.default);
app.use("/api/chats", chat_route_1.chatRoute);
app.use("/api/messages", message_route_1.messageRoute);
app.use("/api/auto-replies", autoReply_route_1.autoReplyRoute);
app.use("/api/user-phones", userPhone_route_1.default);
app.use("/api/database", backupRestore_route_1.default);
app.get("/", (req, res) => {
    res.send("Welcome to the Gamestar 365 API!");
});
app.get("/test-message", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "..", "test_socket_client.html"));
});
// Global error handler
app.use(errorHandler_1.errorHandler);
(0, swagger_1.setupSwagger)(app);
(0, socket_1.setupSocketIO)(exports.io);
const PORT = process_1.default.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
});
(0, backupRestore_controller_1.scheduleAutoBackup)();
