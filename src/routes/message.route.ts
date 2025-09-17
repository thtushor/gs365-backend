import { Router } from "express";
import { MessageController } from "../controllers/message.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/chat/:chatId", verifyToken, MessageController.getChatMessages);
router.put("/read/:chatId", verifyToken, MessageController.markMessagesAsRead);

export const messageRoute = router;
