"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionModel = void 0;
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const mysql_core_1 = require("drizzle-orm/mysql-core");
class CommissionModel {
}
exports.CommissionModel = CommissionModel;
_a = CommissionModel;
// Create new commission
CommissionModel.createCommission = async (data) => {
    const [newCommission] = await connection_1.db.insert(schema_1.commission).values(data);
    return newCommission;
};
CommissionModel.getTotalCommissionWinLossByAffiliate = async (affiliateId) => {
    const [result] = await connection_1.db
        .select({
        totalWinCommission: (0, drizzle_orm_1.sql) `
        SUM(
          CASE 
            WHEN bet_results.bet_status = 'win' AND commission.status = 'approved' 
            THEN commission.commission_amount
            ELSE 0
          END
        )
      `,
        totalLossCommission: (0, drizzle_orm_1.sql) `
        SUM(
          CASE 
            WHEN bet_results.bet_status = 'loss' AND commission.status = 'approved' 
            THEN commission.commission_amount
            ELSE 0
          END
        )
      `,
    })
        .from(schema_1.commission)
        .leftJoin(schema_1.betResults, (0, drizzle_orm_1.eq)(schema_1.betResults.id, schema_1.commission.betResultId))
        .where((0, drizzle_orm_1.eq)(schema_1.commission.adminUserId, affiliateId));
    return {
        totalWinCommission: Number(result?.totalWinCommission || 0),
        totalLossCommission: Number(result?.totalLossCommission || 0),
    };
};
// Get commission by ID
CommissionModel.getCommissionById = async (id) => {
    const [result] = await connection_1.db
        .select()
        .from(schema_1.commission)
        .where((0, drizzle_orm_1.eq)(schema_1.commission.id, id));
    return result;
};
// Get all commissions with pagination
CommissionModel.getAllCommissions = async (filter) => {
    const offset = (Number(filter.page) - 1) * Number(filter.pageSize);
    let whereClause = [];
    if (filter?.search) {
        const kw = `%${filter?.search}%`;
        whereClause.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.users.username, kw), // ✅ search in users table
        (0, drizzle_orm_1.like)(schema_1.users.fullname, kw), (0, drizzle_orm_1.like)(schema_1.users.email, kw), (0, drizzle_orm_1.like)(schema_1.users.phone, kw), (0, drizzle_orm_1.like)(schema_1.adminUsers.username, kw), // ✅ search in admin_users table
        (0, drizzle_orm_1.like)(schema_1.adminUsers.fullname, kw), (0, drizzle_orm_1.like)(schema_1.adminUsers.email, kw), (0, drizzle_orm_1.like)(schema_1.adminUsers.phone, kw)));
    }
    if (filter?.adminUserId) {
        whereClause.push((0, drizzle_orm_1.eq)(schema_1.commission.adminUserId, Number(filter.adminUserId)));
    }
    if (filter?.playerId) {
        whereClause.push((0, drizzle_orm_1.eq)(schema_1.commission.playerId, Number(filter.playerId)));
    }
    const referredUser = (0, mysql_core_1.alias)(schema_1.adminUsers, "referredUser");
    // -----------------------------
    // Main query with pagination
    // -----------------------------
    const results = await connection_1.db
        .select({
        id: schema_1.commission.id,
        betResultId: schema_1.commission.betResultId,
        playerId: schema_1.commission.playerId,
        adminUserId: schema_1.commission.adminUserId,
        commissionAmount: schema_1.commission.commissionAmount,
        percentage: schema_1.commission.percentage,
        status: schema_1.commission.status,
        notes: schema_1.commission.notes,
        createdBy: schema_1.commission.createdBy,
        updatedBy: schema_1.commission.updatedBy,
        createdAt: schema_1.commission.createdAt,
        user: schema_1.users,
        adminUser: schema_1.adminUsers,
        betResults: schema_1.betResults,
        referredUser: referredUser,
    })
        .from(schema_1.commission)
        .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.commission.playerId))
        .leftJoin(schema_1.adminUsers, (0, drizzle_orm_1.eq)(schema_1.adminUsers.id, schema_1.commission.adminUserId))
        .leftJoin(referredUser, (0, drizzle_orm_1.eq)(referredUser.id, schema_1.users.referred_by_admin_user))
        .leftJoin(schema_1.betResults, (0, drizzle_orm_1.eq)(schema_1.betResults.id, schema_1.commission.betResultId))
        .where(whereClause.length ? (0, drizzle_orm_1.and)(...whereClause) : undefined)
        .orderBy((0, drizzle_orm_1.desc)(schema_1.commission.createdAt))
        .limit(Number(filter.pageSize))
        .offset(offset);
    // -----------------------------
    // Total count query (with joins)
    // -----------------------------
    const totalCount = await connection_1.db
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(schema_1.commission)
        .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.commission.playerId)) // ✅ add join
        .leftJoin(schema_1.adminUsers, (0, drizzle_orm_1.eq)(schema_1.adminUsers.id, schema_1.commission.adminUserId)) // ✅ add join
        .where(whereClause.length ? (0, drizzle_orm_1.and)(...whereClause) : undefined);
    return {
        data: results,
        pagination: {
            page: filter.page,
            pageSize: filter.pageSize,
            total: totalCount[0]?.count || 0,
            totalPages: Math.ceil((totalCount[0]?.count || 0) / Number(filter.pageSize)),
        },
    };
};
// Get commissions by admin user ID
CommissionModel.getCommissionsByAdminUser = async (adminUserId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const results = await connection_1.db
        .select()
        .from(schema_1.commission)
        .where((0, drizzle_orm_1.eq)(schema_1.commission.adminUserId, adminUserId))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.commission.createdAt))
        .limit(limit)
        .offset(offset);
    const totalCount = await connection_1.db
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(schema_1.commission)
        .where((0, drizzle_orm_1.eq)(schema_1.commission.adminUserId, adminUserId));
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
CommissionModel.getCommissionsByPlayer = async (playerId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const results = await connection_1.db
        .select()
        .from(schema_1.commission)
        .where((0, drizzle_orm_1.eq)(schema_1.commission.playerId, playerId))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.commission.createdAt))
        .limit(limit)
        .offset(offset);
    const totalCount = await connection_1.db
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(schema_1.commission)
        .where((0, drizzle_orm_1.eq)(schema_1.commission.playerId, playerId));
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
CommissionModel.getCommissionsByBetResult = async (betResultId) => {
    const results = await connection_1.db
        .select()
        .from(schema_1.commission)
        .where((0, drizzle_orm_1.eq)(schema_1.commission.betResultId, betResultId))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.commission.createdAt));
    return results;
};
// Get commissions by status
CommissionModel.getCommissionsByStatus = async (status, page = 1, limit = 10) => {
    const offset = (page - 1) * limit;
    const results = await connection_1.db
        .select()
        .from(schema_1.commission)
        .where((0, drizzle_orm_1.eq)(schema_1.commission.status, status))
        .orderBy((0, drizzle_orm_1.desc)(schema_1.commission.createdAt))
        .limit(limit)
        .offset(offset);
    const totalCount = await connection_1.db
        .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
        .from(schema_1.commission)
        .where((0, drizzle_orm_1.eq)(schema_1.commission.status, status));
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
CommissionModel.updateCommission = async (id, data) => {
    const [updatedCommission] = await connection_1.db
        .update(schema_1.commission)
        .set({ ...data, updatedAt: new Date() })
        .where((0, drizzle_orm_1.eq)(schema_1.commission.id, id));
    return updatedCommission;
};
// Delete commission
CommissionModel.deleteCommission = async (id) => {
    const [deletedCommission] = await connection_1.db
        .delete(schema_1.commission)
        .where((0, drizzle_orm_1.eq)(schema_1.commission.id, id));
    return deletedCommission;
};
// Get commission statistics
CommissionModel.getCommissionStats = async () => {
    const stats = await connection_1.db
        .select({
        totalCommissions: (0, drizzle_orm_1.sql) `count(*)`,
        totalAmount: (0, drizzle_orm_1.sql) `sum(commission_amount)`,
        pendingCount: (0, drizzle_orm_1.sql) `sum(case when status = 'pending' then 1 else 0 end)`,
        approvedCount: (0, drizzle_orm_1.sql) `sum(case when status = 'approved' then 1 else 0 end)`,
        paidCount: (0, drizzle_orm_1.sql) `sum(case when status = 'paid' then 1 else 0 end)`,
        rejectedCount: (0, drizzle_orm_1.sql) `sum(case when status = 'rejected' then 1 else 0 end)`,
    })
        .from(schema_1.commission);
    return stats[0];
};
// Get commission statistics by admin user
CommissionModel.getCommissionStatsByAdminUser = async (adminUserId) => {
    const stats = await connection_1.db
        .select({
        totalCommissions: (0, drizzle_orm_1.sql) `count(*)`,
        totalAmount: (0, drizzle_orm_1.sql) `sum(commission_amount)`,
        pendingCount: (0, drizzle_orm_1.sql) `sum(case when status = 'pending' then 1 else 0 end)`,
        approvedCount: (0, drizzle_orm_1.sql) `sum(case when status = 'approved' then 1 else 0 end)`,
        paidCount: (0, drizzle_orm_1.sql) `sum(case when status = 'paid' then 1 else 0 end)`,
        rejectedCount: (0, drizzle_orm_1.sql) `sum(case when status = 'rejected' then 1 else 0 end)`,
    })
        .from(schema_1.commission)
        .where((0, drizzle_orm_1.eq)(schema_1.commission.adminUserId, adminUserId));
    return stats[0];
};
