import { Router } from "express";
import { AutoReplyController } from "../controllers/autoReply.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.post("/", verifyToken, AutoReplyController.createAutoReply);
router.get("/", verifyToken, AutoReplyController.getAllAutoReplies);
router.get("/:id", verifyToken, AutoReplyController.getAutoReplyById);
router.put("/:id", verifyToken, AutoReplyController.updateAutoReply);
router.delete("/:id", verifyToken, AutoReplyController.deleteAutoReply);

export const autoReplyRoute = router;
