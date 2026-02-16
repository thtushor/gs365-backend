"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserLoginHistory = exports.getAllUserLoginHistory = exports.getUserLoginHistoryByUserId = exports.getUserLoginHistoryById = exports.createUserLoginHistory = void 0;
const connection_1 = require("../db/connection");
const userLoginHistory_1 = require("../db/schema/userLoginHistory");
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("../db/schema/users");
const createUserLoginHistory = async (data) => {
    const [loginHistory] = await connection_1.db.insert(userLoginHistory_1.userLoginHistory).values({
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
exports.createUserLoginHistory = createUserLoginHistory;
const getUserLoginHistoryById = async (id) => {
    const [loginHistory] = await connection_1.db
        .select()
        .from(userLoginHistory_1.userLoginHistory)
        .where((0, drizzle_orm_1.eq)(userLoginHistory_1.userLoginHistory.id, id));
    return loginHistory;
};
exports.getUserLoginHistoryById = getUserLoginHistoryById;
const getUserLoginHistoryByUserId = async (userId, filters = {}) => {
    const { startDate, endDate, page = 1, pageSize = 10 } = filters;
    const whereClauses = [(0, drizzle_orm_1.eq)(userLoginHistory_1.userLoginHistory.userId, userId)];
    if (startDate) {
        whereClauses.push((0, drizzle_orm_1.gte)(userLoginHistory_1.userLoginHistory.loginTime, new Date(startDate)));
    }
    if (endDate) {
        whereClauses.push((0, drizzle_orm_1.lte)(userLoginHistory_1.userLoginHistory.loginTime, new Date(endDate)));
    }
    const where = whereClauses.length > 0 ? (0, drizzle_orm_1.and)(...whereClauses) : undefined;
    // Get total count
    const totalResult = await connection_1.db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(userLoginHistory_1.userLoginHistory)
        .where(where);
    const total = totalResult[0].count;
    // Get paginated data
    const data = await connection_1.db
        .select()
        .from(userLoginHistory_1.userLoginHistory)
        .where(where)
        .orderBy((0, drizzle_orm_1.desc)(userLoginHistory_1.userLoginHistory.loginTime))
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
exports.getUserLoginHistoryByUserId = getUserLoginHistoryByUserId;
const getAllUserLoginHistory = async (filters = {}) => {
    const { userId, startDate, endDate, page = 1, pageSize = 10 } = filters;
    const whereClauses = [];
    if (userId) {
        whereClauses.push((0, drizzle_orm_1.eq)(userLoginHistory_1.userLoginHistory.userId, userId));
    }
    if (startDate) {
        whereClauses.push((0, drizzle_orm_1.gte)(userLoginHistory_1.userLoginHistory.loginTime, new Date(startDate)));
    }
    if (endDate) {
        whereClauses.push((0, drizzle_orm_1.lte)(userLoginHistory_1.userLoginHistory.loginTime, new Date(endDate)));
    }
    const where = whereClauses.length > 0 ? (0, drizzle_orm_1.and)(...whereClauses) : undefined;
    // Get total count
    const totalResult = await connection_1.db
        .select({ count: (0, drizzle_orm_1.count)() })
        .from(userLoginHistory_1.userLoginHistory)
        .where(where);
    const total = totalResult[0].count;
    // Get paginated data with user information
    const data = await connection_1.db
        .select({
        id: userLoginHistory_1.userLoginHistory.id,
        userId: userLoginHistory_1.userLoginHistory.userId,
        ipAddress: userLoginHistory_1.userLoginHistory.ipAddress,
        userAgent: userLoginHistory_1.userLoginHistory.userAgent,
        loginTime: userLoginHistory_1.userLoginHistory.loginTime,
        deviceType: userLoginHistory_1.userLoginHistory.deviceType,
        deviceName: userLoginHistory_1.userLoginHistory.deviceName,
        osVersion: userLoginHistory_1.userLoginHistory.osVersion,
        browser: userLoginHistory_1.userLoginHistory.browser,
        browserVersion: userLoginHistory_1.userLoginHistory.browserVersion,
        username: users_1.users.username,
        email: users_1.users.email,
        fullname: users_1.users.fullname,
    })
        .from(userLoginHistory_1.userLoginHistory)
        .leftJoin(users_1.users, (0, drizzle_orm_1.eq)(userLoginHistory_1.userLoginHistory.userId, users_1.users.id))
        .where(where)
        .orderBy((0, drizzle_orm_1.desc)(userLoginHistory_1.userLoginHistory.loginTime))
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
exports.getAllUserLoginHistory = getAllUserLoginHistory;
const deleteUserLoginHistory = async (id) => {
    const result = await connection_1.db.delete(userLoginHistory_1.userLoginHistory).where((0, drizzle_orm_1.eq)(userLoginHistory_1.userLoginHistory.id, id));
    return result;
};
exports.deleteUserLoginHistory = deleteUserLoginHistory;
