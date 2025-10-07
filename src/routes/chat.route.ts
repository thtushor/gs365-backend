import { Router } from "express";
import { ChatController } from "../controllers/chat.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.post("/", ChatController.createChat); // Removed verifyToken to allow guest users
router.get("/user/:userId", verifyToken, ChatController.getChatsByUserId);
router.get("/guest/:guestId", ChatController.getChatsByGuestId);
// router.get("/:id", verifyToken, ChatController.getChatById);
router.put("/:id/status", verifyToken, ChatController.updateChatStatus);
router.put("/:id/assign-admin", verifyToken, ChatController.assignAdminToChat);
router.get("/", verifyToken, ChatController.getAllChats);
router.get("/count-unread", verifyToken, ChatController.getChatUnreadCount);

export const chatRoute = router;
