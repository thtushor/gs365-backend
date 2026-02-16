"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// spin.routes.ts
const express_1 = require("express");
const asyncHandler_1 = require("../utils/asyncHandler");
const spinBonusModel_1 = require("../models/spinBonusModel");
const router = (0, express_1.Router)();
// GET /api/spin   →  ?page=1&pageSize=20&userId=123&minAmount=10&maxAmount=500 etc.
router.get("/", (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    // Extract and normalize query params
    const filters = {
        userId: req.query.userId ? Number(req.query.userId) : undefined,
        minAmount: req.query.minAmount ? Number(req.query.minAmount) : undefined,
        maxAmount: req.query.maxAmount ? Number(req.query.maxAmount) : undefined,
        // startDate & endDate are NOT used in frontend → we can omit or keep optional
        startDate: req.query.startDate,
        endDate: req.query.endDate,
    };
    const pagination = {
        page: req.query.page ? Number(req.query.page) : 1,
        pageSize: req.query.pageSize ? Number(req.query.pageSize) : 20,
    };
    const result = await spinBonusModel_1.SpinBonusModel.getAllRecords(filters, pagination);
    return res.status(200).json(result);
}));
exports.default = router;
