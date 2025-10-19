import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { exec } from "child_process";

const MYSQLDUMP_PATH = `"C:\\xampp\\mysql\\bin\\mysqldump.exe"`;
const MYSQL_PATH = `"C:\\xampp\\mysql\\bin\\mysql.exe"`;




const BACKUP_DIR = path.join(process.cwd(), "backups");

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
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

/**
 * Create a database backup using mysqldump CLI
 */
export const createBackup = async (req: Request, res: Response) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const sqlFile = path.join(BACKUP_DIR, `backup_${timestamp}.sql`);

    // Build mysqldump command
    const dumpCmd = `${MYSQLDUMP_PATH} -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${
      DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ""
    } ${DB_CONFIG.database} > "${sqlFile}"`;

    exec(dumpCmd, (error, stdout, stderr) => {
      if (error) {
        console.error("Backup failed:", stderr || error);
        return res.status(500).json({ success: false, message: "Backup failed", error: stderr || error });
      }

      res.json({ success: true, file: path.basename(sqlFile) });
    });
  } catch (error) {
    console.error("Backup error:", error);
    res.status(500).json({ success: false, message: "Backup failed", error });
  }
};

/**
 * Get all backups list
 */
export const getBackupList = (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups = files.map((file) => {
      const stats = fs.statSync(path.join(BACKUP_DIR, file));
      return {
        file,
        size: (stats.size / 1024).toFixed(2) + " KB",
        date: stats.mtime,
      };
    });
    res.json(backups);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list backups", error });
  }
};

/**
 * Download a backup file
 */
export const downloadBackup = (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(BACKUP_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File not found" });
  }

  res.download(filePath);
};

/**
 * Restore database from backup using mysql CLI
 */
export const restoreBackup = async (req: Request, res: Response) => {
  const { filename } = req.body;
  const filePath = path.join(BACKUP_DIR, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: "File not found" });
  }

  try {
    const restoreCmd = `mysql -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${
      DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ""
    } ${DB_CONFIG.database} < "${filePath}"`;

    exec(restoreCmd, (error, stdout, stderr) => {
      if (error) {
        console.error("Restore failed:", stderr || error);
        return res.status(500).json({ success: false, message: "Restore failed", error: stderr || error });
      }

      res.json({ success: true, message: "Database restored successfully" });
    });
  } catch (error) {
    console.error("Restore error:", error);
    res.status(500).json({ success: false, message: "Restore failed", error });
  }
};
