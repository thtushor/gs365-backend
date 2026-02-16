"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const turnover_controller_1 = require("../controllers/turnover.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// All turnover routes are private - require authentication
router.use(verifyToken_1.verifyToken);
// GET /api/turnover - Get all turnovers with filters and pagination
router.get("/", (req, res, next) => {
    (0, turnover_controller_1.getAllTurnovers)(req, res).catch(next);
});
// GET /api/turnover/:id - Get turnover by ID
router.get("/:id", (req, res, next) => {
    (0, turnover_controller_1.getTurnoverById)(req, res).catch(next);
});
// POST /api/turnover - Create new turnover
router.post("/", (req, res, next) => {
    (0, turnover_controller_1.createTurnover)(req, res).catch(next);
});
// PUT /api/turnover/:id - Update turnover
router.put("/:id", (req, res, next) => {
    (0, turnover_controller_1.updateTurnover)(req, res).catch(next);
});
// DELETE /api/turnover/:id - Delete turnover
router.delete("/:id", (req, res, next) => {
    (0, turnover_controller_1.deleteTurnover)(req, res).catch(next);
});
exports.default = router;
