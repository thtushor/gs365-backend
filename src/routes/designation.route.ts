// designation.routes.ts
import { Router } from "express";
import { DesignationController } from "../controllers/designation.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", asyncHandler(DesignationController.create));
router.get("/", DesignationController.getAll);
router.get("/:id", asyncHandler(DesignationController.getById));
router.post("/update/:id", asyncHandler(DesignationController.update));
router.post("/delete/:id", asyncHandler(DesignationController.remove));

export default router;
