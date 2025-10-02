import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "../db/connection";
import { userPhones, users } from "../db/schema";

export interface UserPhoneFilters {
  userId?: number;
  isPrimary?: boolean;
  isVerified?: boolean;
  isSmsCapable?: boolean;
}

export const UserPhoneModel = {
  async create(data: {
    userId: number;
    phoneNumber: string;
    isPrimary?: boolean;
    isVerified?: boolean;
    isSmsCapable?: boolean;
  }) {
    try {
      // If setting as primary, unset existing primary for user
      if (data.isPrimary) {
        await db.update(userPhones).set({ isPrimary: false }).where(eq(userPhones.userId, data.userId));
      }
      await db.insert(userPhones).values({
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        isPrimary: data.isPrimary ?? false,
        isVerified: data.isVerified ?? false,
        isSmsCapable: data.isSmsCapable ?? true,
      });
      const list = await this.getByUserId(data.userId);
      return list.find((p) => p.phoneNumber === data.phoneNumber) || null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error during phone create";
      throw new Error(message);
    }
  },

  async getById(id: number) {
    const [row] = await db
      .select({
        id: userPhones.id,
        userId: userPhones.userId,
        phoneNumber: userPhones.phoneNumber,
        isPrimary: userPhones.isPrimary,
        isVerified: userPhones.isVerified,
        isSmsCapable: userPhones.isSmsCapable,
        createdAt: userPhones.createdAt,
        updatedAt: userPhones.updatedAt,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
        },
      })
      .from(userPhones)
      .leftJoin(users, eq(users.id, userPhones.userId))
      .where(eq(userPhones.id, id))
      .limit(1);
    return row || null;
  },

  async getByUserId(userId: number) {
    const list = await db
      .select({
        id: userPhones.id,
        userId: userPhones.userId,
        phoneNumber: userPhones.phoneNumber,
        isPrimary: userPhones.isPrimary,
        isVerified: userPhones.isVerified,
        isSmsCapable: userPhones.isSmsCapable,
        createdAt: userPhones.createdAt,
        updatedAt: userPhones.updatedAt,
      })
      .from(userPhones)
      .where(eq(userPhones.userId, userId))
      .orderBy(desc(userPhones.isPrimary), desc(userPhones.isVerified), asc(userPhones.id));
    return list;
  },

  async getWithFilters(filters: UserPhoneFilters) {
    const whereClauses = [] as any[];
    if (filters.userId !== undefined) whereClauses.push(eq(userPhones.userId, filters.userId));
    if (filters.isPrimary !== undefined) whereClauses.push(eq(userPhones.isPrimary, filters.isPrimary));
    if (filters.isVerified !== undefined) whereClauses.push(eq(userPhones.isVerified, filters.isVerified));
    if (filters.isSmsCapable !== undefined) whereClauses.push(eq(userPhones.isSmsCapable, filters.isSmsCapable));

    const where = whereClauses.length ? and(...whereClauses) : undefined;
    const list = await db
      .select({
        id: userPhones.id,
        userId: userPhones.userId,
        phoneNumber: userPhones.phoneNumber,
        isPrimary: userPhones.isPrimary,
        isVerified: userPhones.isVerified,
        isSmsCapable: userPhones.isSmsCapable,
        createdAt: userPhones.createdAt,
        updatedAt: userPhones.updatedAt,
      })
      .from(userPhones)
      .where(where)
      .orderBy(desc(userPhones.isPrimary), desc(userPhones.isVerified), desc(userPhones.updatedAt));
    return list;
  },

  async update(id: number, data: Partial<{ phoneNumber: string; isPrimary: boolean; isVerified: boolean; isSmsCapable: boolean; }>) {
    try {
      // Sanitize input to only allow whitelisted fields
      const allowed: Partial<{ phoneNumber: string; isPrimary: boolean; isVerified: boolean; isSmsCapable: boolean; }> = {};
      if (typeof data.phoneNumber === "string") allowed.phoneNumber = data.phoneNumber;
      if (typeof data.isPrimary === "boolean") allowed.isPrimary = data.isPrimary;
      if (typeof data.isVerified === "boolean") allowed.isVerified = data.isVerified;
      if (typeof data.isSmsCapable === "boolean") allowed.isSmsCapable = data.isSmsCapable;

      if (allowed.isPrimary) {
        const current = await this.getById(id);
        if (current?.userId) {
          await db.update(userPhones).set({ isPrimary: false }).where(and(eq(userPhones.userId, current.userId), eq(userPhones.isPrimary, true)));
        }
      }
      await db.update(userPhones).set({ ...allowed, updatedAt: new Date() as unknown as any }).where(eq(userPhones.id, id));
      return this.getById(id);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error during phone update";
      throw new Error(message);
    }
  },

  async delete(id: number) {
    await db.delete(userPhones).where(eq(userPhones.id, id));
    return true;
  },

  async setPrimary(id: number) {
    const current = await this.getById(id);
    if (!current?.userId) return false;
    await db.update(userPhones).set({ isPrimary: false }).where(eq(userPhones.userId, current.userId));
    await db.update(userPhones).set({ isPrimary: true, updatedAt: new Date() }).where(eq(userPhones.id, id));
    return true;
  },

  async verify(id: number) {
    await db.update(userPhones).set({ isVerified: true, updatedAt: new Date() }).where(eq(userPhones.id, id));
    return this.getById(id);
  },
};


