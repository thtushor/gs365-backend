"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userLoginHistory_controller_1 = require("../controllers/userLoginHistory.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// Public routes (if needed)
// router.post("/", (req, res, next) => {
//   createUserLoginHistoryController(req, res).catch(next);
// });
// Protected routes (require authentication)
router.use(verifyToken_1.verifyToken);
// Get login history for a specific user
router.get("/user/:userId", (req, res, next) => {
    (0, userLoginHistory_controller_1.getUserLoginHistoryByUserIdController)(req, res).catch(next);
});
// Get all login history (admin only)
router.get("/", (req, res, next) => {
    (0, userLoginHistory_controller_1.getAllUserLoginHistoryController)(req, res).catch(next);
});
// Delete a login history record (admin only)
router.delete("/:id", (req, res, next) => {
    (0, userLoginHistory_controller_1.deleteUserLoginHistoryController)(req, res).catch(next);
});
exports.default = router;
