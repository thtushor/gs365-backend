"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreBackup = exports.deleteBackup = exports.dropAllTables = exports.downloadBackup = exports.getBackupList = exports.createBackup = exports.scheduleAutoBackup = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const node_cron_1 = __importDefault(require("node-cron"));
const MYSQLDUMP_PATH = `${process.env.MYSQLDUMP_PATH || `mysqldump`}`;
const MYSQL_PATH = `${process.env.MYSQL_PATH || `mysql`}`;
const BACKUP_DIR = path_1.default.join(process.cwd(), "backups");
// Parse DATABASE_URL (e.g., mysql://root:@localhost:3306/gsgame)
const DATABASE_URL = process.env.DATABASE_URL || "mysql://root:@localhost:3306/gsgame";
const dbUrl = new URL(DATABASE_URL);
const DB_CONFIG = {
    host: dbUrl.hostname,
    user: dbUrl.username,
    password: dbUrl.password,
    port: Number(dbUrl.port || 3306),
    database: dbUrl.pathname.replace("/", ""),
};
// Ensure backup folder exists
if (!fs_1.default.existsSync(BACKUP_DIR))
    fs_1.default.mkdirSync(BACKUP_DIR);
const scheduleAutoBackup = () => {
    console.log("🕒 Setting up automatic daily backups...");
    // Run every day at 03:00 (midnight)
    node_cron_1.default.schedule("0 3 * * *", async () => {
        try {
            console.log("📦 Auto-backup job started...");
            const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
            const sqlFile = path_1.default.join(BACKUP_DIR, `auto_backup_${timestamp}.sql`);
            const dumpCmd = `${MYSQLDUMP_PATH} -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ""} ${DB_CONFIG.database} > "${sqlFile}"`;
            (0, child_process_1.exec)(dumpCmd, (error, stdout, stderr) => {
                if (error) {
                    console.error("❌ Auto-backup failed:", stderr || error);
                    return;
                }
                console.log("✅ Auto-backup completed:", sqlFile);
                // Optional: Cleanup old backups (keep only latest 7)
                const backups = fs_1.default
                    .readdirSync(BACKUP_DIR)
                    .filter((f) => f.startsWith("auto_backup_"))
                    .sort((a, b) => fs_1.default.statSync(path_1.default.join(BACKUP_DIR, b)).mtime.getTime() -
                    fs_1.default.statSync(path_1.default.join(BACKUP_DIR, a)).mtime.getTime());
                if (backups.length > 7) {
                    const oldFiles = backups.slice(7);
                    for (const old of oldFiles) {
                        const oldPath = path_1.default.join(BACKUP_DIR, old);
                        fs_1.default.unlinkSync(oldPath);
                        console.log("🗑️ Deleted old auto-backup:", old);
                    }
                }
            });
        }
        catch (err) {
            console.error("⚠️ Auto-backup job failed:", err);
        }
    });
    console.log("✅ Auto-backup scheduler initialized.");
};
exports.scheduleAutoBackup = scheduleAutoBackup;
/**
 * Create a database backup using mysqldump CLI
 */
const createBackup = async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const sqlFile = path_1.default.join(BACKUP_DIR, `backup_${timestamp}.sql`);
        // Build mysqldump command
        const dumpCmd = `${MYSQLDUMP_PATH} -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ""} ${DB_CONFIG.database} > "${sqlFile}"`;
        (0, child_process_1.exec)(dumpCmd, (error, stdout, stderr) => {
            if (error) {
                console.error("Backup failed:", stderr || error);
                return res.status(500).json({ success: false, message: "Backup failed", error: stderr || error });
            }
            res.json({ success: true, file: path_1.default.basename(sqlFile) });
        });
    }
    catch (error) {
        console.error("Backup error:", error);
        res.status(500).json({ success: false, message: "Backup failed", error });
    }
};
exports.createBackup = createBackup;
/**
 * Get all backups list
 */
