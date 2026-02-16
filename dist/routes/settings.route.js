"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const settings_controller_1 = require("../controllers/settings.controller");
const verifyToken_1 = require("../middlewares/verifyToken");
const router = (0, express_1.Router)();
// Public routes (no authentication required)
router.get("/current", (req, res, next) => {
    (0, settings_controller_1.getCurrentSettings)(req, res).catch(next);
});
router.get("/default-turnover", (req, res, next) => {
    (0, settings_controller_1.getDefaultTurnover)(req, res).catch(next);
});
// Private routes (require authentication)
router.use(verifyToken_1.verifyToken);
// GET /api/settings - Get all settings
router.get("/", (req, res, next) => {
    (0, settings_controller_1.getAllSettings)(req, res).catch(next);
});
// GET /api/settings/:id - Get settings by ID
router.get("/:id", (req, res, next) => {
    (0, settings_controller_1.getSettingsById)(req, res).catch(next);
});
// POST /api/settings - Create new settings
router.post("/", (req, res, next) => {
    (0, settings_controller_1.createSettings)(req, res).catch(next);
});
// PUT /api/settings/:id - Update settings by ID
router.post("/update/:id", (req, res, next) => {
    (0, settings_controller_1.updateSettings)(req, res).catch(next);
});
// PUT /api/settings/update-current - Update current settings
router.post("/update-current", (req, res, next) => {
    (0, settings_controller_1.updateCurrentSettings)(req, res).catch(next);
});
// PUT /api/settings/set-default-turnover - Set default turnover
router.post("/set-default-turnover", (req, res, next) => {
    (0, settings_controller_1.setDefaultTurnover)(req, res).catch(next);
});
// DELETE /api/settings/:id - Delete settings
router.post("/delete/:id", (req, res, next) => {
    (0, settings_controller_1.deleteSettings)(req, res).catch(next);
});
exports.default = router;
