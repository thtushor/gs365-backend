import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/chat/:chatId", verifyToken, MessageController.getChatMessages);
router.post("/read/:chatId", verifyToken, MessageController.markMessagesAsRead);
router.post("/send-message",verifyToken,MessageController.sendMessage)
router.get("/sender/:senderId/:senderType", verifyToken, MessageController.getMessagesBySender);
router.get("/user-admin/:id/:type", verifyToken, MessageController.getMessagesByUserIdOrAdminId);
router.get("/guest-sender/:guestSenderId", MessageController.getMessagesByGuestSenderId);

export const messageRoute = router;
