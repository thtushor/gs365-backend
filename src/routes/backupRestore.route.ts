import { Router } from "express";

import { verifyToken } from "../middlewares/verifyToken";
import { createBackup, deleteBackup, downloadBackup, dropAllTables, getBackupList, restoreBackup } from "../controllers/backupRestore.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/backup", 
    verifyToken,
     createBackup);
router.post("/restore", 
    verifyToken,
     asyncHandler(restoreBackup));
router.post("/backup-files", 
    verifyToken,
     getBackupList);
router.post("/download-backup", 
    verifyToken,
     asyncHandler(downloadBackup));
router.post("/delete-backup", 
    verifyToken,
     asyncHandler(deleteBackup));
router.post("/drop-all-tables", 
    verifyToken,
     asyncHandler(dropAllTables));

const autoReplyRoute = router;

export default autoReplyRoute;
