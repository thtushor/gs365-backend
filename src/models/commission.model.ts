import { db } from "../db/connection";
import { commission } from "../db/schema";
import { eq, and, desc, asc, like, sql } from "drizzle-orm";
import { asyncHandler } from "../utils/asyncHandler";

export interface CommissionData {
  betResultId: number;
  playerId: number;
  adminUserId: number;
  commissionAmount: string;
  percentage: string;
  status?: "pending" | "approved" | "rejected" | "paid";
  notes?: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface CommissionUpdateData {
  commissionAmount?: string;
  percentage?: string;
  status?: "pending" | "approved" | "rejected" | "paid";
  notes?: string;
  updatedBy?: string;
}

export class CommissionModel {
  // Create new commission
  static createCommission = async (data: CommissionData) => {
    const [newCommission] = await db.insert(commission).values(data);
    return newCommission;
  };
  

  // Get commission by ID
  static getCommissionById = async (id: number) => {
    const [result] = await db
      .select()
      .from(commission)
      .where(eq(commission.id, id));
    return result;
  };

  // Get all commissions with pagination
  static getAllCommissions = async (page: number = 1, limit: number = 10, search?: string) => {
    const offset = (page - 1) * limit;
    
    let whereClause = undefined;
    if (search) {
      whereClause = like(commission.notes, `%${search}%`);
    }

    const results = await db
      .select()
      .from(commission)
      .where(whereClause)
      .orderBy(desc(commission.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(commission)
      .where(whereClause);

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    };
  };

  // Get commissions by admin user ID
  static getCommissionsByAdminUser = async (adminUserId: number, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;

    const results = await db
      .select()
      .from(commission)
      .where(eq(commission.adminUserId, adminUserId))
      .orderBy(desc(commission.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(commission)
      .where(eq(commission.adminUserId, adminUserId));

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    };
  };

  // Get commissions by player ID
  static getCommissionsByPlayer = async (playerId: number, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;

    const results = await db
      .select()
      .from(commission)
      .where(eq(commission.playerId, playerId))
      .orderBy(desc(commission.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(commission)
      .where(eq(commission.playerId, playerId));

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    };
  };

  // Get commissions by bet result ID
  static getCommissionsByBetResult = async (betResultId: number) => {
    const results = await db
      .select()
      .from(commission)
      .where(eq(commission.betResultId, betResultId))
      .orderBy(desc(commission.createdAt));
    return results;
  };

  // Get commissions by status
  static getCommissionsByStatus = async (status: string, page: number = 1, limit: number = 10) => {
    const offset = (page - 1) * limit;

    const results = await db
      .select()
      .from(commission)
      .where(eq(commission.status, status as any))
      .orderBy(desc(commission.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(commission)
      .where(eq(commission.status, status as any));

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit),
      },
    };
  };

  // Update commission
  static updateCommission = async (id: number, data: CommissionUpdateData) => {
    const [updatedCommission] = await db
      .update(commission)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(commission.id, id));
    return updatedCommission;
  };

  // Delete commission
  static deleteCommission = async (id: number) => {
    const [deletedCommission] = await db
      .delete(commission)
      .where(eq(commission.id, id));
    return deletedCommission;
  };

  // Get commission statistics
  static getCommissionStats = async () => {
    const stats = await db
      .select({
        totalCommissions: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(commission_amount)`,
        pendingCount: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
        approvedCount: sql<number>`sum(case when status = 'approved' then 1 else 0 end)`,
        paidCount: sql<number>`sum(case when status = 'paid' then 1 else 0 end)`,
        rejectedCount: sql<number>`sum(case when status = 'rejected' then 1 else 0 end)`,
      })
      .from(commission);
    
    return stats[0];
  };

  // Get commission statistics by admin user
  static getCommissionStatsByAdminUser = async (adminUserId: number) => {
    const stats = await db
      .select({
        totalCommissions: sql<number>`count(*)`,
        totalAmount: sql<number>`sum(commission_amount)`,
        pendingCount: sql<number>`sum(case when status = 'pending' then 1 else 0 end)`,
        approvedCount: sql<number>`sum(case when status = 'approved' then 1 else 0 end)`,
        paidCount: sql<number>`sum(case when status = 'paid' then 1 else 0 end)`,
        rejectedCount: sql<number>`sum(case when status = 'rejected' then 1 else 0 end)`,
      })
      .from(commission)
      .where(eq(commission.adminUserId, adminUserId));
    
    return stats[0];
  };
}
