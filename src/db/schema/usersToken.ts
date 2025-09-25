import {
  mysqlTable,
  int,
  varchar,
  datetime,
  boolean,
  text,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";

import { users } from "./users";
import { adminUsers } from "./AdminUsers";

export const userTokens = mysqlTable("user_tokens", {
  id: int("id").primaryKey().autoincrement(),
  user_id: int("user_id"),
  admin_id: int("admin_id"),
  token: text("token").notNull(), // store verification/reset token
  type: mysqlEnum("token_type",["verify","reset_password","2fa"]), // e.g. "verify", "reset_password", "2fa"
  is_used: boolean("is_used").default(false),
  expires_at: datetime("expires_at").notNull(),
  created_at: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const tokensRelations = relations(userTokens, ({ one }) => ({
  user: one(users, {
    fields: [userTokens.user_id],
    references: [users.id],
  }),
  admin: one(adminUsers, {
    fields: [userTokens.user_id],
    references: [adminUsers.id],
  }),
}));

// // In user relation
// export const usersRelations = relations(users, ({ one, many }) => ({
//   tokens: many(tokens), // 🔑 one user can have many tokens
// }));
