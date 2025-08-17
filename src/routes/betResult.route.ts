import { Router } from "express";
import { BetResultController } from "../controllers/betResult.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Public routes (no authentication required)
router.get("/", BetResultController.getBetResults);
router.get("/stats", BetResultController.getBetResultStats);
// router.get("/recent", BetResultController.get);
router.get("/status/:status", BetResultController.getBetResultsByStatus);
router.get("/game/:gameId", BetResultController.getBetResultsByGame);
router.get("/:id", BetResultController.getBetResultById);

// Protected routes (authentication required)
router.use(verifyToken);

// User specific routes
router.get("/user/:userId", BetResultController.getBetResultsByUser);

export default router;

