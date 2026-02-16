"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const asyncHandler_1 = require("../utils/asyncHandler");
const admin_controller_1 = require("../controllers/admin.controller");
const router = (0, express_1.Router)();
// Public routes
router.post("/register", (req, res, next) => {
    (0, user_controller_1.registerUser)(req, res).catch(next);
});
router.post("/login", (req, res, next) => {
    console.log("hit login page...");
    (0, user_controller_1.loginUser)(req, res).catch(next);
});
// Auth routes for email verification and password reset
const auth_controller_1 = require("../controllers/auth.controller");
router.post("/verify-otp", (0, asyncHandler_1.asyncHandler)(auth_controller_1.verifyOtp));
router.post("/resend-otp", (0, asyncHandler_1.asyncHandler)(auth_controller_1.resendOtp));
router.post("/forgot-password", (0, asyncHandler_1.asyncHandler)(auth_controller_1.forgotPassword));
router.post("/reset-password", (0, asyncHandler_1.asyncHandler)(auth_controller_1.resetPassword));
router.post("/logout", verifyToken_1.verifyToken, (req, res, next) => {
    console.log("hit login page...");
    (0, user_controller_1.logoutUser)(req, res).catch(next);
});
// Protected routes (require authentication)
router.use(verifyToken_1.verifyToken);
// User profile
router.get("/profile", (req, res, next) => {
    (0, user_controller_1.userProfile)(req, res).catch(next);
});
// Admin/Management routes
router.get("/", (req, res, next) => {
    (0, user_controller_1.getAllUsers)(req, res).catch(next);
});
router.get("/filtered", (req, res, next) => {
    (0, user_controller_1.getUsersWithFiltersController)(req, res).catch(next);
});
router.get("/details/:id", (req, res, next) => {
    (0, user_controller_1.getUserDetailsController)(req, res).catch(next);
});
router.get("/by-referrer/:type", (req, res, next) => {
    (0, user_controller_1.getUsersByReferrerTypeController)(req, res).catch(next);
});
// User management
router.post("/update/:id", (req, res, next) => {
    (0, user_controller_1.updateUser)(req, res).catch(next);
});
router.post("/delete/:id", (req, res, next) => {
    (0, user_controller_1.deleteUser)(req, res).catch(next);
});
router.get("/kyc", (0, asyncHandler_1.asyncHandler)(admin_controller_1.getKycList));
router.post("/create-update-kyc", (0, asyncHandler_1.asyncHandler)(admin_controller_1.createUpdateKyc));
router.post("/add-favorite", (0, asyncHandler_1.asyncHandler)(user_controller_1.addFavorite));
router.post("/remove-favorite", (0, asyncHandler_1.asyncHandler)(user_controller_1.removeFavorite));
router.get("/get-favorites", (0, asyncHandler_1.asyncHandler)(user_controller_1.getFavorites));
router.get("/notifications/:userId", (0, asyncHandler_1.asyncHandler)(user_controller_1.getMyNotifications));
router.post("/notifications-status", (0, asyncHandler_1.asyncHandler)(user_controller_1.updateNotificationStatus));
exports.default = router;
