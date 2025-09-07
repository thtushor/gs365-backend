import {
  mysqlTable,
  int,
  varchar,
  json,
  datetime,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";
import { adminRole } from "./AdminUsers";

export const designation = mysqlTable("designation", {
  id: int("id").primaryKey().autoincrement(),
  adminId: int("admin_id").notNull(),
  designationName: varchar("designation_name", { length: 200 }).notNull().unique(),
  adminUserType: adminRole("admin_user_type"),
  permissions: json("permissions").notNull(), // Array of string permissions
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});