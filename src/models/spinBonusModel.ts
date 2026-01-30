import { eq, and, gte, lte, desc, asc, count, sql } from "drizzle-orm";
import { db } from "../db/connection";
import { users } from "../db/schema/users";
import { transactions } from "../db/schema/transactions";
import { spinBonus } from "../db/schema";

export interface SpinBonusCreateData {
  userId: number;
  transactionId?: number | null;
  amount: number;
  turnoverMultiply?: number;
  conversionRate?: any | null;
}

export interface SpinBonusFilters {
  userId?: number;
  transactionId?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "amount";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedSpinBonusResult<T = any> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const SpinBonusModel = {
  async create(data: SpinBonusCreateData, tx?: any): Promise<number> {
    try {
      const [result] = await (tx ?? db).insert(spinBonus).values({
        userId: data.userId,
        transactionId: data.transactionId ?? null,
        amount: data.amount.toString(),
        conversionRate: data.conversionRate
          ? Number(data.conversionRate)
          : null,
        turnoverMultiply: (data.turnoverMultiply ?? 1).toString(),
      });

      return result.insertId;
    } catch (error) {
      console.error("Error creating spin bonus:", error);
      throw error;
    }
  },

  async getById(id: number): Promise<any | null> {
    try {
      const [result] = await db
        .select({
          id: spinBonus.id,
          userId: spinBonus.userId,
          transactionId: spinBonus.transactionId,
          amount: spinBonus.amount,
          turnoverMultiply: spinBonus.turnoverMultiply,
          createdAt: spinBonus.createdAt,
          user: users,
          transaction: transactions,
          conversionRate: spinBonus.conversionRate,
        })
        .from(spinBonus)
        .leftJoin(users, eq(spinBonus.userId, users.id))
        .leftJoin(transactions, eq(spinBonus.transactionId, transactions.id))
        .where(eq(spinBonus.id, id))
        .limit(1);

      return result || null;
    } catch (error) {
      console.error("Error fetching spin bonus by ID:", error);
      throw error;
    }
  },

  async getAll(
    filters: SpinBonusFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedSpinBonusResult> {
    try {
      const {
        page = 1,
        pageSize = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = pagination;

      const offset = (page - 1) * pageSize;

      const conditions = [];

      if (filters.userId) {
        conditions.push(eq(spinBonus.userId, filters.userId));
      }
      if (filters.transactionId) {
        conditions.push(eq(spinBonus.transactionId, filters.transactionId));
      }
      if (filters.minAmount !== undefined) {
        conditions.push(gte(spinBonus.amount, filters.minAmount.toString()));
      }
      if (filters.maxAmount !== undefined) {
        conditions.push(lte(spinBonus.amount, filters.maxAmount.toString()));
      }
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        conditions.push(gte(spinBonus.createdAt, start));
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        conditions.push(lte(spinBonus.createdAt, end));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Count total
      const [countRes] = await db
        .select({ count: count() })
        .from(spinBonus)
        .where(whereClause);

      const total = countRes.count;

      // Sorting
      const orderByExpr =
        sortBy === "amount"
          ? sortOrder === "asc"
            ? asc(spinBonus.amount)
            : desc(spinBonus.amount)
          : sortOrder === "asc"
            ? asc(spinBonus.createdAt)
            : desc(spinBonus.createdAt);

      // Data
      const data = await db
        .select({
          id: spinBonus.id,
          userId: spinBonus.userId,
          transactionId: spinBonus.transactionId,
          amount: spinBonus.amount,
          turnoverMultiply: spinBonus.turnoverMultiply,
          createdAt: spinBonus.createdAt,
          conversionRate: spinBonus.conversionRate,
          user: {
            id: users.id,
            username: users.username, // adjust fields to match your users table
            email: users.email,
          },
          transaction: transactions,
        })
        .from(spinBonus)
        .leftJoin(users, eq(spinBonus.userId, users.id))
        .leftJoin(transactions, eq(spinBonus.transactionId, transactions.id))
        .where(whereClause)
        .orderBy(orderByExpr)
        .limit(pageSize)
        .offset(offset);

      const totalPages = Math.ceil(total / pageSize);

      return {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error listing spin bonuses:", error);
      throw error;
    }
  },

  async getAllRecords(
    filters: SpinBonusFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedSpinBonusResult> {
    try {
      const {
        page = 1,
        pageSize = 20,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = pagination;

      const offset = (page - 1) * pageSize;

      const conditions = [];

      if (filters.userId !== undefined && !isNaN(filters.userId)) {
        conditions.push(eq(spinBonus.userId, filters.userId));
      }

      if (filters.transactionId !== undefined) {
        conditions.push(eq(spinBonus.transactionId, filters.transactionId));
      }

      // ────────────────────────────────────────────────
      // FIXED: do NOT .toString() — pass number directly
      // Drizzle handles number → DECIMAL binding safely
      // ────────────────────────────────────────────────

      // Date filters (optional — frontend doesn't use them yet)
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        if (!isNaN(start.getTime())) {
          start.setHours(0, 0, 0, 0);
          conditions.push(gte(spinBonus.createdAt, start));
        }
      }

      if (filters.endDate) {
        const end = new Date(filters.endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          conditions.push(lte(spinBonus.createdAt, end));
        }
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      // Count total
      const [countRes] = await db
        .select({ count: count() })
        .from(spinBonus)
        .where(whereClause);

      const total = Number(countRes.count); // make sure it's number

      // Sorting
      const orderByExpr =
        sortBy === "amount"
          ? sortOrder === "asc"
            ? asc(spinBonus.amount)
            : desc(spinBonus.amount)
          : sortOrder === "asc"
            ? asc(spinBonus.createdAt)
            : desc(spinBonus.createdAt);

      // Data query
      const data = await db
        .select({
          id: spinBonus.id,
          userId: spinBonus.userId,
          transactionId: spinBonus.transactionId,
          amount: spinBonus.amount, // comes as string from mysql driver usually
          turnoverMultiply: spinBonus.turnoverMultiply,
          conversionRate: spinBonus.conversionRate,
          createdAt: spinBonus.createdAt,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
          },
          transaction: transactions, // will be null if no match
        })
        .from(spinBonus)
        .leftJoin(users, eq(spinBonus.userId, users.id))
        .leftJoin(transactions, eq(spinBonus.transactionId, transactions.id))
        .where(whereClause)
        .orderBy(orderByExpr)
        .limit(pageSize)
        .offset(offset);

      const totalPages = Math.ceil(total / pageSize);

      return {
        data,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      console.error("Error listing spin bonuses:", error);
      throw error;
    }
  },

  //   // Optional useful helpers

  //   async getTotalBonusAmountForUser(userId: number): Promise<number> {
  //     const [res] = await db
  //       .select({
  //         total: sql<number>`COALESCE(SUM(CAST(${spinBonus.amount} AS DECIMAL(18,2))), 0)`,
  //       })
  //       .from(spinBonus)
  //       .where(eq(spinBonus.userId, userId));

  //     return Number(res.total);
  //   },

  //   async getActiveBonusesCountForUser(userId: number): Promise<number> {
  //     // If you later add status / activatedAt / expiredAt columns, you can filter here
  //     const [res] = await db
  //       .select({ count: count() })
  //       .from(spinBonus)
  //       .where(eq(spinBonus.userId, userId));

  //     return res.count;
  //   },
};
