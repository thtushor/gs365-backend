import {
  mysqlTable,
  int,
  varchar,
  json,
  datetime,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const designation = mysqlTable("designation", {
  id: int("id").primaryKey().autoincrement(),
  adminId: int("admin_id").notNull(),
  designationName: varchar("designation_name", { length: 200 }).notNull().unique(),
  adminUserType: varchar("admin_user_type", { length: 100 }).notNull(),
  permissions: json("permissions").notNull(), // Array of string permissions
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});