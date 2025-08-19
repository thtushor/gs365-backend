import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, or, and, like, sql } from "drizzle-orm";
import { users } from "../db/schema/users";
import { currencies } from "../db/schema/currency";
import { adminUsers } from "../db/schema/AdminUsers";
import { transactions } from "../db/schema/transactions";
import bcrypt from "bcryptjs";

import { db } from "../db/connection";
import { BalanceModel } from "./balance.model";

export const findUserByUsernameOrEmail = async (usernameOrEmail: string) => {
  const [user] = await db
    .select()
    .from(users)
    // .leftJoin(currency, eq(currency.id, users.currency_id))
    .where(
      or(
        eq(users.username, usernameOrEmail),
        eq(users.email, usernameOrEmail),
        eq(users.phone, usernameOrEmail)
      )
    );
  return user;
};

export const createUser = async (data: {
  username: string;
  fullname: string;
  phone: string;
  email: string;
  password: string;
  currency_id: number;
  refer_code?: string;
  isAgreeWithTerms: boolean;
  createdBy?: number;
  referred_by?: number;
  referred_by_admin_user?: number;
  status: "active"|"inactive";
}) => {
  // const hashedPassword = await bcrypt.hash(data.password, 10);
  const [user] = await db.insert(users).values({
    ...data,
    created_by: data?.createdBy,
    referred_by: data?.referred_by,
    referred_by_admin_user: data?.referred_by_admin_user,
    // password: hashedPassword,
  });

  return user;
};

export const findUserByReferCode = async (refer_code: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.refer_code, refer_code));
  return user;
};

export const getUserById = async (id: number) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));
  return user;
};

export const getUserDetailsById = async (id: number): Promise<UserWithDetails | null> => {
  try {
    const [user] = await db
      .select({
        // User basic info
        id: users.id,
        fullname: users.fullname,
        username: users.username,
        email: users.email,
        phone: users.phone,
        isVerified: users.isVerified,
        status: users.status,
        created_at: users.created_at,
        device_type: users.device_type,
        ip_address: users.ip_address,
        // Currency info
        currencyCode: currencies.code,
        currencyName: currencies.name,
        // Referrer info (could be affiliate or agent)
        referrerName: adminUsers.fullname,
        referrerRole: adminUsers.role,
        // User referrer info (from referred_by column)
        userReferrerName: sql<string>`user_referrer.fullname`,
        userReferrerUsername: sql<string>`user_referrer.username`,
      })
      .from(users)
      .leftJoin(currencies, eq(users.currency_id, currencies.id))
      .leftJoin(adminUsers, eq(users.referred_by_admin_user, adminUsers.id))
      .leftJoin(sql`${users} as user_referrer`, eq(users.referred_by, sql`user_referrer.id`))
      .where(eq(users.id, id));

    if (!user) return null;

    // Get balance information using BalanceModel
    const balance = await BalanceModel.calculatePlayerBalance(user.id);

    const totalDeposits = Number(balance.totalDeposits);
    const totalWithdrawals = Number(balance.totalWithdrawals);
    const totalWins = Number(balance.totalWins);
    const totalLosses = Number(balance.totalLosses);
    const pendingDeposits = Number(balance.pendingDeposits);
    const pendingWithdrawals = Number(balance.pendingWithdrawals);

    // Calculate current balance: deposits + wins - withdrawals - losses
    const totalBalance = totalDeposits + totalWins - totalWithdrawals - totalLosses;

    // Determine affiliate and agent info based on referrer role
    let affiliateName: string | null = null;
    let affiliateRole: string | null = null;
    let agentName: string | null = null;
    let agentRole: string | null = null;

    if (user.referrerRole) {
      if (user.referrerRole === 'superAffiliate' || user.referrerRole === 'affiliate') {
        affiliateName = user.referrerName;
        affiliateRole = user.referrerRole;
      } else if (user.referrerRole === 'superAgent' || user.referrerRole === 'agent') {
        agentName = user.referrerName;
        agentRole = user.referrerRole;
      }
    }

    return {
      ...user,
      affiliateName,
      affiliateRole,
      agentName,
      agentRole,
      totalBalance,
      totalDeposits,
      totalWithdrawals,
      totalWins,
      totalLosses,
      pendingDeposits,
      pendingWithdrawals,
    };
  } catch (error) {
    console.error("Error getting user details:", error);
    throw error;
  }
};

