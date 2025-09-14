import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.post("/", verifyToken, ChatController.createChat);
router.get("/user/:userId", verifyToken, ChatController.getChatsByUserId);
router.get("/:id", verifyToken, ChatController.getChatById);
router.put("/:id/status", verifyToken, ChatController.updateChatStatus);
router.put("/:id/assign-admin", verifyToken, ChatController.assignAdminToChat);

export const chatRoute = router;
