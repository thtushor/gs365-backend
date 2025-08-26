import { db } from "../db/connection";
import { userLoginHistory } from "../db/schema/userLoginHistory";
import { eq, desc, and, gte, lte, count } from "drizzle-orm";
import { users } from "../db/schema/users";

export interface CreateUserLoginHistory {
  userId: number;
  ipAddress: string;
  userAgent?: string;
  deviceType?: string;
  deviceName?: string;
  osVersion?: string;
  browser?: string;
  browserVersion?: string;
}

export interface UserLoginHistoryFilters {
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

export const createUserLoginHistory = async (data: CreateUserLoginHistory) => {
  const [loginHistory] = await db.insert(userLoginHistory).values({
    userId: data.userId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    deviceType: data.deviceType,
    deviceName: data.deviceName,
    osVersion: data.osVersion,
    browser: data.browser,
    browserVersion: data.browserVersion,
  });
  
  return loginHistory;
};

export const getUserLoginHistoryById = async (id: number) => {
  const [loginHistory] = await db
    .select()
    .from(userLoginHistory)
    .where(eq(userLoginHistory.id, id));
    
  return loginHistory;
};

export const getUserLoginHistoryByUserId = async (
  userId: number,
  filters: UserLoginHistoryFilters = {}
) => {
  const {
    startDate,
    endDate,
    page = 1,
    pageSize = 10
  } = filters;

  const whereClauses = [eq(userLoginHistory.userId, userId)];

  if (startDate) {
    whereClauses.push(gte(userLoginHistory.loginTime, new Date(startDate)));
  }

  if (endDate) {
    whereClauses.push(lte(userLoginHistory.loginTime, new Date(endDate)));
  }

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  // Get total count
  const totalResult = await db
    .select({ count: count() })
    .from(userLoginHistory)
    .where(where);
    
  const total = totalResult[0].count;

  // Get paginated data
  const data = await db
    .select()
    .from(userLoginHistory)
    .where(where)
    .orderBy(desc(userLoginHistory.loginTime))
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
};

export const getAllUserLoginHistory = async (filters: UserLoginHistoryFilters = {}) => {
  const {
    userId,
    startDate,
    endDate,
    page = 1,
    pageSize = 10
  } = filters;

  const whereClauses = [];

  if (userId) {
    whereClauses.push(eq(userLoginHistory.userId, userId));
  }

  if (startDate) {
    whereClauses.push(gte(userLoginHistory.loginTime, new Date(startDate)));
  }

  if (endDate) {
    whereClauses.push(lte(userLoginHistory.loginTime, new Date(endDate)));
  }

  const where = whereClauses.length > 0 ? and(...whereClauses) : undefined;

  // Get total count
  const totalResult = await db
    .select({ count: count() })
    .from(userLoginHistory)
    .where(where);
    
  const total = totalResult[0].count;

  // Get paginated data with user information
  const data = await db
    .select({
      id: userLoginHistory.id,
      userId: userLoginHistory.userId,
      ipAddress: userLoginHistory.ipAddress,
      userAgent: userLoginHistory.userAgent,
      loginTime: userLoginHistory.loginTime,
      deviceType: userLoginHistory.deviceType,
      deviceName: userLoginHistory.deviceName,
      osVersion: userLoginHistory.osVersion,
      browser: userLoginHistory.browser,
      browserVersion: userLoginHistory.browserVersion,
      username: users.username,
      email: users.email,
      fullname: users.fullname,
    })
    .from(userLoginHistory)
    .leftJoin(users, eq(userLoginHistory.userId, users.id))
    .where(where)
    .orderBy(desc(userLoginHistory.loginTime))
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
};

export const deleteUserLoginHistory = async (id: number) => {
  const result = await db.delete(userLoginHistory).where(eq(userLoginHistory.id, id));
  return result;
};