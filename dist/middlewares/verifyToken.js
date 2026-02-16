"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = verifyToken;
const jwt_1 = require("../utils/jwt");
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const STATIC_DEV_TOKEN = process.env.DEV_TOKEN;
const STATIC_USER = {
    id: 0,
    email: "dev@example.com",
    username: "dev_admin",
    role: "admin",
    tokenVersion: 0,
};
async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ status: false, message: "No token provided" });
        return; // ✅ just return
    }
    const token = authHeader.split(" ")[1];
    if (token === process.env.DEV_TOKEN) {
        req.user = {
            id: 0,
            email: "dev@example.com",
            username: "dev_admin",
            role: "admin",
            tokenVersion: 0,
        };
        next();
        return;
    }
    try {
        const decoded = (0, jwt_1.verifyJwt)(token);
        // console.log("decoded user", decoded);
        if (decoded.userType === "user") {
            const [player] = await connection_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, decoded.id))
                .limit(1);
            if (!player) {
                res.status(401).json({ status: false, message: "Player not found" });
                return;
            }
            const tokenVerifyDB = await connection_1.db.query.userTokens.findFirst({
                where: (0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userTokens.token, token), (0, drizzle_orm_1.eq)(schema_1.userTokens.user_id, player.id), (0, drizzle_orm_1.eq)(schema_1.userTokens.type, "verify"))
            });
            if (!tokenVerifyDB?.id) {
                res.status(401).json({
                    status: false,
                    message: "Invalid,logged in ito another devices or expired token",
                });
            }
            // console.log(player);
            if (player.tokenVersion !== decoded.tokenVersion) {
                res.status(401).json({
                    status: false,
                    message: "Session expired. Please log in again.",
                });
                return;
            }
            req.user = decoded;
            next();
            return;
        }
        else {
            const [admin] = await connection_1.db
                .select()
                .from(schema_1.adminUsers)
                .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, decoded.id))
                .limit(1);
            if (!admin) {
                res.status(401).json({ status: false, message: "Admin not found" });
                return;
            }
            //  const tokenVerifyDB = await db.query.userTokens.findFirst({
            //   where: and(eq(userTokens.token, token), eq(userTokens.admin_id, admin.id), eq(userTokens.type, "verify"))
            // })
            // if (!tokenVerifyDB?.id) {
            //   res.status(401).json({
            //     status: false,
            //     message: "Invalid,logged in ito another devices or expired token",
            //   });
            // }
            req.user = decoded;
            next();
            return;
        }
    }
    catch {
        res
            .status(401)
            .json({ status: false, message: "Invalid or expired token" });
        return;
    }
}
