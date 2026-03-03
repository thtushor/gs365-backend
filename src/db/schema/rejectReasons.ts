import {
    mysqlTable,
    int,
    varchar,
    datetime,
    text,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const rejectReasons = mysqlTable("reject_reasons", {
    id: int("id").primaryKey().autoincrement(),
    reason: varchar("reason", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: datetime("updated_at").default(
        sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    ),
});

export type RejectReason = typeof rejectReasons.$inferSelect;
export type NewRejectReason = typeof rejectReasons.$inferInsert;
