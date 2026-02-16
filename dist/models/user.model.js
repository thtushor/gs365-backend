"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfileById = exports.deleteUser = exports.updateUser = exports.getUsersWithFilters = exports.getUsersByReferrerType = exports.getUserDetailsById = exports.getUserById = exports.findUserByReferCode = exports.createUser = exports.findUserByUsernameOrEmail = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const users_1 = require("../db/schema/users");
const currency_1 = require("../db/schema/currency");
const AdminUsers_1 = require("../db/schema/AdminUsers");
const transactions_1 = require("../db/schema/transactions");
const connection_1 = require("../db/connection");
const balance_model_1 = require("./balance.model");
const drizzle_orm_2 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const findUserByUsernameOrEmail = async (usernameOrEmail) => {
    const [user] = await connection_1.db
        .select()
        .from(users_1.users)
        // .leftJoin(currency, eq(currency.id, users.currency_id))
        .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(users_1.users.username, usernameOrEmail), (0, drizzle_orm_1.eq)(users_1.users.email, usernameOrEmail), (0, drizzle_orm_1.eq)(users_1.users.phone, usernameOrEmail)));
    return user;
};
exports.findUserByUsernameOrEmail = findUserByUsernameOrEmail;
const createUser = async (data) => {
    // const hashedPassword = await bcrypt.hash(data.password, 10);
    const [result] = await connection_1.db.insert(users_1.users).values({
        ...data,
        created_by: data?.createdBy,
        referred_by: data?.referred_by,
        referred_by_admin_user: data?.referred_by_admin_user,
        // password: hashedPassword,
    });
    // Fetch and return the created user
    const [createdUser] = await connection_1.db
        .select()
        .from(users_1.users)
        .where((0, drizzle_orm_1.eq)(users_1.users.id, result.insertId));
    return createdUser;
};
exports.createUser = createUser;
const findUserByReferCode = async (refer_code) => {
    const [user] = await connection_1.db
        .select()
        .from(users_1.users)
        .where((0, drizzle_orm_1.eq)(users_1.users.refer_code, refer_code));
    return user;
};
exports.findUserByReferCode = findUserByReferCode;
const getUserById = async (id) => {
    const [user] = await connection_1.db.select().from(users_1.users).where((0, drizzle_orm_1.eq)(users_1.users.id, id));
    return user;
};
exports.getUserById = getUserById;
const getUserDetailsById = async (id) => {
    try {
        const [user] = await connection_1.db
            .select({
            // User basic info
            id: users_1.users.id,
            fullname: users_1.users.fullname,
            username: users_1.users.username,
            email: users_1.users.email,
            phone: users_1.users.phone,
            isVerified: users_1.users.isVerified,
            status: users_1.users.status,
            created_at: users_1.users.created_at,
            device_type: users_1.users.device_type,
            ip_address: users_1.users.ip_address,
            // Currency info
            currencyCode: currency_1.currencies.code,
            currencyName: currency_1.currencies.name,
            // Referrer info (could be affiliate or agent)
            referrerName: AdminUsers_1.adminUsers.fullname,
            referrerRole: AdminUsers_1.adminUsers.role,
            // User referrer info (from referred_by column)
            userReferrerName: (0, drizzle_orm_1.sql) `user_referrer.fullname`,
            userReferrerUsername: (0, drizzle_orm_1.sql) `user_referrer.username`,
            currency: currency_1.currencies,
        })
            .from(users_1.users)
            .leftJoin(currency_1.currencies, (0, drizzle_orm_1.eq)(users_1.users.currency_id, currency_1.currencies.id))
            .leftJoin(AdminUsers_1.adminUsers, (0, drizzle_orm_1.eq)(users_1.users.referred_by_admin_user, AdminUsers_1.adminUsers.id))
            .leftJoin((0, drizzle_orm_1.sql) `${users_1.users} as user_referrer`, (0, drizzle_orm_1.eq)(users_1.users.referred_by, (0, drizzle_orm_1.sql) `user_referrer.id`))
            .where((0, drizzle_orm_1.eq)(users_1.users.id, id));
        if (!user)
            return null;
        // Get balance information using BalanceModel
        const balance = await balance_model_1.BalanceModel.calculatePlayerBalance(user.id);
        const totalDeposits = Number(balance.totalDeposits);
        const totalWithdrawals = Number(balance.totalWithdrawals);
        const totalWins = Number(balance.totalWins);
        const totalLosses = Number(balance.totalLosses);
        const pendingDeposits = Number(balance.pendingDeposits);
        const pendingWithdrawals = Number(balance.pendingWithdrawals);
        // Calculate current balance: deposits + wins - withdrawals - losses
        const totalBalance = totalDeposits + totalWins - totalWithdrawals - totalLosses;
        // Determine affiliate and agent info based on referrer role
        let affiliateName = null;
        let affiliateRole = null;
        let agentName = null;
        let agentRole = null;
        if (user.referrerRole) {
            if (user.referrerRole === "superAffiliate" ||
                user.referrerRole === "affiliate") {
                affiliateName = user.referrerName;
                affiliateRole = user.referrerRole;
            }
            else if (user.referrerRole === "superAgent" ||
                user.referrerRole === "agent") {
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
    }
    catch (error) {
        console.error("Error getting user details:", error);
        throw error;
    }
};
exports.getUserDetailsById = getUserDetailsById;
const getUsersByReferrerType = async (referrerType, page = 1, pageSize = 10) => {
    try {
        const roleFilter = referrerType === "affiliate"
            ? (0, drizzle_orm_1.sql) `${AdminUsers_1.adminUsers.role} IN ('superAffiliate', 'affiliate')`
            : (0, drizzle_orm_1.sql) `${AdminUsers_1.adminUsers.role} IN ('agent', 'superAgent')`;
        const whereClause = (0, drizzle_orm_1.and)((0, drizzle_orm_1.sql) `${users_1.users.referred_by_admin_user} IS NOT NULL`, roleFilter);
        // Get total count
        const total = await connection_1.db
            .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
            .from(users_1.users)
            .leftJoin(AdminUsers_1.adminUsers, (0, drizzle_orm_1.eq)(users_1.users.referred_by_admin_user, AdminUsers_1.adminUsers.id))
            .where(whereClause)
            .then((rows) => Number(rows[0]?.count || 0));
        // Get paginated data
        const data = await connection_1.db
            .select({
            id: users_1.users.id,
            fullname: users_1.users.fullname,
            username: users_1.users.username,
            email: users_1.users.email,
            phone: users_1.users.phone,
            status: users_1.users.status,
            created_at: users_1.users.created_at,
            referrerName: AdminUsers_1.adminUsers.fullname,
            referrerRole: AdminUsers_1.adminUsers.role,
        })
            .from(users_1.users)
            .leftJoin(AdminUsers_1.adminUsers, (0, drizzle_orm_1.eq)(users_1.users.referred_by_admin_user, AdminUsers_1.adminUsers.id))
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
    }
    catch (error) {
        console.error(`Error getting users by ${referrerType}:`, error);
        throw error;
    }
};
exports.getUsersByReferrerType = getUsersByReferrerType;
const getUsersWithFilters = async (filters) => {
    const { playerId, phone, status, keyword, page = 1, pageSize = 10, createdBy, referred_by, referred_by_admin_user, userType = "all", currencyId, dateFrom, dateTo, } = filters;
    const whereClauses = [];
    if (playerId)
        whereClauses.push((0, drizzle_orm_1.eq)(users_1.users.id, playerId));
    if (phone)
        whereClauses.push((0, drizzle_orm_1.eq)(users_1.users.phone, phone));
    if (status)
        whereClauses.push((0, drizzle_orm_1.eq)(users_1.users.status, status));
    // if (createdBy) whereClauses.push(eq(users.created_by, createdBy));
    if (referred_by_admin_user)
        whereClauses.push((0, drizzle_orm_1.eq)(users_1.users.referred_by_admin_user, referred_by_admin_user));
    if (referred_by) {
        whereClauses.push((0, drizzle_orm_1.eq)(users_1.users.referred_by, referred_by));
    }
    if (currencyId) {
        whereClauses.push((0, drizzle_orm_1.eq)(users_1.users.currency_id, currencyId));
    }
    if (dateFrom) {
        const start = new Date(dateFrom);
        start.setHours(0, 0, 0, 0);
        whereClauses.push((0, drizzle_orm_1.sql) `${users_1.users.created_at} >= ${start}`);
    }
    if (dateTo) {
        const end = new Date(dateTo);
        end.setHours(23, 59, 59, 999);
        whereClauses.push((0, drizzle_orm_1.sql) `${users_1.users.created_at} <= ${end}`);
    }
    if (keyword) {
        const kw = `%${keyword}%`;
        whereClauses.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(users_1.users.username, `%${kw}%`), (0, drizzle_orm_1.like)(users_1.users.fullname, `%${kw}%`), (0, drizzle_orm_1.like)(users_1.users.email, `%${kw}%`), (0, drizzle_orm_1.like)(users_1.users.phone, `%${kw}%`)));
    }
    // Filter by user type (affiliate, agent, or player)
    if (filters.userType && filters.userType !== "all") {
        if (filters.userType === "affiliate") {
            // Users referred by superAffiliate or affiliate
            whereClauses.push((0, drizzle_orm_1.sql) `${users_1.users.referred_by_admin_user} IS NOT NULL`);
            whereClauses.push((0, drizzle_orm_1.sql) `${AdminUsers_1.adminUsers.role} IN ('superAffiliate', 'affiliate')`);
        }
        else if (filters.userType === "agent") {
            // Users referred by agent or superAgent
            whereClauses.push((0, drizzle_orm_1.sql) `${users_1.users.referred_by_admin_user} IS NOT NULL`);
            whereClauses.push((0, drizzle_orm_1.sql) `${AdminUsers_1.adminUsers.role} IN ('agent', 'superAgent')`);
        }
        else if (filters.userType === "player") {
            // Users with no referrer (direct players)
            whereClauses.push((0, drizzle_orm_1.sql) `${users_1.users.referred_by_admin_user} IS NULL`);
        }
    }
    const where = whereClauses.length ? (0, drizzle_orm_1.and)(...whereClauses) : undefined;
    // Get total count
    const total = await connection_1.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)` })
        .from(users_1.users)
        .where(where)
        .then((rows) => Number(rows[0]?.count || 0));
    // Get paginated data with all required fields
    const data = await connection_1.db
        .select({
        // User basic info
        id: users_1.users.id,
        fullname: users_1.users.fullname,
        username: users_1.users.username,
        email: users_1.users.email,
        phone: users_1.users.phone,
        isVerified: users_1.users.isVerified,
        status: users_1.users.status,
        kyc_status: users_1.users.kyc_status,
        created_at: users_1.users.created_at,
        device_type: users_1.users.device_type,
        ip_address: users_1.users.ip_address,
        // Currency info
        currencyCode: currency_1.currencies.code,
        currencyName: currency_1.currencies.name,
        // Referrer info (could be affiliate or agent)
        referrerName: AdminUsers_1.adminUsers.fullname,
        referrerRole: AdminUsers_1.adminUsers.role,
        referred_by: users_1.users.referred_by,
        referred_by_admin_user: users_1.users.referred_by_admin_user,
        // User referrer info (from referred_by column)
        userReferrerName: (0, drizzle_orm_1.sql) `user_referrer.fullname`,
        userReferrerUsername: (0, drizzle_orm_1.sql) `user_referrer.username`,
    })
        .from(users_1.users)
        .leftJoin(currency_1.currencies, (0, drizzle_orm_1.eq)(users_1.users.currency_id, currency_1.currencies.id))
        .leftJoin(AdminUsers_1.adminUsers, (0, drizzle_orm_1.eq)(users_1.users.referred_by_admin_user, AdminUsers_1.adminUsers.id))
        .leftJoin((0, drizzle_orm_1.sql) `${users_1.users} as user_referrer`, (0, drizzle_orm_1.eq)(users_1.users.referred_by, (0, drizzle_orm_1.sql) `user_referrer.id`))
        .where(where)
        .limit(pageSize)
        .orderBy((0, drizzle_orm_2.desc)(users_1.users.id))
        .offset((page - 1) * pageSize);
    // Get all user IDs for batch balance calculation
    const userIds = data.map((user) => user.id);
    // Get balance information for all users using BalanceModel
    let balanceData = [];
    if (userIds.length > 0) {
        // Get balances for all users
        const balancePromises = userIds.map((userId) => balance_model_1.BalanceModel.calculatePlayerBalance(userId));
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
    const balanceMap = new Map(balanceData.map((balance) => [balance.user_id, balance]));
    // Calculate balance and transaction data for each user
    const usersWithDetails = data.map((user) => {
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
        let affiliateName = null;
        let affiliateRole = null;
        let affiliateId = null;
        let agentName = null;
        let agentRole = null;
        if (user.referrerRole) {
            if (user.referrerRole === "superAffiliate" ||
                user.referrerRole === "affiliate") {
                affiliateName = user.referrerName;
                affiliateRole = user.referrerRole;
            }
            else if (user.referrerRole === "superAgent" ||
                user.referrerRole === "agent") {
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
exports.getUsersWithFilters = getUsersWithFilters;
const updateUser = async (id, data) => {
    if (data.password) {
        // Optionally hash password if needed
        // data.password = await bcrypt.hash(data.password, 10);
    }
    const [user] = await connection_1.db.update(users_1.users).set(data).where((0, drizzle_orm_1.eq)(users_1.users.id, id));
    return user;
};
exports.updateUser = updateUser;
const deleteUser = async (id) => {
    const result = await connection_1.db.delete(users_1.users).where((0, drizzle_orm_1.eq)(users_1.users.id, id));
    return result;
};
exports.deleteUser = deleteUser;
const getUserProfileById = async (id) => {
    try {
        // Get user with all related information
        const [user] = await connection_1.db
            .select({
            // User basic info
            id: users_1.users.id,
            fullname: users_1.users.fullname,
            username: users_1.users.username,
            email: users_1.users.email,
            phone: users_1.users.phone,
            isVerified: users_1.users.isVerified,
            status: users_1.users.status,
            created_at: users_1.users.created_at,
            device_type: users_1.users.device_type,
            refer_code: users_1.users.refer_code,
            ip_address: users_1.users.ip_address,
            lastLogin: users_1.users.lastLogin,
            lastIp: users_1.users.lastIp,
            isLoggedIn: users_1.users.isLoggedIn,
            kyc_status: users_1.users.kyc_status,
            // Currency info
            currencyId: users_1.users.currency_id,
            currencyCode: currency_1.currencies.code,
            currencyName: currency_1.currencies.name,
            currencySymbol: currency_1.currencies.symbol,
            // Admin referrer info (affiliate/agent)
            adminReferrerName: (0, drizzle_orm_1.sql) `admin_referrer.fullname`,
            adminReferrerUsername: (0, drizzle_orm_1.sql) `admin_referrer.username`,
            adminReferrerRole: (0, drizzle_orm_1.sql) `admin_referrer.role`,
            adminReferrerPhone: (0, drizzle_orm_1.sql) `admin_referrer.phone`,
            adminReferrerEmail: (0, drizzle_orm_1.sql) `admin_referrer.email`,
            adminReferrerCommission: (0, drizzle_orm_1.sql) `admin_referrer.commission_percent`,
            adminReferrerId: (0, drizzle_orm_1.sql) `admin_referrer.id`,
            // User referrer info (from referred_by column)
            userReferrerName: (0, drizzle_orm_1.sql) `user_referrer.fullname`,
            userReferrerUsername: (0, drizzle_orm_1.sql) `user_referrer.username`,
            userReferrerPhone: (0, drizzle_orm_1.sql) `user_referrer.phone`,
            userReferrerEmail: (0, drizzle_orm_1.sql) `user_referrer.email`,
            userReferrerId: (0, drizzle_orm_1.sql) `user_referrer.id`,
            // Created by info
            createdByName: (0, drizzle_orm_1.sql) `created_by_user.fullname`,
            createdByUsername: (0, drizzle_orm_1.sql) `created_by_user.username`,
            createdByRole: (0, drizzle_orm_1.sql) `created_by_user.role`,
            createdByPhone: (0, drizzle_orm_1.sql) `created_by_user.phone`,
            createdByEmail: (0, drizzle_orm_1.sql) `created_by_user.email`,
            createdByStatus: (0, drizzle_orm_1.sql) `created_by_user.status`,
        })
            .from(users_1.users)
            .leftJoin(currency_1.currencies, (0, drizzle_orm_1.eq)(users_1.users.currency_id, currency_1.currencies.id))
            .leftJoin((0, drizzle_orm_1.sql) `${AdminUsers_1.adminUsers} as admin_referrer`, (0, drizzle_orm_1.eq)(users_1.users.referred_by_admin_user, (0, drizzle_orm_1.sql) `admin_referrer.id`))
            .leftJoin((0, drizzle_orm_1.sql) `${users_1.users} as user_referrer`, (0, drizzle_orm_1.eq)(users_1.users.referred_by, (0, drizzle_orm_1.sql) `user_referrer.id`))
            .leftJoin((0, drizzle_orm_1.sql) `${AdminUsers_1.adminUsers} as created_by_user`, (0, drizzle_orm_1.eq)(users_1.users.created_by, (0, drizzle_orm_1.sql) `created_by_user.id`))
            .where((0, drizzle_orm_1.eq)(users_1.users.id, id));
        if (!user)
            return null;
        // Get balance information using BalanceModel
        const balance = await balance_model_1.BalanceModel.calculatePlayerBalance(user.id);
        // Get bet results summary
        const betResultsSummary = await connection_1.db
            .select({
            totalBets: (0, drizzle_orm_1.sql) `COUNT(*)`,
            totalWins: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN bet_status = 'win' THEN 1 END)`,
            totalLosses: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN bet_status = 'loss' THEN 1 END)`,
            totalPending: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN bet_status = 'pending' THEN 1 END)`,
            totalBetAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(bet_amount AS DECIMAL(10,2))), 0)`,
            totalWinAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(win_amount AS DECIMAL(10,2))), 0)`,
            totalLossAmount: (0, drizzle_orm_1.sql) `COALESCE(SUM(CAST(loss_amount AS DECIMAL(10,2))), 0)`,
            lastBetDate: (0, drizzle_orm_1.sql) `MAX(created_at)`,
            firstBetDate: (0, drizzle_orm_1.sql) `MIN(created_at)`,
        })
            .from((0, drizzle_orm_1.sql) `bet_results`)
            .where((0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `bet_results.user_id`, user.id));
        const [totalBonusAmount] = await connection_1.db
            .select({
            totalBonus: (0, drizzle_orm_1.sql) `COALESCE(SUM(${transactions_1.transactions.bonusAmount}), 0)`,
        })
            .from(transactions_1.transactions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(transactions_1.transactions.userId, user.id), (0, drizzle_orm_1.eq)(transactions_1.transactions.type, "deposit")));
        // Get recent transactions (last 10)
        const recentTransactions = await connection_1.db
            .select({
            id: transactions_1.transactions.id,
            type: transactions_1.transactions.type,
            amount: transactions_1.transactions.amount,
            status: transactions_1.transactions.status,
            createdAt: transactions_1.transactions.createdAt,
            gameId: transactions_1.transactions.gameId,
            customTransactionId: transactions_1.transactions.customTransactionId,
            givenTransactionId: transactions_1.transactions.givenTransactionId,
            processedBy: transactions_1.transactions.processedBy,
            processedByUser: transactions_1.transactions.processedByUser,
            processedByName: AdminUsers_1.adminUsers.fullname,
            processedByUserName: users_1.users.fullname,
        })
            .from(transactions_1.transactions)
            .leftJoin(AdminUsers_1.adminUsers, (0, drizzle_orm_1.eq)(AdminUsers_1.adminUsers.id, transactions_1.transactions.processedBy))
            .leftJoin(users_1.users, (0, drizzle_orm_1.eq)(users_1.users.id, transactions_1.transactions.processedByUser))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(transactions_1.transactions.userId, user.id), (0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(transactions_1.transactions.type, "deposit"), (0, drizzle_orm_1.eq)(transactions_1.transactions.type, "withdraw"), (0, drizzle_orm_1.eq)(transactions_1.transactions.type, "spin_bonus"))))
            .orderBy((0, drizzle_orm_2.desc)(transactions_1.transactions.createdAt))
            .limit(10);
        // Get recent bet results (last 10)
        const recentBetResults = await connection_1.db
            .select({
            id: (0, drizzle_orm_1.sql) `bet_results.id`,
            gameName: (0, drizzle_orm_1.sql) `bet_results.game_name`,
            betAmount: (0, drizzle_orm_1.sql) `bet_results.bet_amount`,
            betStatus: (0, drizzle_orm_1.sql) `bet_results.bet_status`,
            winAmount: (0, drizzle_orm_1.sql) `bet_results.win_amount`,
            lossAmount: (0, drizzle_orm_1.sql) `bet_results.loss_amount`,
            multiplier: (0, drizzle_orm_1.sql) `bet_results.multiplier`,
            createdAt: (0, drizzle_orm_1.sql) `bet_results.created_at`,
        })
            .from((0, drizzle_orm_1.sql) `bet_results`)
            .where((0, drizzle_orm_1.eq)((0, drizzle_orm_1.sql) `bet_results.user_id`, user.id))
            .orderBy((0, drizzle_orm_2.desc)((0, drizzle_orm_1.sql) `bet_results.created_at`))
            .limit(10);
        // Determine user type based on referrers
        let userType = "player";
        let referrerType = null;
        let referrerDetails = null;
        let userCurrencyConversion = null;
        if (user.currencyId) {
            [userCurrencyConversion] = await connection_1.db
                .select({
                id: schema_1.currencyConversion.id,
                rate: schema_1.currencyConversion.rate,
                fromId: schema_1.currencyConversion.fromCurrency,
                toId: schema_1.currencyConversion.toCurrency,
            })
                .from(schema_1.currencyConversion)
                .where((0, drizzle_orm_1.eq)(schema_1.currencyConversion.toCurrency, user.currencyId))
                .limit(1);
        }
        console.log("currency conversion: ", userCurrencyConversion);
        if (user.adminReferrerRole) {
            if (["superAffiliate", "affiliate"].includes(user.adminReferrerRole)) {
                userType = "affiliate_user";
                referrerType = "affiliate";
                referrerDetails = {
                    id: user.adminReferrerId,
                    name: user.adminReferrerName,
                    username: user.adminReferrerUsername,
                    role: user.adminReferrerRole,
                    phone: user.adminReferrerPhone,
                    email: user.adminReferrerEmail,
                    commission: user.adminReferrerCommission,
                };
            }
            else if (["superAgent", "agent"].includes(user.adminReferrerRole)) {
                userType = "agent_user";
                referrerType = "agent";
                referrerDetails = {
                    id: user.adminReferrerId,
                    name: user.adminReferrerName,
                    username: user.adminReferrerUsername,
                    role: user.adminReferrerRole,
                    phone: user.adminReferrerPhone,
                    email: user.adminReferrerEmail,
                };
            }
        }
        else if (user.userReferrerName) {
            userType = "referred_player";
            referrerType = "player";
            referrerDetails = {
                id: user.userReferrerId,
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
            refer_code: user.refer_code,
            ip_address: user.ip_address,
            kyc_status: user.kyc_status,
            // Currency information
            currency: {
                id: user.currencyId,
                code: user.currencyCode,
                name: user.currencyName,
                symbol: user.currencySymbol,
                conversion: userCurrencyConversion,
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
                phone: user.createdByPhone,
                email: user.createdByEmail,
                status: user.createdByStatus,
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
                totalBonusAmount: totalBonusAmount.totalBonus,
            },
            // Transaction summary
            transactionSummary: {
                totalTransactions: Number(recentTransactions.length || 0),
                totalDepositTransactions: Number(recentTransactions.filter((t) => t.type === "deposit").length || 0),
                totalSpinBonusAmount: Number(recentTransactions
                    .filter((t) => t.type === "spin_bonus")
                    .reduce((sum, t) => sum + Number(t.amount || 0), 0)),
                totalWithdrawTransactions: Number(recentTransactions.filter((t) => t.type === "withdraw").length || 0),
                totalWinTransactions: Number(recentTransactions.filter((t) => t.type === "win").length || 0),
                totalLossTransactions: Number(recentTransactions.filter((t) => t.type === "loss").length || 0),
                lastTransactionDate: recentTransactions[0]?.createdAt,
                firstTransactionDate: recentTransactions[recentTransactions.length - 1]?.createdAt,
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
                winRate: betResultsSummary[0]?.totalBets > 0
                    ? ((Number(betResultsSummary[0]?.totalWins || 0) /
                        Number(betResultsSummary[0]?.totalBets || 1)) *
                        100).toFixed(2)
                    : "0.00",
                lastBetDate: betResultsSummary[0]?.lastBetDate,
                firstBetDate: betResultsSummary[0]?.firstBetDate,
            },
            // Recent activity
            recentTransactions,
            recentBetResults,
        };
    }
    catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
    }
};
exports.getUserProfileById = getUserProfileById;
