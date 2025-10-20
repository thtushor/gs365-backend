import fs from "fs";
import path from "path";
import { Request, Response } from "express";
import { exec } from "child_process";
import cron from "node-cron";

const MYSQLDUMP_PATH = `${process.env.MYSQLDUMP_PATH || `mysqldump`}`;
const MYSQL_PATH = `${process.env.MYSQL_PATH || `mysql`}`;

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

export const scheduleAutoBackup = () => {
  console.log("🕒 Setting up automatic daily backups...");

  // Run every day at 03:00 (midnight)
  cron.schedule("0 3 * * *", async () => {
    try {
      console.log("📦 Auto-backup job started...");

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const sqlFile = path.join(BACKUP_DIR, `auto_backup_${timestamp}.sql`);

      const dumpCmd = `${MYSQLDUMP_PATH} -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user
        } ${DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ""} ${DB_CONFIG.database} > "${sqlFile}"`;

      exec(dumpCmd, (error, stdout, stderr) => {
        if (error) {
          console.error("❌ Auto-backup failed:", stderr || error);
          return;
        }

        console.log("✅ Auto-backup completed:", sqlFile);

        // Optional: Cleanup old backups (keep only latest 7)
        const backups = fs
          .readdirSync(BACKUP_DIR)
          .filter((f) => f.startsWith("auto_backup_"))
          .sort(
            (a, b) =>
              fs.statSync(path.join(BACKUP_DIR, b)).mtime.getTime() -
              fs.statSync(path.join(BACKUP_DIR, a)).mtime.getTime()
          );

        if (backups.length > 7) {
          const oldFiles = backups.slice(7);
          for (const old of oldFiles) {
            const oldPath = path.join(BACKUP_DIR, old);
            fs.unlinkSync(oldPath);
            console.log("🗑️ Deleted old auto-backup:", old);
          }
        }
      });
    } catch (err) {
      console.error("⚠️ Auto-backup job failed:", err);
    }
  });

  console.log("✅ Auto-backup scheduler initialized.");
};

/**
 * Create a database backup using mysqldump CLI
 */
export const createBackup = async (req: Request, res: Response) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const sqlFile = path.join(BACKUP_DIR, `backup_${timestamp}.sql`);

    // Build mysqldump command
    const dumpCmd = `${MYSQLDUMP_PATH} -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ""
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
    }).sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending
    res.json(backups);
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to list backups", error });
  }
};

/**
 * Download a backup file
 */
export const downloadBackup = (req: Request, res: Response) => {
  try {
    const { filename } = req.body || req.query; // allow both POST and GET
    if (!filename) {
      console.log("No filename provided");
      return res.status(400).json({ success: false, message: "Filename is required" });
    }

    const filePath = path.join(BACKUP_DIR, filename);
    console.log("Looking for file at:", filePath);

    if (!fs.existsSync(filePath)) {
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
  } catch (error) {
    console.error("Unexpected error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Drop all tables in the database
export const dropAllTables = async (req: Request, res: Response) => {
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

    const dropCmd = `${MYSQL_PATH} -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${
      DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ""
    } -D ${DB_CONFIG.database} -e "${cleanedSQL}"`;

    exec(dropCmd, (error, stdout, stderr) => {
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
  } catch (error) {
    console.error("Drop error:", error);
    res.status(500).json({ success: false, message: "Drop operation failed", error });
  }
};
// Delete a backup file
export const deleteBackup = (req: Request, res: Response) => {
  try {
    const { filename } = req.body || req.query; // allow both POST and GET
    if (!filename) {
      console.log("No filename provided");
      return res.status(400).json({ success: false, message: "Filename is required" });
    }

    const filePath = path.join(BACKUP_DIR, filename);
    console.log("Attempting to delete file at:", filePath);

    if (!fs.existsSync(filePath)) {
      console.log("File not found");
      return res.status(404).json({ success: false, message: "File not found" });
    }

    fs.unlinkSync(filePath); // delete the file
    console.log("File deleted successfully:", filename);

    return res.status(200).json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    console.error("Unexpected error while deleting file:", error);
    return res.status(500).json({ success: false, message: "Server error while deleting file" });
  }
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
    const restoreCmd = `${MYSQL_PATH} -h ${DB_CONFIG.host} -P ${DB_CONFIG.port} -u ${DB_CONFIG.user} ${DB_CONFIG.password ? `-p${DB_CONFIG.password}` : ""
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
