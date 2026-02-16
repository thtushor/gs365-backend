"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminMainBalanceModel = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../db/connection");
const adminMainBalance_1 = require("../db/schema/adminMainBalance");
const users_1 = require("../db/schema/users");
const AdminUsers_1 = require("../db/schema/AdminUsers");
const promotions_1 = require("../db/schema/promotions");
const transactions_1 = require("../db/schema/transactions");
const currency_1 = require("../db/schema/currency");
exports.AdminMainBalanceModel = {
    // Create a new admin main balance record
    async create(data, tx) {
        try {
            const [result] = await (tx ?? connection_1.db).insert(adminMainBalance_1.adminMainBalance).values({
                amount: data.amount.toString(),
                type: data.type,
                status: data.status || "pending",
                promotionId: data.promotionId || null,
                transactionId: data.transactionId || null,
                promotionName: data.promotionName || null,
                currencyId: data.currencyId,
                createdByPlayer: data.createdByPlayer || null,
                createdByAdmin: data.createdByAdmin || null,
                notes: data.notes || null,
            });
            console.log("insert admin balance", result);
            return result.insertId;
        }
        catch (error) {
            console.error("Error creating admin main balance record:", error);
            throw error;
        }
    },
    // Get admin main balance by ID
    async getById(id) {
        try {
            const [result] = await connection_1.db
                .select({
                id: adminMainBalance_1.adminMainBalance.id,
                amount: adminMainBalance_1.adminMainBalance.amount,
                type: adminMainBalance_1.adminMainBalance.type,
                status: adminMainBalance_1.adminMainBalance.status,
                promotionId: adminMainBalance_1.adminMainBalance.promotionId,
                transactionId: adminMainBalance_1.adminMainBalance.transactionId,
                promotionName: adminMainBalance_1.adminMainBalance.promotionName,
                currencyId: adminMainBalance_1.adminMainBalance.currencyId,
                createdByPlayer: adminMainBalance_1.adminMainBalance.createdByPlayer,
                createdByAdmin: adminMainBalance_1.adminMainBalance.createdByAdmin,
                notes: adminMainBalance_1.adminMainBalance.notes,
                createdAt: adminMainBalance_1.adminMainBalance.createdAt,
                updatedAt: adminMainBalance_1.adminMainBalance.updatedAt,
                // Joined data
                currency: currency_1.currencies,
                promotion: promotions_1.promotions,
                transaction: transactions_1.transactions,
                createdByPlayerUser: users_1.users,
                createdByAdminUser: AdminUsers_1.adminUsers,
            })
                .from(adminMainBalance_1.adminMainBalance)
                .leftJoin(currency_1.currencies, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.currencyId, currency_1.currencies.id))
                .leftJoin(promotions_1.promotions, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.promotionId, promotions_1.promotions.id))
                .leftJoin(transactions_1.transactions, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.transactionId, transactions_1.transactions.id))
                .leftJoin(users_1.users, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.createdByPlayer, users_1.users.id))
                .leftJoin(AdminUsers_1.adminUsers, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.createdByAdmin, AdminUsers_1.adminUsers.id))
                .where((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.id, id))
                .limit(1);
            return result || null;
        }
        catch (error) {
            console.error("Error fetching admin main balance by ID:", error);
            throw error;
        }
    },
    // Update admin main balance record
    async update(id, data) {
        try {
            const updateData = {};
            if (data.amount !== undefined)
                updateData.amount = data.amount.toString();
            if (data.type !== undefined)
                updateData.type = data.type;
            if (data.status !== undefined)
                updateData.status = data.status;
            if (data.promotionId !== undefined)
                updateData.promotionId = data.promotionId;
            if (data.transactionId !== undefined)
                updateData.transactionId = data.transactionId;
            if (data.promotionName !== undefined)
                updateData.promotionName = data.promotionName;
            if (data.currencyId !== undefined)
                updateData.currencyId = data.currencyId;
            if (data.createdByPlayer !== undefined)
                updateData.createdByPlayer = data.createdByPlayer;
            if (data.createdByAdmin !== undefined)
                updateData.createdByAdmin = data.createdByAdmin;
            if (data.notes !== undefined)
                updateData.notes = data.notes;
            await connection_1.db
                .update(adminMainBalance_1.adminMainBalance)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.id, id));
            return true;
        }
        catch (error) {
            console.error("Error updating admin main balance:", error);
            throw error;
        }
    },
    // Update admin main balance records by transaction ID
    async updateByTransactionId(transactionId, data) {
        try {
            const updateData = {};
            if (data.amount !== undefined)
                updateData.amount = data.amount.toString();
            if (data.type !== undefined)
                updateData.type = data.type;
            if (data.status !== undefined)
                updateData.status = data.status;
            if (data.promotionId !== undefined)
                updateData.promotionId = data.promotionId;
            if (data.transactionId !== undefined)
                updateData.transactionId = data.transactionId;
            if (data.promotionName !== undefined)
                updateData.promotionName = data.promotionName;
            if (data.currencyId !== undefined)
                updateData.currencyId = data.currencyId;
            if (data.createdByPlayer !== undefined)
                updateData.createdByPlayer = data.createdByPlayer;
            if (data.createdByAdmin !== undefined)
                updateData.createdByAdmin = data.createdByAdmin;
            if (data.notes !== undefined)
                updateData.notes = data.notes;
            await connection_1.db
                .update(adminMainBalance_1.adminMainBalance)
                .set(updateData)
                .where((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.transactionId, transactionId));
            return true;
        }
        catch (error) {
            console.error("Error updating admin main balance by transaction ID:", error);
            throw error;
        }
    },
    // Delete admin main balance record
    async delete(id) {
        try {
            await connection_1.db.delete(adminMainBalance_1.adminMainBalance).where((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.id, id));
            return true;
        }
        catch (error) {
            console.error("Error deleting admin main balance:", error);
            throw error;
        }
    },
    // Get all admin main balance records with filters and pagination
    async getAll(filters = {}, pagination = {}) {
        try {
            const { page = 1, pageSize = 10, sortBy = "createdAt", sortOrder = "desc", } = pagination;
            const offset = (page - 1) * pageSize;
            // Build where conditions
            const whereConditions = [];
            if (filters.type) {
                // If caller specifies type → use it directly
                whereConditions.push((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.type, filters.type));
            }
            else {
                // Default case → only admin_deposit
                whereConditions.push((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.type, "admin_deposit"));
            }
            if (filters.status) {
                whereConditions.push((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.status, filters.status));
            }
            if (filters.promotionId) {
                whereConditions.push((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.promotionId, filters.promotionId));
            }
            if (filters.transactionId) {
                whereConditions.push((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.transactionId, filters.transactionId));
            }
            if (filters.createdByPlayer) {
                whereConditions.push((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.createdByPlayer, filters.createdByPlayer));
            }
            if (filters.createdByAdmin) {
                whereConditions.push((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.createdByAdmin, filters.createdByAdmin));
            }
            if (filters.currencyId) {
                whereConditions.push((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.currencyId, filters.currencyId));
            }
            if (filters.startDate) {
                const start = new Date(filters.startDate);
                start.setHours(0, 0, 0, 0);
                whereConditions.push((0, drizzle_orm_1.gte)(adminMainBalance_1.adminMainBalance.createdAt, start));
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                whereConditions.push((0, drizzle_orm_1.lte)(adminMainBalance_1.adminMainBalance.createdAt, end));
            }
            if (filters.search) {
                whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(adminMainBalance_1.adminMainBalance.promotionName, `%${filters.search}%`), (0, drizzle_orm_1.like)(adminMainBalance_1.adminMainBalance.notes, `%${filters.search}%`)));
            }
            const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
            // Get total count
            const [totalResult] = await connection_1.db
                .select({ count: (0, drizzle_orm_1.count)() })
                .from(adminMainBalance_1.adminMainBalance)
                .where(whereClause);
            const total = totalResult.count;
            // Get paginated data
            const orderBy = sortOrder === "asc"
                ? (0, drizzle_orm_1.asc)(adminMainBalance_1.adminMainBalance.createdAt)
                : (0, drizzle_orm_1.desc)(adminMainBalance_1.adminMainBalance.createdAt);
            const data = await connection_1.db
                .select({
                id: adminMainBalance_1.adminMainBalance.id,
                amount: adminMainBalance_1.adminMainBalance.amount,
                type: adminMainBalance_1.adminMainBalance.type,
                status: adminMainBalance_1.adminMainBalance.status,
                promotionId: adminMainBalance_1.adminMainBalance.promotionId,
                transactionId: adminMainBalance_1.adminMainBalance.transactionId,
                promotionName: adminMainBalance_1.adminMainBalance.promotionName,
                currencyId: adminMainBalance_1.adminMainBalance.currencyId,
                createdByPlayer: adminMainBalance_1.adminMainBalance.createdByPlayer,
                createdByAdmin: adminMainBalance_1.adminMainBalance.createdByAdmin,
                notes: adminMainBalance_1.adminMainBalance.notes,
                createdAt: adminMainBalance_1.adminMainBalance.createdAt,
                updatedAt: adminMainBalance_1.adminMainBalance.updatedAt,
                // Joined data
                currency: currency_1.currencies,
                promotion: promotions_1.promotions,
                transaction: transactions_1.transactions,
                createdByPlayerUser: users_1.users,
                createdByAdminUser: AdminUsers_1.adminUsers,
            })
                .from(adminMainBalance_1.adminMainBalance)
                .leftJoin(currency_1.currencies, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.currencyId, currency_1.currencies.id))
                .leftJoin(promotions_1.promotions, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.promotionId, promotions_1.promotions.id))
                .leftJoin(transactions_1.transactions, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.transactionId, transactions_1.transactions.id))
                .leftJoin(users_1.users, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.createdByPlayer, users_1.users.id))
                .leftJoin(AdminUsers_1.adminUsers, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.createdByAdmin, AdminUsers_1.adminUsers.id))
                .where(whereClause)
                .orderBy(orderBy)
                .limit(pageSize)
                .offset(offset);
            // Calculate stats
            const stats = await this.calculateStats(filters);
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
                stats,
            };
        }
        catch (error) {
            console.error("Error fetching admin main balance records:", error);
            throw error;
        }
    },
    // Calculate current main balance and stats
    async calculateStats(filters = {}) {
        try {
            // Build where conditions for stats
            const whereConditions = [];
            if (filters.currencyId) {
                whereConditions.push((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.currencyId, filters.currencyId));
            }
            if (filters.status) {
                whereConditions.push((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.status, filters.status));
            }
            if (filters.startDate) {
                const start = new Date(filters.startDate);
                start.setHours(0, 0, 0, 0);
                whereConditions.push((0, drizzle_orm_1.gte)(adminMainBalance_1.adminMainBalance.createdAt, start));
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                whereConditions.push((0, drizzle_orm_1.lte)(adminMainBalance_1.adminMainBalance.createdAt, end));
            }
            const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
            const [statsResult] = await connection_1.db
                .select({
                totalAdminDeposit: (0, drizzle_orm_1.sql) `
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance_1.adminMainBalance.type} = 'admin_deposit' 
            THEN CAST(${adminMainBalance_1.adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
                totalPlayerDeposit: (0, drizzle_orm_1.sql) `
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance_1.adminMainBalance.type} = 'player_deposit' 
              AND ${adminMainBalance_1.adminMainBalance.status} = 'approved'
            THEN CAST(${adminMainBalance_1.adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
                totalSpinBonus: (0, drizzle_orm_1.sql) `
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance_1.adminMainBalance.type} = 'spin_bonus' 
              AND ${adminMainBalance_1.adminMainBalance.status} = 'approved'
            THEN CAST(${adminMainBalance_1.adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
                totalPromotion: (0, drizzle_orm_1.sql) `
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance_1.adminMainBalance.type} = 'promotion' 
              AND ${adminMainBalance_1.adminMainBalance.status} = 'approved'
            THEN CAST(${adminMainBalance_1.adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
                totalPlayerWithdraw: (0, drizzle_orm_1.sql) `
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance_1.adminMainBalance.type} = 'player_withdraw' 
              AND ${adminMainBalance_1.adminMainBalance.status} = 'approved'
            THEN CAST(${adminMainBalance_1.adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
                totalAdminWithdraw: (0, drizzle_orm_1.sql) `
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance_1.adminMainBalance.type} = 'admin_withdraw' 
              AND ${adminMainBalance_1.adminMainBalance.status} = 'approved'
            THEN CAST(${adminMainBalance_1.adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
                totalRecords: (0, drizzle_orm_1.count)(),
            })
                .from(adminMainBalance_1.adminMainBalance)
                .where(whereClause);
            const { totalAdminDeposit, totalPlayerDeposit, totalPromotion, totalPlayerWithdraw, totalAdminWithdraw, totalRecords, totalSpinBonus, } = statsResult;
            // Calculate current main balance
            // current main balance = total admin deposit - total player deposit - total promotion + total player withdraw + total admin withdraw
            const currentMainBalance = Number(totalAdminDeposit) +
                Number(totalPlayerWithdraw) +
                Number(totalAdminWithdraw) -
                Number(totalPlayerDeposit) -
                Number(totalPromotion) -
                Number(totalSpinBonus);
            console.log(statsResult, currentMainBalance);
            return {
                totalAdminDeposit,
                totalPlayerDeposit,
                totalPromotion,
                totalPlayerWithdraw,
                totalAdminWithdraw,
                currentMainBalance,
                totalSpinBonus,
                totalRecords,
            };
        }
        catch (error) {
            console.error("Error calculating admin main balance stats:", error);
            throw error;
        }
    },
    // Get balance by type
    async getBalanceByType(type, filters = {}) {
        try {
            const whereConditions = [(0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.type, type)];
            if (filters.currencyId) {
                whereConditions.push((0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.currencyId, filters.currencyId));
            }
            if (filters.startDate) {
                const start = new Date(filters.startDate);
                start.setHours(0, 0, 0, 0);
                whereConditions.push((0, drizzle_orm_1.gte)(adminMainBalance_1.adminMainBalance.createdAt, start));
            }
            if (filters.endDate) {
                const end = new Date(filters.endDate);
                end.setHours(23, 59, 59, 999);
                whereConditions.push((0, drizzle_orm_1.lte)(adminMainBalance_1.adminMainBalance.createdAt, end));
            }
            const [result] = await connection_1.db
                .select({
                total: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(${adminMainBalance_1.adminMainBalance.amount} AS DECIMAL(20,2))), 0)`,
            })
                .from(adminMainBalance_1.adminMainBalance)
                .where((0, drizzle_orm_1.and)(...whereConditions));
            return result.total;
        }
        catch (error) {
            console.error("Error getting balance by type:", error);
            throw error;
        }
    },
    // Get recent transactions
    async getRecentTransactions(limit = 10) {
        try {
            const data = await connection_1.db
                .select({
                id: adminMainBalance_1.adminMainBalance.id,
                amount: adminMainBalance_1.adminMainBalance.amount,
                type: adminMainBalance_1.adminMainBalance.type,
                status: adminMainBalance_1.adminMainBalance.status,
                promotionName: adminMainBalance_1.adminMainBalance.promotionName,
                notes: adminMainBalance_1.adminMainBalance.notes,
                createdAt: adminMainBalance_1.adminMainBalance.createdAt,
                currency: currency_1.currencies,
                createdByPlayerUser: users_1.users,
                createdByAdminUser: AdminUsers_1.adminUsers,
            })
                .from(adminMainBalance_1.adminMainBalance)
                .leftJoin(currency_1.currencies, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.currencyId, currency_1.currencies.id))
                .leftJoin(users_1.users, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.createdByPlayer, users_1.users.id))
                .leftJoin(AdminUsers_1.adminUsers, (0, drizzle_orm_1.eq)(adminMainBalance_1.adminMainBalance.createdByAdmin, AdminUsers_1.adminUsers.id))
                .orderBy((0, drizzle_orm_1.desc)(adminMainBalance_1.adminMainBalance.createdAt))
                .limit(limit);
            return data;
        }
        catch (error) {
            console.error("Error fetching recent transactions:", error);
            throw error;
        }
    },
};
