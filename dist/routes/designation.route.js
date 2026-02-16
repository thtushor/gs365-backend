"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// designation.routes.ts
const express_1 = require("express");
const designation_controller_1 = require("../controllers/designation.controller");
const asyncHandler_1 = require("../utils/asyncHandler");
const router = (0, express_1.Router)();
router.post("/", (0, asyncHandler_1.asyncHandler)(designation_controller_1.DesignationController.create));
router.get("/", designation_controller_1.DesignationController.getAll);
router.get("/:id", (0, asyncHandler_1.asyncHandler)(designation_controller_1.DesignationController.getById));
router.post("/update/:id", (0, asyncHandler_1.asyncHandler)(designation_controller_1.DesignationController.update));
router.post("/delete/:id", (0, asyncHandler_1.asyncHandler)(designation_controller_1.DesignationController.remove));
exports.default = router;
