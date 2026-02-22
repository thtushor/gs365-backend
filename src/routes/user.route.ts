import { Router } from "express";
import {
  getAllUsers,
  getUsersWithFiltersController,
  getUserDetailsController,
  getUsersByReferrerTypeController,
  registerUser,
  loginUser,
  updateUser,
  deleteUser,
  userProfile,
  addFavorite,
  removeFavorite,
  getFavorites,
  logoutUser,
  getMyNotifications,
  updateNotificationStatus,
} from "../controllers/user.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { asyncHandler } from "../utils/asyncHandler";
import { createUpdateKyc, getKycList } from "../controllers/admin.controller";

const router = Router();

// Public routes
router.post("/register", (req, res, next) => {
  registerUser(req, res).catch(next);
});

router.post("/login", (req, res, next) => {
  loginUser(req, res).catch(next);
});

// Auth routes for email verification and password reset
import {
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";

router.post("/verify-otp", asyncHandler(verifyOtp));
router.post("/resend-otp", asyncHandler(resendOtp));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetPassword));

router.post("/logout", verifyToken, (req, res, next) => {
  console.log("hit login page...");
  logoutUser(req, res).catch(next);
});

// Protected routes (require authentication)
router.use(verifyToken);

// User profile
router.get("/profile", (req, res, next) => {
  userProfile(req, res).catch(next);
});

// Admin/Management routes
router.get("/", (req, res, next) => {
  getAllUsers(req, res).catch(next);
});

router.get("/filtered", (req, res, next) => {
  getUsersWithFiltersController(req, res).catch(next);
});

router.get("/details/:id", (req, res, next) => {
  getUserDetailsController(req, res).catch(next);
});

router.get("/by-referrer/:type", (req, res, next) => {
  getUsersByReferrerTypeController(req, res).catch(next);
});

// User management
router.post("/update/:id", (req, res, next) => {
  updateUser(req, res).catch(next);
});

router.post("/delete/:id", (req, res, next) => {
  deleteUser(req, res).catch(next);
});
router.get("/kyc", asyncHandler(getKycList));
router.post("/create-update-kyc", asyncHandler(createUpdateKyc));
router.post("/add-favorite", asyncHandler(addFavorite));
router.post("/remove-favorite", asyncHandler(removeFavorite));
router.get("/get-favorites", asyncHandler(getFavorites));
router.get("/notifications/:userId", asyncHandler(getMyNotifications));
router.post("/notifications-status", asyncHandler(updateNotificationStatus));

export default router;
