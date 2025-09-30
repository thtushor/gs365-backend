import { mysqlTable, int, varchar, boolean, timestamp, index } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const userPhones = mysqlTable(
  "user_phones",
  {
    id: int("id").primaryKey().autoincrement(),
    userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    phoneNumber: varchar("phone_number", { length: 32 }).notNull().unique(),
    isPrimary: boolean("is_primary").default(false),
    isVerified: boolean("is_verified").default(false),
    isSmsCapable: boolean("is_sms_capable").default(true),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    // phone_number is unique; no separate non-unique index needed
    isPrimaryIdx: index("is_primary_idx").on(table.isPrimary),
  })
);

export const userPhonesRelations = relations(userPhones, ({ one }) => ({
  user: one(users, {
    fields: [userPhones.userId],
    references: [users.id],
  }),
}));

export type UserPhone = typeof userPhones.$inferSelect;
export type NewUserPhone = typeof userPhones.$inferInsert;


