import { db } from "../db/connection";
import { adminUsers, betResults, commission, users } from "../db/schema";
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

  static getTotalCommissionWinLossByAffiliate = async (affiliateId: number) => {
    const [result] = await db
      .select({
        totalWinCommission: sql<number>`
        SUM(
          CASE 
            WHEN bet_results.bet_status = 'win' AND commission.status = 'approved' 
            THEN commission.commission_amount
            ELSE 0
          END
        )
      `,
        totalLossCommission: sql<number>`
        SUM(
          CASE 
            WHEN bet_results.bet_status = 'loss' AND commission.status = 'approved' 
            THEN commission.commission_amount
            ELSE 0
          END
        )
      `,
      })
      .from(commission)
      .leftJoin(betResults, eq(betResults.id, commission.betResultId))
      .where(eq(commission.adminUserId, affiliateId));

    return {
      totalWinCommission: Number(result?.totalWinCommission || 0),
      totalLossCommission: Number(result?.totalLossCommission || 0),
    };
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
  static getAllCommissions = async (filter: {
    search?: String;
    playerId?: Number;
    adminUserId?: Number;
    page: Number;
    pageSize: Number;
  }) => {
    const offset = (Number(filter.page) - 1) * Number(filter.pageSize);

    let whereClause = [];
    if (filter?.search) {
      whereClause.push(like(adminUsers?.username, `%${filter?.search}%`));
    }

    if (filter?.adminUserId) {
      whereClause.push(eq(commission.adminUserId, Number(filter?.adminUserId)));
    }

    if (filter?.playerId) {
      whereClause.push(eq(commission.playerId, Number(filter?.playerId)));
    }

    const results = await db
      .select({
        id: commission.id,
        betResultId: commission?.betResultId,
        playerId: commission?.playerId,
        adminUserId: commission?.adminUserId,
        commissionAmount: commission?.commissionAmount,
        percentage: commission?.percentage,
        status: commission?.status,
        notes: commission?.notes,
        createdBy: commission?.createdBy,
        updatedBy: commission?.updatedBy,
        createdAt: commission?.createdAt,
        user: users,
        adminUser: adminUsers,
        betResults: betResults,
      })
      .from(commission)
      .leftJoin(users, eq(users.id, commission?.playerId))
      .leftJoin(adminUsers, eq(adminUsers.id, commission?.adminUserId))
      .leftJoin(betResults, eq(betResults?.id, commission?.betResultId))
      .where(and(...whereClause))
      .orderBy(desc(commission.createdAt))
      .limit(Number(filter?.pageSize))
      .offset(offset);

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(commission)
      .where(and(...whereClause));

    return {
      data: results,
      pagination: {
        page: filter?.page,
        pageSize: filter?.pageSize,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil(
          (totalCount[0]?.count || 0) / Number(filter?.pageSize)
        ),
      },
    };
  };

  // Get commissions by admin user ID
  static getCommissionsByAdminUser = async (
    adminUserId: number,
    page: number = 1,
    limit: number = 10
  ) => {
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
  static getCommissionsByPlayer = async (
    playerId: number,
    page: number = 1,
    limit: number = 10
  ) => {
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
  static getCommissionsByStatus = async (
    status: string,
    page: number = 1,
    limit: number = 10
  ) => {
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
