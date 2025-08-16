import { Router } from "express";
import {
  getAllSettings,
  getSettingsById,
  getCurrentSettings,
  createSettings,
  updateSettings,
  updateCurrentSettings,
  deleteSettings,
  getDefaultTurnover,
  setDefaultTurnover,
} from "../controllers/settings.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Public routes (no authentication required)
router.get("/current", (req, res, next) => {
  getCurrentSettings(req, res).catch(next);
});

router.get("/default-turnover", (req, res, next) => {
  getDefaultTurnover(req, res).catch(next);
});

// Private routes (require authentication)
router.use(verifyToken);

// GET /api/settings - Get all settings
router.get("/", (req, res, next) => {
  getAllSettings(req, res).catch(next);
});

// GET /api/settings/:id - Get settings by ID
router.get("/:id", (req, res, next) => {
  getSettingsById(req, res).catch(next);
});

// POST /api/settings - Create new settings
router.post("/", (req, res, next) => {
  createSettings(req, res).catch(next);
});

// PUT /api/settings/:id - Update settings by ID
router.post("/update/:id", (req, res, next) => {
  updateSettings(req, res).catch(next);
});

// PUT /api/settings/update-current - Update current settings
router.post("/update-current", (req, res, next) => {
  updateCurrentSettings(req, res).catch(next);
});

// PUT /api/settings/set-default-turnover - Set default turnover
router.post("/set-default-turnover", (req, res, next) => {
  setDefaultTurnover(req, res).catch(next);
});

// DELETE /api/settings/:id - Delete settings
  router.post("/delete/:id", (req, res, next) => {
    deleteSettings(req, res).catch(next);
});

export default router;