export const getUsersByReferrerType = async (referrerType: 'affiliate' | 'agent', page = 1, pageSize = 10) => {
  try {
    const roleFilter = referrerType === 'affiliate' 
      ? sql`${adminUsers.role} IN ('superAffiliate', 'affiliate')`
      : sql`${adminUsers.role} IN ('agent', 'superAgent')`;

    const whereClause = and(
      sql`${users.referred_by_admin_user} IS NOT NULL`,
      roleFilter
    );

    // Get total count
    const total = await db
      .select({ count: sql`COUNT(*)` })
      .from(users)
      .leftJoin(adminUsers, eq(users.referred_by_admin_user, adminUsers.id))
      .where(whereClause)
      .then((rows) => Number(rows[0]?.count || 0));

    // Get paginated data
    const data = await db
      .select({
        id: users.id,
        fullname: users.fullname,
        username: users.username,
        email: users.email,
        phone: users.phone,
        status: users.status,
        created_at: users.created_at,
        referrerName: adminUsers.fullname,
        referrerRole: adminUsers.role,
      })
      .from(users)
      .leftJoin(adminUsers, eq(users.referred_by_admin_user, adminUsers.id))
      .where(whereClause)
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    const totalPages = Math.ceil(total / pageSize);
    
    return {
      total,
      data,
      pagination: {
        page,
        pageSize,
        totalPages,
        total,
      },
    };
  } catch (error) {
    console.error(`Error getting users by ${referrerType}:`, error);
    throw error;
  }
};

