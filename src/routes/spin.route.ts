// spin.routes.ts
import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { SpinBonusModel } from "../models/spinBonusModel";

const router = Router();

// GET /api/spin   →  ?page=1&pageSize=20&userId=123&minAmount=10&maxAmount=500 etc.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    // Extract and normalize query params
    const filters = {
      userId: req.query.userId ? Number(req.query.userId) : undefined,
      minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
      maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
      // startDate & endDate are NOT used in frontend → we can omit or keep optional
      startDate: req.query.startDate as string | undefined,
      endDate: req.query.endDate as string | undefined,
    };

    const pagination = {
      page: req.query.page ? Number(req.query.page) : 1,
      pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    };

    const result = await SpinBonusModel.getAllRecords(filters, pagination);

    return res.status(200).json(result);
  }),
);

export default router;