const getBackupList = (req, res) => {
    try {
        const files = fs_1.default.readdirSync(BACKUP_DIR);
        const backups = files.map((file) => {
            const stats = fs_1.default.statSync(path_1.default.join(BACKUP_DIR, file));
            return {
                file,
                size: (stats.size / 1024).toFixed(2) + " KB",
                date: stats.mtime,
            };
        }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
        res.json(backups);
    }
    catch (error) {
        res.status(500).json({ success: false, message: "Failed to list backups", error });
    }
};
exports.getBackupList = getBackupList;
/**
 * Download a backup file
 */
const downloadBackup = (req, res) => {
    try {
        const { filename } = req.body || req.query; // allow both POST and GET
        if (!filename) {
            console.log("No filename provided");
            return res.status(400).json({ success: false, message: "Filename is required" });
        }
        const filePath = path_1.default.join(BACKUP_DIR, filename);
        console.log("Looking for file at:", filePath);
        if (!fs_1.default.existsSync(filePath)) {
            console.log("File not found");
            return res.status(404).json({ success: false, message: "File not found" });
        }
        console.log("File found:", filePath);
        // Set headers manually to ensure download
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Type", "application/octet-stream");
        return res.download(filePath, (err) => {
            if (err) {
                console.error("Error while downloading file:", err);
                return res.status(500).json({ success: false, message: "Download failed" });
            }
        });
    }
    catch (error) {
        console.error("Unexpected error:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
exports.downloadBackup = downloadBackup;
// Drop all tables in the database
const dropAllTables = async (req, res) => {
    try {
        // ✅ Simpler, valid SQL (no double escaping)
        const sql = `
      SET FOREIGN_KEY_CHECKS = 0;
      SET GROUP_CONCAT_MAX_LEN=32768;
      SELECT CONCAT('DROP TABLE IF EXISTS ', GROUP_CONCAT(CONCAT(' \`', table_name, '\`')), ';')
      INTO @dropStatement
      FROM information_schema.tables
      WHERE table_schema='${DB_CONFIG.database}';
      PREPARE stmt FROM @dropStatement;
      EXECUTE stmt;
      DEALLOCATE PREPARE stmt;
      SET FOREIGN_KEY_CHECKS = 1;
    `;
        // Remove newlines for safe CLI execution
        const cleanedSQL = sql.replace(/\s+/g, " ").trim();
        const dropCmd = `${MYSQL_PATH} -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ""} -D ${DB_CONFIG.database} -e "${cleanedSQL}"`;
        (0, child_process_1.exec)(dropCmd, (error, stdout, stderr) => {
            if (error) {
                console.error("Error dropping tables:", stderr || error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to drop tables",
                    error: stderr || error,
                });
            }
            console.log("Tables dropped successfully:", stdout);
            res.json({
                success: true,
                message: `All tables in database "${DB_CONFIG.database}" dropped successfully.`,
            });
        });
    }
    catch (error) {
        console.error("Drop error:", error);
        res.status(500).json({ success: false, message: "Drop operation failed", error });
    }
};
exports.dropAllTables = dropAllTables;
// Delete a backup file
const deleteBackup = (req, res) => {
    try {
        const { filename } = req.body || req.query; // allow both POST and GET
        if (!filename) {
            console.log("No filename provided");
            return res.status(400).json({ success: false, message: "Filename is required" });
        }
        const filePath = path_1.default.join(BACKUP_DIR, filename);
        console.log("Attempting to delete file at:", filePath);
        if (!fs_1.default.existsSync(filePath)) {
            console.log("File not found");
            return res.status(404).json({ success: false, message: "File not found" });
        }
        fs_1.default.unlinkSync(filePath); // delete the file
        console.log("File deleted successfully:", filename);
        return res.status(200).json({ success: true, message: "File deleted successfully" });
    }
    catch (error) {
        console.error("Unexpected error while deleting file:", error);
        return res.status(500).json({ success: false, message: "Server error while deleting file" });
    }
};
exports.deleteBackup = deleteBackup;
/**
 * Restore database from backup using mysql CLI
 */
const restoreBackup = async (req, res) => {
    const { filename } = req.body;
    const filePath = path_1.default.join(BACKUP_DIR, filename);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: "File not found" });
    }
    try {
        const restoreCmd = `${MYSQL_PATH} -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ""} ${DB_CONFIG.database} < "${filePath}"`;
        (0, child_process_1.exec)(restoreCmd, (error, stdout, stderr) => {
            if (error) {
                console.error("Restore failed:", stderr || error);
                return res.status(500).json({ success: false, message: "Restore failed", error: stderr || error });
            }
            res.json({ success: true, message: "Database restored successfully" });
        });
    }
    catch (error) {
        console.error("Restore error:", error);
        res.status(500).json({ success: false, message: "Restore failed", error });
    }
};
exports.restoreBackup = restoreBackup;
