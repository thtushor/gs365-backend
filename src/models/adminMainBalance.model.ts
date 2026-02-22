import {
  eq,
  and,
  sql,
  desc,
  asc,
  count,
  sum,
  gte,
  lte,
  like,
  or,
} from "drizzle-orm";
import { db } from "../db/connection";
import { adminMainBalance } from "../db/schema/adminMainBalance";
import { users } from "../db/schema/users";
import { adminUsers } from "../db/schema/AdminUsers";
import { promotions } from "../db/schema/promotions";
import { transactions } from "../db/schema/transactions";
import { currencies } from "../db/schema/currency";

export interface AdminMainBalanceData {
  amount: number;
  type:
  | "admin_deposit"
  | "player_deposit"
  | "promotion"
  | "spin_bonus"
  | "player_withdraw"
  | "admin_withdraw";
  status?: "approved" | "pending" | "rejected";
  promotionId?: number;
  transactionId?: number;
  promotionName?: string;
  currencyId?: number;
  createdByPlayer?: number;
  createdByAdmin?: number;
  notes?: string;
}

export interface AdminMainBalanceFilters {
  type?: string;
  status?: string;
  promotionId?: number;
  transactionId?: number;
  createdByPlayer?: number;
  createdByAdmin?: number;
  currencyId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface AdminMainBalanceStats {
  totalAdminDeposit: number;
  totalPlayerDeposit: number;
  totalPromotion: number;
  totalPlayerWithdraw: number;
  totalAdminWithdraw: number;
  currentMainBalance: number;
  totalRecords: number;
  totalSpinBonus: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: AdminMainBalanceStats;
}

export const AdminMainBalanceModel = {
  // Create a new admin main balance record
  async create(data: AdminMainBalanceData, tx?: any): Promise<number> {
    try {
      const [result] = await (tx ?? db).insert(adminMainBalance).values({
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
    } catch (error) {
      console.error("Error creating admin main balance record:", error);
      throw error;
    }
  },

  // Get admin main balance by ID
  async getById(id: number): Promise<any | null> {
    try {
      const [result] = await db
        .select({
          id: adminMainBalance.id,
          amount: adminMainBalance.amount,
          type: adminMainBalance.type,
          status: adminMainBalance.status,
          promotionId: adminMainBalance.promotionId,
          transactionId: adminMainBalance.transactionId,
          promotionName: adminMainBalance.promotionName,
          currencyId: adminMainBalance.currencyId,
          createdByPlayer: adminMainBalance.createdByPlayer,
          createdByAdmin: adminMainBalance.createdByAdmin,
          notes: adminMainBalance.notes,
          createdAt: adminMainBalance.createdAt,
          updatedAt: adminMainBalance.updatedAt,
          // Joined data
          currency: currencies,
          promotion: promotions,
          transaction: transactions,
          createdByPlayerUser: users,
          createdByAdminUser: adminUsers,
        })
        .from(adminMainBalance)
        .leftJoin(currencies, eq(adminMainBalance.currencyId, currencies.id))
        .leftJoin(promotions, eq(adminMainBalance.promotionId, promotions.id))
        .leftJoin(
          transactions,
          eq(adminMainBalance.transactionId, transactions.id),
        )
        .leftJoin(users, eq(adminMainBalance.createdByPlayer, users.id))
        .leftJoin(
          adminUsers,
          eq(adminMainBalance.createdByAdmin, adminUsers.id),
        )
        .where(eq(adminMainBalance.id, id))
        .limit(1);

      return result || null;
    } catch (error) {
      console.error("Error fetching admin main balance by ID:", error);
      throw error;
    }
  },

  // Update admin main balance record
  async update(
    id: number,
    data: Partial<AdminMainBalanceData>,
  ): Promise<boolean> {
    try {
      const updateData: any = {};

      if (data.amount !== undefined) updateData.amount = data.amount.toString();
      if (data.type !== undefined) updateData.type = data.type;
      if (data.status !== undefined) updateData.status = data.status;
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
      if (data.notes !== undefined) updateData.notes = data.notes;

      await db
        .update(adminMainBalance)
        .set(updateData)
        .where(eq(adminMainBalance.id, id));

      return true;
    } catch (error) {
      console.error("Error updating admin main balance:", error);
      throw error;
    }
  },

  // Update admin main balance records by transaction ID
  async updateByTransactionId(
    transactionId: number,
    data: Partial<AdminMainBalanceData>,
    tx?: any,
  ): Promise<boolean> {
    try {
      const updateData: any = {};

      if (data.amount !== undefined) updateData.amount = data.amount.toString();
      if (data.type !== undefined) updateData.type = data.type;
      if (data.status !== undefined) updateData.status = data.status;
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
      if (data.notes !== undefined) updateData.notes = data.notes;

      await (tx ?? db)
        .update(adminMainBalance)
        .set(updateData)
        .where(eq(adminMainBalance.transactionId, transactionId));

      return true;
    } catch (error) {
      console.error(
        "Error updating admin main balance by transaction ID:",
        error,
      );
      throw error;
    }
  },

  // Delete admin main balance record
  async delete(id: number): Promise<boolean> {
    try {
      await db.delete(adminMainBalance).where(eq(adminMainBalance.id, id));

      return true;
    } catch (error) {
      console.error("Error deleting admin main balance:", error);
      throw error;
    }
  },

  // Get all admin main balance records with filters and pagination
  async getAll(
    filters: AdminMainBalanceFilters = {},
    pagination: PaginationParams = {},
  ): Promise<PaginatedResult<any>> {
    try {
      const {
        page = 1,
        pageSize = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = pagination;

      const offset = (page - 1) * pageSize;

      // Build where conditions
      const whereConditions = [];

      if (filters.type) {
        // If caller specifies type → use it directly
        whereConditions.push(eq(adminMainBalance.type, filters.type as any));
      } else {
        // Default case → only admin_deposit
        whereConditions.push(eq(adminMainBalance.type, "admin_deposit"));
      }
      if (filters.status) {
        whereConditions.push(
          eq(adminMainBalance.status, filters.status as any),
        );
      }
      if (filters.promotionId) {
        whereConditions.push(
          eq(adminMainBalance.promotionId, filters.promotionId),
        );
      }
      if (filters.transactionId) {
        whereConditions.push(
          eq(adminMainBalance.transactionId, filters.transactionId),
        );
      }
      if (filters.createdByPlayer) {
        whereConditions.push(
          eq(adminMainBalance.createdByPlayer, filters.createdByPlayer),
        );
      }
      if (filters.createdByAdmin) {
        whereConditions.push(
          eq(adminMainBalance.createdByAdmin, filters.createdByAdmin),
        );
      }
      if (filters.currencyId) {
        whereConditions.push(
          eq(adminMainBalance.currencyId, filters.currencyId),
        );
      }
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        whereConditions.push(gte(adminMainBalance.createdAt, start));
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        whereConditions.push(lte(adminMainBalance.createdAt, end));
      }
      if (filters.search) {
        whereConditions.push(
          or(
            like(adminMainBalance.promotionName, `%${filters.search}%`),
            like(adminMainBalance.notes, `%${filters.search}%`),
          ),
        );
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total count
      const [totalResult] = await db
        .select({ count: count() })
        .from(adminMainBalance)
        .where(whereClause);

      const total = totalResult.count;

      // Get paginated data
      const orderBy =
        sortOrder === "asc"
          ? asc(adminMainBalance.createdAt)
          : desc(adminMainBalance.createdAt);

      const data = await db
        .select({
          id: adminMainBalance.id,
          amount: adminMainBalance.amount,
          type: adminMainBalance.type,
          status: adminMainBalance.status,
          promotionId: adminMainBalance.promotionId,
          transactionId: adminMainBalance.transactionId,
          promotionName: adminMainBalance.promotionName,
          currencyId: adminMainBalance.currencyId,
          createdByPlayer: adminMainBalance.createdByPlayer,
          createdByAdmin: adminMainBalance.createdByAdmin,
          notes: adminMainBalance.notes,
          createdAt: adminMainBalance.createdAt,
          updatedAt: adminMainBalance.updatedAt,
          // Joined data
          currency: currencies,
          promotion: promotions,
          transaction: transactions,
          createdByPlayerUser: users,
          createdByAdminUser: adminUsers,
        })
        .from(adminMainBalance)
        .leftJoin(currencies, eq(adminMainBalance.currencyId, currencies.id))
        .leftJoin(promotions, eq(adminMainBalance.promotionId, promotions.id))
        .leftJoin(
          transactions,
          eq(adminMainBalance.transactionId, transactions.id),
        )
        .leftJoin(users, eq(adminMainBalance.createdByPlayer, users.id))
        .leftJoin(
          adminUsers,
          eq(adminMainBalance.createdByAdmin, adminUsers.id),
        )
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
    } catch (error) {
      console.error("Error fetching admin main balance records:", error);
      throw error;
    }
  },

  // Calculate current main balance and stats
  async calculateStats(
    filters: AdminMainBalanceFilters = {},
  ): Promise<AdminMainBalanceStats> {
    try {
      // Build where conditions for stats
      const whereConditions = [];

      if (filters.currencyId) {
        whereConditions.push(
          eq(adminMainBalance.currencyId, filters.currencyId),
        );
      }
      if (filters.status) {
        whereConditions.push(
          eq(adminMainBalance.status, filters.status as any),
        );
      }
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        whereConditions.push(gte(adminMainBalance.createdAt, start));
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        whereConditions.push(lte(adminMainBalance.createdAt, end));
      }

      const whereClause =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      const [statsResult] = await db
        .select({
          totalAdminDeposit: sql<number>`
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance.type} = 'admin_deposit' 
            THEN CAST(${adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
          totalPlayerDeposit: sql<number>`
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance.type} = 'player_deposit' 
              AND ${adminMainBalance.status} = 'approved'
            THEN CAST(${adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
          totalSpinBonus: sql<number>`
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance.type} = 'spin_bonus' 
              AND ${adminMainBalance.status} = 'approved'
            THEN CAST(${adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
          totalPromotion: sql<number>`
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance.type} = 'promotion' 
              AND ${adminMainBalance.status} = 'approved'
            THEN CAST(${adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
          totalPlayerWithdraw: sql<number>`
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance.type} = 'player_withdraw' 
              AND ${adminMainBalance.status} = 'approved'
            THEN CAST(${adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
          totalAdminWithdraw: sql<number>`
      COALESCE(
        SUM(
          CASE 
            WHEN ${adminMainBalance.type} = 'admin_withdraw' 
              AND ${adminMainBalance.status} = 'approved'
            THEN CAST(${adminMainBalance.amount} AS DECIMAL(18,2)) 
          END
        ), 0
      )
    `,
          totalRecords: count(),
        })
        .from(adminMainBalance)
        .where(whereClause);

      const {
        totalAdminDeposit,
        totalPlayerDeposit,
        totalPromotion,
        totalPlayerWithdraw,
        totalAdminWithdraw,
        totalRecords,
        totalSpinBonus,
      } = statsResult;

      // Calculate current main balance
      // current main balance = total admin deposit - total player deposit - total promotion + total player withdraw + total admin withdraw
      const currentMainBalance =
        Number(totalAdminDeposit) +
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
    } catch (error) {
      console.error("Error calculating admin main balance stats:", error);
      throw error;
    }
  },

  // Get balance by type
  async getBalanceByType(
    type: string,
    filters: AdminMainBalanceFilters = {},
  ): Promise<number> {
    try {
      const whereConditions = [eq(adminMainBalance.type, type as any)];

      if (filters.currencyId) {
        whereConditions.push(
          eq(adminMainBalance.currencyId, filters.currencyId),
        );
      }
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        start.setHours(0, 0, 0, 0);
        whereConditions.push(gte(adminMainBalance.createdAt, start));
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        end.setHours(23, 59, 59, 999);
        whereConditions.push(lte(adminMainBalance.createdAt, end));
      }

      const [result] = await db
        .select({
          total: sql<number>`COALESCE(SUM(CAST(${adminMainBalance.amount} AS DECIMAL(20,2))), 0)`,
        })
        .from(adminMainBalance)
        .where(and(...whereConditions));

      return result.total;
    } catch (error) {
      console.error("Error getting balance by type:", error);
      throw error;
    }
  },

  // Get recent transactions
  async getRecentTransactions(limit: number = 10): Promise<any[]> {
    try {
      const data = await db
        .select({
          id: adminMainBalance.id,
          amount: adminMainBalance.amount,
          type: adminMainBalance.type,
          status: adminMainBalance.status,
          promotionName: adminMainBalance.promotionName,
          notes: adminMainBalance.notes,
          createdAt: adminMainBalance.createdAt,
          currency: currencies,
          createdByPlayerUser: users,
          createdByAdminUser: adminUsers,
        })
        .from(adminMainBalance)
        .leftJoin(currencies, eq(adminMainBalance.currencyId, currencies.id))
        .leftJoin(users, eq(adminMainBalance.createdByPlayer, users.id))
        .leftJoin(
          adminUsers,
          eq(adminMainBalance.createdByAdmin, adminUsers.id),
        )
        .orderBy(desc(adminMainBalance.createdAt))
        .limit(limit);

      return data;
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      throw error;
    }
  },
};
