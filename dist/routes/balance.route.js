"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const balance_controller_1 = require("../controllers/balance.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// Public routes (no authentication required) - for admin/system use
router.get("/player/:userId", (req, res, next) => {
    (0, balance_controller_1.getPlayerBalance)(req, res).catch(next);
});
router.get("/player/:userId/summary", (req, res, next) => {
    (0, balance_controller_1.getPlayerBalanceSummary)(req, res).catch(next);
});
router.get("/player/:userId/currency/:currencyId", (req, res, next) => {
    (0, balance_controller_1.getCurrencyBalance)(req, res).catch(next);
});
router.get("/all", (req, res, next) => {
    (0, balance_controller_1.getAllPlayerBalances)(req, res).catch(next);
});
// Private routes (require authentication) - for users to check their own balance
router.use(verifyToken_1.verifyToken);
router.get("/my-balance", (req, res, next) => {
    (0, balance_controller_1.getMyBalance)(req, res).catch(next);
});
router.get("/my-balance/summary", (req, res, next) => {
    (0, balance_controller_1.getMyBalanceSummary)(req, res).catch(next);
});
exports.default = router;
