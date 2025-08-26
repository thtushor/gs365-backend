import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboard.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// GET /api/dashboard - Get dashboard statistics
router.get("/", verifyToken, getDashboardStats);

export default router;
