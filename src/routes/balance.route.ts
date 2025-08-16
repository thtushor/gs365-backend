import { Router } from "express";
import {
  getPlayerBalance,
  getPlayerBalanceSummary,
  getCurrencyBalance,
  getAllPlayerBalances,
  getMyBalance,
  getMyBalanceSummary,
} from "../controllers/balance.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Public routes (no authentication required) - for admin/system use
router.get("/player/:userId", (req, res, next) => {
  getPlayerBalance(req, res).catch(next);
});

router.get("/player/:userId/summary", (req, res, next) => {
  getPlayerBalanceSummary(req, res).catch(next);
});

router.get("/player/:userId/currency/:currencyId", (req, res, next) => {
  getCurrencyBalance(req, res).catch(next);
});

router.get("/all", (req, res, next) => {
  getAllPlayerBalances(req, res).catch(next);
});

// Private routes (require authentication) - for users to check their own balance
router.use(verifyToken);

router.get("/my-balance", (req, res, next) => {
  getMyBalance(req, res).catch(next);
});

router.get("/my-balance/summary", (req, res, next) => {
  getMyBalanceSummary(req, res).catch(next);
});

export default router;
