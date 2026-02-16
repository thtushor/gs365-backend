"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tokensRelations = exports.userTokens = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("./users");
const AdminUsers_1 = require("./AdminUsers");
exports.userTokens = (0, mysql_core_1.mysqlTable)("user_tokens", {
    id: (0, mysql_core_1.int)("id").primaryKey().autoincrement(),
    user_id: (0, mysql_core_1.int)("user_id"),
    admin_id: (0, mysql_core_1.int)("admin_id"),
    token: (0, mysql_core_1.text)("token").notNull(), // store verification/reset token
    type: (0, mysql_core_1.mysqlEnum)("token_type", ["verify", "reset_password", "2fa"]), // e.g. "verify", "reset_password", "2fa"
    is_used: (0, mysql_core_1.boolean)("is_used").default(false),
    expires_at: (0, mysql_core_1.datetime)("expires_at").notNull(),
    created_at: (0, mysql_core_1.datetime)("created_at").default((0, drizzle_orm_1.sql) `CURRENT_TIMESTAMP`),
});
exports.tokensRelations = (0, drizzle_orm_1.relations)(exports.userTokens, ({ one }) => ({
    user: one(users_1.users, {
        fields: [exports.userTokens.user_id],
        references: [users_1.users.id],
    }),
    admin: one(AdminUsers_1.adminUsers, {
        fields: [exports.userTokens.user_id],
        references: [AdminUsers_1.adminUsers.id],
    }),
}));
// // In user relation
// export const usersRelations = relations(users, ({ one, many }) => ({
//   tokens: many(tokens), // 🔑 one user can have many tokens
// }));
