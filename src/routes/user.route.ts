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
  console.log("hit login page...");
  loginUser(req, res).catch(next);
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

export default router;
