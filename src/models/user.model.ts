import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, or, and, like, sql, inArray } from "drizzle-orm";
import { users } from "../db/schema/users";
import { currencies } from "../db/schema/currency";
import { adminUsers } from "../db/schema/AdminUsers";
import { transactions } from "../db/schema/transactions";
import bcrypt from "bcryptjs";

import { db } from "../db/connection";
import { BalanceModel } from "./balance.model";
import { desc } from "drizzle-orm";

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
  country_id: number;
  refer_code?: string;
  isAgreeWithTerms: boolean;
  createdBy?: number;
  referred_by?: number;
  referred_by_admin_user?: number;
  status: "active" | "inactive";
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
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user;
};

export const getUserDetailsById = async (
  id: number
): Promise<UserWithDetails | null> => {
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
      .leftJoin(
        sql`${users} as user_referrer`,
        eq(users.referred_by, sql`user_referrer.id`)
      )
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
    const totalBalance =
      totalDeposits + totalWins - totalWithdrawals - totalLosses;

    // Determine affiliate and agent info based on referrer role
    let affiliateName: string | null = null;
    let affiliateRole: string | null = null;
    let agentName: string | null = null;
    let agentRole: string | null = null;

    if (user.referrerRole) {
      if (
        user.referrerRole === "superAffiliate" ||
        user.referrerRole === "affiliate"
      ) {
        affiliateName = user.referrerName;
        affiliateRole = user.referrerRole;
      } else if (
        user.referrerRole === "superAgent" ||
        user.referrerRole === "agent"
      ) {
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

export const getUsersByReferrerType = async (
  referrerType: "affiliate" | "agent",
  page = 1,
  pageSize = 10
) => {
  try {
    const roleFilter =
      referrerType === "affiliate"
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
  userType?: "all" | "affiliate" | "agent" | "player";
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
    userType = "all",
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
  if (filters.userType && filters.userType !== "all") {
    if (filters.userType === "affiliate") {
      // Users referred by superAffiliate or affiliate
      whereClauses.push(sql`${users.referred_by_admin_user} IS NOT NULL`);
      whereClauses.push(
        sql`${adminUsers.role} IN ('superAffiliate', 'affiliate')`
      );
    } else if (filters.userType === "agent") {
      // Users referred by agent or superAgent
      whereClauses.push(sql`${users.referred_by_admin_user} IS NOT NULL`);
      whereClauses.push(sql`${adminUsers.role} IN ('agent', 'superAgent')`);
    } else if (filters.userType === "player") {
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
      referred_by: users.referred_by,
      referred_by_admin_user: users.referred_by_admin_user,
      // User referrer info (from referred_by column)
      userReferrerName: sql<string>`user_referrer.fullname`,
      userReferrerUsername: sql<string>`user_referrer.username`,
    })
    .from(users)
    .leftJoin(currencies, eq(users.currency_id, currencies.id))
    .leftJoin(adminUsers, eq(users.referred_by_admin_user, adminUsers.id))
    .leftJoin(
      sql`${users} as user_referrer`,
      eq(users.referred_by, sql`user_referrer.id`)
    )
    .where(where)
    .limit(pageSize)
    .orderBy(desc(users.id))
    .offset((page - 1) * pageSize);

  // Get all user IDs for batch balance calculation
  const userIds = data.map((user) => user.id);

  // Get balance information for all users using BalanceModel
  let balanceData: any[] = [];
  if (userIds.length > 0) {
    // Get balances for all users
    const balancePromises = userIds.map((userId) =>
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
    balanceData.map((balance) => [balance.user_id, balance])
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
    const totalBalance =
      totalDeposits + totalWins - totalWithdrawals - totalLosses;

    // Determine affiliate and agent info based on referrer role
    let affiliateName: string | null = null;
    let affiliateRole: string | null = null;
    let affiliateId: number | null = null;
    let agentName: string | null = null;
    let agentRole: string | null = null;

    if (user.referrerRole) {
      if (
        user.referrerRole === "superAffiliate" ||
        user.referrerRole === "affiliate"
      ) {
        affiliateName = user.referrerName;
        affiliateRole = user.referrerRole;
      } else if (
        user.referrerRole === "superAgent" ||
        user.referrerRole === "agent"
      ) {
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

export const getUserProfileById = async (id: number): Promise<any> => {
  try {
    // Get user with all related information
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
        lastLogin: users.lastLogin,
        lastIp: users.lastIp,
        isLoggedIn: users.isLoggedIn,
        kyc_status: users.kyc_status,
        // Currency info
        currencyCode: currencies.code,
        currencyName: currencies.name,
        currencySymbol: currencies.symbol,
        // Admin referrer info (affiliate/agent)
        adminReferrerName: sql<string>`admin_referrer.fullname`,
        adminReferrerUsername: sql<string>`admin_referrer.username`,
        adminReferrerRole: sql<string>`admin_referrer.role`,
        adminReferrerPhone: sql<string>`admin_referrer.phone`,
        adminReferrerEmail: sql<string>`admin_referrer.email`,
        adminReferrerCommission: sql<string>`admin_referrer.commission_percent`,
        // User referrer info (from referred_by column)
        userReferrerName: sql<string>`user_referrer.fullname`,
        userReferrerUsername: sql<string>`user_referrer.username`,
        userReferrerPhone: sql<string>`user_referrer.phone`,
        userReferrerEmail: sql<string>`user_referrer.email`,
        // Created by info
        createdByName: sql<string>`created_by_user.fullname`,
        createdByUsername: sql<string>`created_by_user.username`,
        createdByRole: sql<string>`created_by_user.role`,
      })
      .from(users)
      .leftJoin(currencies, eq(users.currency_id, currencies.id))
      .leftJoin(
        sql`${adminUsers} as admin_referrer`,
        eq(users.referred_by_admin_user, sql`admin_referrer.id`)
      )
      .leftJoin(
        sql`${users} as user_referrer`,
        eq(users.referred_by, sql`user_referrer.id`)
      )
      .leftJoin(
        sql`${adminUsers} as created_by_user`,
        eq(users.created_by, sql`created_by_user.id`)
      )
      .where(eq(users.id, id));

    if (!user) return null;

    // Get balance information using BalanceModel
    const balance = await BalanceModel.calculatePlayerBalance(user.id);

    // Get bet results summary
    const betResultsSummary = await db
      .select({
        totalBets: sql<number>`COUNT(*)`,
        totalWins: sql<number>`COUNT(CASE WHEN bet_status = 'win' THEN 1 END)`,
        totalLosses: sql<number>`COUNT(CASE WHEN bet_status = 'loss' THEN 1 END)`,
        totalPending: sql<number>`COUNT(CASE WHEN bet_status = 'pending' THEN 1 END)`,
        totalBetAmount: sql<number>`COALESCE(SUM(CAST(bet_amount AS DECIMAL(10,2))), 0)`,
        totalWinAmount: sql<number>`COALESCE(SUM(CAST(win_amount AS DECIMAL(10,2))), 0)`,
        totalLossAmount: sql<number>`COALESCE(SUM(CAST(loss_amount AS DECIMAL(10,2))), 0)`,
        lastBetDate: sql<Date>`MAX(created_at)`,
        firstBetDate: sql<Date>`MIN(created_at)`,
      })
      .from(sql`bet_results`)
      .where(eq(sql`bet_results.user_id`, user.id));

    // Get recent transactions (last 10)
    const recentTransactions = await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        status: transactions.status,
        createdAt: transactions.createdAt,
        gameId: transactions.gameId,
        customTransactionId: transactions.customTransactionId,
        givenTransactionId: transactions.givenTransactionId,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, user.id),
          or(
            eq(transactions.type, "deposit"),
            eq(transactions.type, "withdraw")
          )
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(10);

    // Get recent bet results (last 10)
    const recentBetResults = await db
      .select({
        id: sql<number>`bet_results.id`,
        gameName: sql<string>`bet_results.game_name`,
        betAmount: sql<string>`bet_results.bet_amount`,
        betStatus: sql<string>`bet_results.bet_status`,
        winAmount: sql<string>`bet_results.win_amount`,
        lossAmount: sql<string>`bet_results.loss_amount`,
        multiplier: sql<string>`bet_results.multiplier`,
        createdAt: sql<Date>`bet_results.created_at`,
      })
      .from(sql`bet_results`)
      .where(eq(sql`bet_results.user_id`, user.id))
      .orderBy(desc(sql`bet_results.created_at`))
      .limit(10);

    // Determine user type based on referrers
    let userType = "player";
    let referrerType = null;
    let referrerDetails = null;

    if (user.adminReferrerRole) {
      if (["superAffiliate", "affiliate"].includes(user.adminReferrerRole)) {
        userType = "affiliate_user";
        referrerType = "affiliate";
        referrerDetails = {
          name: user.adminReferrerName,
          username: user.adminReferrerUsername,
          role: user.adminReferrerRole,
          phone: user.adminReferrerPhone,
          email: user.adminReferrerEmail,
          commission: user.adminReferrerCommission,
        };
      } else if (["superAgent", "agent"].includes(user.adminReferrerRole)) {
        userType = "agent_user";
        referrerType = "agent";
        referrerDetails = {
          name: user.adminReferrerName,
          username: user.adminReferrerUsername,
          role: user.adminReferrerRole,
          phone: user.adminReferrerPhone,
          email: user.adminReferrerEmail,
        };
      }
    } else if (user.userReferrerName) {
      userType = "referred_player";
      referrerType = "player";
      referrerDetails = {
        name: user.userReferrerName,
        username: user.userReferrerUsername,
        phone: user.userReferrerPhone,
        email: user.userReferrerEmail,
      };
    }

    return {
      // Basic user information
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isVerified: user.isVerified,
      status: user.status,
      created_at: user.created_at,
      lastLogin: user.lastLogin,
      lastIp: user.lastIp,
      isLoggedIn: user.isLoggedIn,
      device_type: user.device_type,
      ip_address: user.ip_address,
      kyc_status: user.kyc_status,

      // Currency information
      currency: {
        code: user.currencyCode,
        name: user.currencyName,
        symbol: user.currencySymbol,
      },

      // User type and referrer information
      userType,
      referrerType,
      referrerDetails,

      // Created by information
      createdBy: {
        name: user.createdByName,
        username: user.createdByUsername,
        role: user.createdByRole,
      },

      // Balance information
      balance: {
        currentBalance: balance.currentBalance,
        totalDeposits: balance.totalDeposits,
        totalWithdrawals: balance.totalWithdrawals,
        totalWins: balance.totalWins,
        totalLosses: balance.totalLosses,
        pendingDeposits: balance.pendingDeposits,
        pendingWithdrawals: balance.pendingWithdrawals,
        approvedDeposits: balance.approvedDeposits,
        approvedWithdrawals: balance.approvedWithdrawals,
        currencyCode: balance.currencyCode,
      },

      // Transaction summary
      transactionSummary: {
        totalTransactions: Number(recentTransactions.length || 0),
        totalDepositTransactions: Number(
          recentTransactions.filter((t) => t.type === "deposit").length || 0
        ),
        totalWithdrawTransactions: Number(
          recentTransactions.filter((t) => t.type === "withdraw").length || 0
        ),
        totalWinTransactions: Number(
          recentTransactions.filter((t) => t.type === "win").length || 0
        ),
        totalLossTransactions: Number(
          recentTransactions.filter((t) => t.type === "loss").length || 0
        ),
        lastTransactionDate: recentTransactions[0]?.createdAt,
        firstTransactionDate:
          recentTransactions[recentTransactions.length - 1]?.createdAt,
      },

      // Bet results summary
      betResultsSummary: {
        totalBets: Number(betResultsSummary[0]?.totalBets || 0),
        totalWins: Number(betResultsSummary[0]?.totalWins || 0),
        totalLosses: Number(betResultsSummary[0]?.totalLosses || 0),
        totalPending: Number(betResultsSummary[0]?.totalPending || 0),
        totalBetAmount: Number(betResultsSummary[0]?.totalBetAmount || 0),
        totalWinAmount: Number(betResultsSummary[0]?.totalWinAmount || 0),
        totalLossAmount: Number(betResultsSummary[0]?.totalLossAmount || 0),
        winRate:
          betResultsSummary[0]?.totalBets > 0
            ? (
                (Number(betResultsSummary[0]?.totalWins || 0) /
                  Number(betResultsSummary[0]?.totalBets || 1)) *
                100
              ).toFixed(2)
            : "0.00",
        lastBetDate: betResultsSummary[0]?.lastBetDate,
        firstBetDate: betResultsSummary[0]?.firstBetDate,
      },

      // Recent activity
      recentTransactions,
      recentBetResults,
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};
