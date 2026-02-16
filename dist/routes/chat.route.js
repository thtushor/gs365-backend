"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRoute = void 0;
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
router.post("/", chat_controller_1.ChatController.createChat); // Removed verifyToken to allow guest users
router.get("/user/:userId", verifyToken_1.verifyToken, chat_controller_1.ChatController.getChatsByUserId);
router.get("/guest/:guestId", chat_controller_1.ChatController.getChatsByGuestId);
// router.get("/:id", verifyToken, ChatController.getChatById);
router.put("/:id/status", chat_controller_1.ChatController.updateChatStatus);
router.put("/:id/assign-admin", verifyToken_1.verifyToken, chat_controller_1.ChatController.assignAdminToChat);
router.get("/", verifyToken_1.verifyToken, chat_controller_1.ChatController.getAllChats);
router.get("/count-unread", chat_controller_1.ChatController.getChatUnreadCount);
exports.chatRoute = router;
