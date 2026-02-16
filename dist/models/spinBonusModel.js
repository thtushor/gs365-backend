"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpinBonusModel = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../db/connection");
const users_1 = require("../db/schema/users");
const transactions_1 = require("../db/schema/transactions");
const schema_1 = require("../db/schema");
exports.SpinBonusModel = {
    async create(data, tx) {
        try {
            const [result] = await (tx ?? connection_1.db).insert(schema_1.spinBonus).values({
                userId: data.userId,
                transactionId: data.transactionId ?? null,
                amount: data.amount.toString(),
                conversionRate: data.conversionRate
                    ? Number(data.conversionRate)
                    : null,
                turnoverMultiply: (data.turnoverMultiply ?? 1).toString(),
            });
            return result.insertId;
        }
        catch (error) {
            console.error("Error creating spin bonus:", error);
            throw error;
        }
    },
    async getById(id) {
        try {
            const [result] = await connection_1.db
                .select({
                id: schema_1.spinBonus.id,
                userId: schema_1.spinBonus.userId,
                transactionId: schema_1.spinBonus.transactionId,
                amount: schema_1.spinBonus.amount,
                turnoverMultiply: schema_1.spinBonus.turnoverMultiply,
                createdAt: schema_1.spinBonus.createdAt,
                user: users_1.users,
                transaction: transactions_1.transactions,
                conversionRate: schema_1.spinBonus.conversionRate,
            })
                .from(schema_1.spinBonus)
                .leftJoin(users_1.users, (0, drizzle_orm_1.eq)(schema_1.spinBonus.userId, users_1.users.id))
                .leftJoin(transactions_1.transactions, (0, drizzle_orm_1.eq)(schema_1.spinBonus.transactionId, transactions_1.transactions.id))
                .where((0, drizzle_orm_1.eq)(schema_1.spinBonus.id, id))
                .limit(1);
            return result || null;
        }
        catch (error) {
            console.error("Error fetching spin bonus by ID:", error);
            throw error;
        }
    },
    async getAll(filters = {}, pagination = {}) {
        try {
            const { page = 1, pageSize = 20, sortBy = "createdAt", sortOrder = "desc", } = pagination;
            const offset = (page - 1) * pageSize;
            const conditions = [];
            if (filters.userId) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.spinBonus.userId, filters.userId));
            }
            if (filters.minAmount !== undefined) {
                conditions.push((0, drizzle_orm_1.gte)(schema_1.spinBonus.amount, filters.minAmount.toString()));
            }
            if (filters.maxAmount !== undefined) {
                conditions.push((0, drizzle_orm_1.lte)(schema_1.spinBonus.amount, filters.maxAmount.toString()));
            }
            if (filters.startDate) {
                const start = new Date(filters.startDate);
                start.setHours(0, 0, 0, 0);
                conditions.push((0, drizzle_orm_1.gte)(schema_1.spinBonus.createdAt, start));
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                conditions.push((0, drizzle_orm_1.lte)(schema_1.spinBonus.createdAt, end));
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            // Count total
            const [countRes] = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.spinBonus)
                .where(whereClause);
            const total = countRes.count;
            // Sorting
            const orderByExpr = sortBy === "amount"
                ? sortOrder === "asc"
                    ? (0, drizzle_orm_1.asc)(schema_1.spinBonus.amount)
                    : (0, drizzle_orm_1.desc)(schema_1.spinBonus.amount)
                : sortOrder === "asc"
                    ? (0, drizzle_orm_1.asc)(schema_1.spinBonus.createdAt)
                    : (0, drizzle_orm_1.desc)(schema_1.spinBonus.createdAt);
            // Data
            const data = await connection_1.db
                .select({
                id: schema_1.spinBonus.id,
                userId: schema_1.spinBonus.userId,
                transactionId: schema_1.spinBonus.transactionId,
                amount: schema_1.spinBonus.amount,
                turnoverMultiply: schema_1.spinBonus.turnoverMultiply,
                createdAt: schema_1.spinBonus.createdAt,
                conversionRate: schema_1.spinBonus.conversionRate,
                user: {
                    id: users_1.users.id,
                    username: users_1.users.username, // adjust fields to match your users table
                    email: users_1.users.email,
                },
                transaction: transactions_1.transactions,
            })
                .from(schema_1.spinBonus)
                .leftJoin(users_1.users, (0, drizzle_orm_1.eq)(schema_1.spinBonus.userId, users_1.users.id))
                .leftJoin(transactions_1.transactions, (0, drizzle_orm_1.eq)(schema_1.spinBonus.transactionId, transactions_1.transactions.id))
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
        }
        catch (error) {
            console.error("Error listing spin bonuses:", error);
            throw error;
        }
    },
    async getAllRecords(filters = {}, pagination = {}) {
        try {
            const { page = 1, pageSize = 20, sortBy = "createdAt", sortOrder = "desc", } = pagination;
            const offset = (page - 1) * pageSize;
            const conditions = [];
            if (filters.userId !== undefined && !isNaN(filters.userId)) {
                conditions.push((0, drizzle_orm_1.eq)(schema_1.spinBonus.userId, filters.userId));
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
                    conditions.push((0, drizzle_orm_1.gte)(schema_1.spinBonus.createdAt, start));
                }
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                if (!isNaN(end.getTime())) {
                    end.setHours(23, 59, 59, 999);
                    conditions.push((0, drizzle_orm_1.lte)(schema_1.spinBonus.createdAt, end));
                }
            }
            const whereClause = conditions.length > 0 ? (0, drizzle_orm_1.and)(...conditions) : undefined;
            // Count total
            const [countRes] = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(schema_1.spinBonus)
                .where(whereClause);
            const total = Number(countRes.count); // make sure it's number
            // Sorting
            const orderByExpr = sortBy === "amount"
                ? sortOrder === "asc"
                    ? (0, drizzle_orm_1.asc)(schema_1.spinBonus.amount)
                    : (0, drizzle_orm_1.desc)(schema_1.spinBonus.amount)
                : sortOrder === "asc"
                    ? (0, drizzle_orm_1.asc)(schema_1.spinBonus.createdAt)
                    : (0, drizzle_orm_1.desc)(schema_1.spinBonus.createdAt);
            // Data query
            const data = await connection_1.db
                .select({
                id: schema_1.spinBonus.id,
                userId: schema_1.spinBonus.userId,
                transactionId: schema_1.spinBonus.transactionId,
                amount: schema_1.spinBonus.amount, // comes as string from mysql driver usually
                turnoverMultiply: schema_1.spinBonus.turnoverMultiply,
                conversionRate: schema_1.spinBonus.conversionRate,
                createdAt: schema_1.spinBonus.createdAt,
                user: {
                    id: users_1.users.id,
                    username: users_1.users.username,
                    email: users_1.users.email,
                },
                transaction: transactions_1.transactions, // will be null if no match
            })
                .from(schema_1.spinBonus)
                .leftJoin(users_1.users, (0, drizzle_orm_1.eq)(schema_1.spinBonus.userId, users_1.users.id))
                .leftJoin(transactions_1.transactions, (0, drizzle_orm_1.eq)(schema_1.spinBonus.transactionId, transactions_1.transactions.id))
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
        }
        catch (error) {
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
