import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema"; // Import all schemas

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

const db = drizzle(pool, { schema, mode: "default" }); // Pass schema to drizzle

// This is a dummy comment to trigger re-evaluation
export { pool, db };
