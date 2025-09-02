import { sql } from "drizzle-orm";
import { datetime, int, mysqlTable } from "drizzle-orm/mysql-core";

export const user_favorites = mysqlTable("user_favorites", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  gameId: int("game_id").notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});
