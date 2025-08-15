import { Router } from "express";
import {
  getAllTurnovers,
  getTurnoverById,
  createTurnover,
  updateTurnover,
  deleteTurnover,
} from "../controllers/turnover.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// All turnover routes are private - require authentication
router.use(verifyToken);

// GET /api/turnover - Get all turnovers with filters and pagination
router.get("/", (req, res, next) => {
  getAllTurnovers(req, res).catch(next);
});

// GET /api/turnover/:id - Get turnover by ID
router.get("/:id", (req, res, next) => {
  getTurnoverById(req, res).catch(next);
});

// POST /api/turnover - Create new turnover
router.post("/", (req, res, next) => {
  createTurnover(req, res).catch(next);
});

// PUT /api/turnover/:id - Update turnover
router.put("/:id", (req, res, next) => {
  updateTurnover(req, res).catch(next);
});

// DELETE /api/turnover/:id - Delete turnover
router.delete("/:id", (req, res, next) => {
  deleteTurnover(req, res).catch(next);
});

export default router;