export interface UserFilters {
  playerId?: number;
  phone?: string;
  status?: string;
  keyword?: string;
  createdBy?: number;
  page?: number;
  pageSize?: number;
  referred_by?: number;
  referred_by_admin_user?: number;
  userType?: 'all' | 'affiliate' | 'agent' | 'player';
  currencyId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserWithDetails {
  id: number;
  fullname: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  isVerified: boolean | null;
  status: string | null;
  created_at: Date | null;
  device_type: string | null;
  ip_address: string | null;
  // Currency info
  currencyCode: string | null;
  currencyName: string | null;
  // Referrer info
  referrerName: string | null;
  referrerRole: string | null;
  // User referrer info (from referred_by column)
  userReferrerName: string | null;
  userReferrerUsername: string | null;
  // Affiliate/Agent info (derived from referrer)
  affiliateName: string | null;
  affiliateRole: string | null;
  agentName: string | null;
  agentRole: string | null;
  // Balance info
  totalBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalWins: number;
  totalLosses: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
}

export const getUsersWithFilters = async (filters: UserFilters) => {
  const {
    playerId,
    phone,
    status,
    keyword,
    page = 1,
    pageSize = 10,
    createdBy,
    referred_by,
    referred_by_admin_user,
    userType = 'all',
    currencyId,
    dateFrom,
    dateTo,
  } = filters;

  const whereClauses = [];

  if (playerId) whereClauses.push(eq(users.id, playerId));
  if (phone) whereClauses.push(eq(users.phone, phone));
  if (status) whereClauses.push(eq(users.status as any, status));
  // if (createdBy) whereClauses.push(eq(users.created_by, createdBy));
  if (referred_by_admin_user)
    whereClauses.push(eq(users.referred_by_admin_user, referred_by_admin_user));

  if (referred_by) {
    whereClauses.push(eq(users.referred_by, referred_by));
  }

  if (currencyId) {
    whereClauses.push(eq(users.currency_id, currencyId));
  }

  if (dateFrom) {
    whereClauses.push(sql`DATE(${users.created_at}) >= ${dateFrom}`);
  }

  if (dateTo) {
    whereClauses.push(sql`DATE(${users.created_at}) <= ${dateTo}`);
  }

  if (keyword) {
    const kw = `%${keyword}%`;
    whereClauses.push(
      or(
        like(users.username, `%${kw}%`),
        like(users.fullname, `%${kw}%`),
        like(users.email, `%${kw}%`),
        like(users.phone, `%${kw}%`)
      )
    );
  }

  // Filter by user type (affiliate, agent, or player)
  if (filters.userType && filters.userType !== 'all') {
    if (filters.userType === 'affiliate') {
      // Users referred by superAffiliate or affiliate
      whereClauses.push(sql`${users.referred_by_admin_user} IS NOT NULL`);
      whereClauses.push(sql`${adminUsers.role} IN ('superAffiliate', 'affiliate')`);
    } else if (filters.userType === 'agent') {
      // Users referred by agent or superAgent
      whereClauses.push(sql`${users.referred_by_admin_user} IS NOT NULL`);
      whereClauses.push(sql`${adminUsers.role} IN ('agent', 'superAgent')`);
    } else if (filters.userType === 'player') {
      // Users with no referrer (direct players)
      whereClauses.push(sql`${users.referred_by_admin_user} IS NULL`);
    }
  }

  const where = whereClauses.length ? and(...whereClauses) : undefined;

  // Get total count
  const total = await db
    .select({ count: sql`COUNT(*)` })
    .from(users)
    .where(where)
    .then((rows) => Number(rows[0]?.count || 0));

  // Get paginated data with all required fields
  const data = await db
    .select({
      // User basic info
      id: users.id,
      fullname: users.fullname,
      username: users.username,
      email: users.email,
      phone: users.phone,
      isVerified: users.isVerified,
      status: users.status,
      created_at: users.created_at,
      device_type: users.device_type,
      ip_address: users.ip_address,
      // Currency info
      currencyCode: currencies.code,
      currencyName: currencies.name,
      // Referrer info (could be affiliate or agent)
      referrerName: adminUsers.fullname,
      referrerRole: adminUsers.role,
      // User referrer info (from referred_by column)
      userReferrerName: sql<string>`user_referrer.fullname`,
      userReferrerUsername: sql<string>`user_referrer.username`,
    })
    .from(users)
    .leftJoin(currencies, eq(users.currency_id, currencies.id))
    .leftJoin(adminUsers, eq(users.referred_by_admin_user, adminUsers.id))
    .leftJoin(sql`${users} as user_referrer`, eq(users.referred_by, sql`user_referrer.id`))
    .where(where)
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // Get all user IDs for batch balance calculation
  const userIds = data.map(user => user.id);
  
  // Get balance information for all users using BalanceModel
  let balanceData: any[] = [];
  if (userIds.length > 0) {
    // Get balances for all users
    const balancePromises = userIds.map(userId => 
      BalanceModel.calculatePlayerBalance(userId)
    );
    
    const balanceResults = await Promise.all(balancePromises);
    
    // Transform the balance data to match the expected structure
    balanceData = balanceResults.map((balance, index) => ({
      user_id: userIds[index],
      totalDeposits: balance.totalDeposits,
      totalWithdrawals: balance.totalWithdrawals,
      totalWins: balance.totalWins,
      totalLosses: balance.totalLosses,
      pendingDeposits: balance.pendingDeposits,
      pendingWithdrawals: balance.pendingWithdrawals,
    }));
  }

  // Create a map for quick balance lookup
  const balanceMap = new Map(
    balanceData.map(balance => [balance.user_id, balance])
  );

  // Calculate balance and transaction data for each user
  const usersWithDetails: UserWithDetails[] = data.map((user) => {
    // Get balance information from the map
    const balance = balanceMap.get(user.id) || {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalWins: 0,
      totalLosses: 0,
      pendingDeposits: 0,
      pendingWithdrawals: 0,
    };

    const totalDeposits = Number(balance.totalDeposits);
    const totalWithdrawals = Number(balance.totalWithdrawals);
    const totalWins = Number(balance.totalWins);
    const totalLosses = Number(balance.totalLosses);
    const pendingDeposits = Number(balance.pendingDeposits);
    const pendingWithdrawals = Number(balance.pendingWithdrawals);

    // Calculate current balance: deposits + wins - withdrawals - losses
    const totalBalance = totalDeposits + totalWins - totalWithdrawals - totalLosses;

    // Determine affiliate and agent info based on referrer role
    let affiliateName: string | null = null;
    let affiliateRole: string | null = null;
    let agentName: string | null = null;
    let agentRole: string | null = null;

    if (user.referrerRole) {
      if (user.referrerRole === 'superAffiliate' || user.referrerRole === 'affiliate') {
        affiliateName = user.referrerName;
        affiliateRole = user.referrerRole;
      } else if (user.referrerRole === 'superAgent' || user.referrerRole === 'agent') {
        agentName = user.referrerName;
        agentRole = user.referrerRole;
      }
    }

    return {
      ...user,
      affiliateName,
      affiliateRole,
      agentName,
      agentRole,
      totalBalance,
      totalDeposits,
      totalWithdrawals,
      totalWins,
      totalLosses,
      pendingDeposits,
      pendingWithdrawals,
    };
  });

  const totalPages = Math.ceil(total / pageSize);
  
  return {
    total,
    data: usersWithDetails,
    pagination: {
      page,
      pageSize,
      totalPages,
      total,
    },
  };
};

export const updateUser = async (
  id: number,
  data: Partial<{
    username: string;
    fullname: string;
    phone: string;
    email: string;
    password: string;
    currency_id: number;
    refer_code?: string;
    isAgreeWithTerms: boolean;
    status: "active" | "inactive";
    isLoggedIn: boolean;
  }>
) => {
  if (data.password) {
    // Optionally hash password if needed
    // data.password = await bcrypt.hash(data.password, 10);
  }
  const [user] = await db.update(users).set(data).where(eq(users.id, id));
  return user;
};

export const deleteUser = async (id: number) => {
  const result = await db.delete(users).where(eq(users.id, id));
  return result;
};
