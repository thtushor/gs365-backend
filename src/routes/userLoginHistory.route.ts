import { Router } from "express";
import {
  createUserLoginHistoryController,
  getUserLoginHistoryByUserIdController,
  getAllUserLoginHistoryController,
  deleteUserLoginHistoryController,
} from "../controllers/userLoginHistory.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Public routes (if needed)
// router.post("/", (req, res, next) => {
//   createUserLoginHistoryController(req, res).catch(next);
// });

// Protected routes (require authentication)
router.use(verifyToken);

// Get login history for a specific user
router.get("/user/:userId", (req, res, next) => {
  getUserLoginHistoryByUserIdController(req, res).catch(next);
});

// Get all login history (admin only)
router.get("/", (req, res, next) => {
  getAllUserLoginHistoryController(req, res).catch(next);
});

// Delete a login history record (admin only)
router.delete("/:id", (req, res, next) => {
  deleteUserLoginHistoryController(req, res).catch(next);
});

export default router;