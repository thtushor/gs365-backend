import { Router } from "express";

import { verifyToken } from "../middlewares/verifyToken";
import { createBackup, getBackupList, restoreBackup } from "../controllers/backupRestore.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/backup", 
    // verifyToken,
     createBackup);
router.post("/restore", 
    // verifyToken,
     asyncHandler(restoreBackup));
router.post("/backup-files", 
    // verifyToken,
     getBackupList);

const autoReplyRoute = router;

export default autoReplyRoute;
