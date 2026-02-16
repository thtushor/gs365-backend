"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WithdrawalPaymentAccountModel = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
exports.WithdrawalPaymentAccountModel = {
    // Create a new withdrawal payment account
    async create(data) {
        try {
            // If this is set as primary, unset other primary accounts for the same user
            if (data.isPrimary) {
                await connection_1.db
                    .update(schema_1.withdrawalPaymentAccounts)
                    .set({ isPrimary: false })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.userId, data.userId), (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.isPrimary, true)));
            }
            await connection_1.db
                .insert(schema_1.withdrawalPaymentAccounts)
                .values({
                userId: data.userId,
                paymentGatewayId: data.paymentGatewayId,
                accountNumber: data.accountNumber,
                holderName: data.holderName,
                provider: data.provider,
                bankName: data.bankName,
                branchName: data.branchName,
                branchAddress: data.branchAddress,
                swiftCode: data.swiftCode,
                iban: data.iban,
                routingNumber: data.routingNumber,
                walletAddress: data.walletAddress,
                network: data.network,
                accountHolderPhone: data.accountHolderPhone,
                accountHolderEmail: data.accountHolderEmail,
                country: data.country,
                state: data.state,
                city: data.city,
                address: data.address,
                postalCode: data.postalCode,
                isPrimary: data.isPrimary,
                isVerified: data.isVerified,
                isActive: data.isActive,
                verificationStatus: data.verificationStatus,
                verificationNotes: data.verificationNotes,
                minWithdrawalAmount: data.minWithdrawalAmount,
                maxWithdrawalAmount: data.maxWithdrawalAmount,
                withdrawalFee: data.withdrawalFee,
                processingTime: data.processingTime,
                additionalInfo: data.additionalInfo,
                createdBy: data.createdBy,
                updatedBy: data.updatedBy,
            });
            // Fetch the created record to return the complete object with ID and timestamps
            const createdRecord = await this.getByUserId(data.userId);
            const foundRecord = createdRecord.find(record => record.userId === data.userId &&
                record.holderName === data.holderName &&
                record.provider === data.provider);
            if (!foundRecord) {
                throw new Error("Failed to create withdrawal payment account - record not found after creation");
            }
            return foundRecord;
        }
        catch (error) {
            console.error("Error creating withdrawal payment account:", error);
            throw error;
        }
    },
    // Get withdrawal payment account by ID
    async getById(id) {
        try {
            const [result] = await connection_1.db
                .select({
                id: schema_1.withdrawalPaymentAccounts.id,
                userId: schema_1.withdrawalPaymentAccounts.userId,
                paymentGatewayId: schema_1.withdrawalPaymentAccounts.paymentGatewayId,
                accountNumber: schema_1.withdrawalPaymentAccounts.accountNumber,
                holderName: schema_1.withdrawalPaymentAccounts.holderName,
                provider: schema_1.withdrawalPaymentAccounts.provider,
                bankName: schema_1.withdrawalPaymentAccounts.bankName,
                branchName: schema_1.withdrawalPaymentAccounts.branchName,
                branchAddress: schema_1.withdrawalPaymentAccounts.branchAddress,
                swiftCode: schema_1.withdrawalPaymentAccounts.swiftCode,
                iban: schema_1.withdrawalPaymentAccounts.iban,
                routingNumber: schema_1.withdrawalPaymentAccounts.routingNumber,
                walletAddress: schema_1.withdrawalPaymentAccounts.walletAddress,
                network: schema_1.withdrawalPaymentAccounts.network,
                accountHolderPhone: schema_1.withdrawalPaymentAccounts.accountHolderPhone,
                accountHolderEmail: schema_1.withdrawalPaymentAccounts.accountHolderEmail,
                country: schema_1.withdrawalPaymentAccounts.country,
                state: schema_1.withdrawalPaymentAccounts.state,
                city: schema_1.withdrawalPaymentAccounts.city,
                address: schema_1.withdrawalPaymentAccounts.address,
                postalCode: schema_1.withdrawalPaymentAccounts.postalCode,
                isPrimary: schema_1.withdrawalPaymentAccounts.isPrimary,
                isVerified: schema_1.withdrawalPaymentAccounts.isVerified,
                isActive: schema_1.withdrawalPaymentAccounts.isActive,
                verificationStatus: schema_1.withdrawalPaymentAccounts.verificationStatus,
                verificationNotes: schema_1.withdrawalPaymentAccounts.verificationNotes,
                minWithdrawalAmount: schema_1.withdrawalPaymentAccounts.minWithdrawalAmount,
                maxWithdrawalAmount: schema_1.withdrawalPaymentAccounts.maxWithdrawalAmount,
                withdrawalFee: schema_1.withdrawalPaymentAccounts.withdrawalFee,
                processingTime: schema_1.withdrawalPaymentAccounts.processingTime,
                additionalInfo: schema_1.withdrawalPaymentAccounts.additionalInfo,
                createdBy: schema_1.withdrawalPaymentAccounts.createdBy,
                updatedBy: schema_1.withdrawalPaymentAccounts.updatedBy,
                createdAt: schema_1.withdrawalPaymentAccounts.createdAt,
                updatedAt: schema_1.withdrawalPaymentAccounts.updatedAt,
                user: {
                    id: schema_1.users.id,
                    username: schema_1.users.username,
                    email: schema_1.users.email,
                },
                paymentGateway: {
                    id: schema_1.paymentGateway.id,
                    name: schema_1.paymentGateway.name,
                    methodId: schema_1.paymentGateway.methodId,
                    status: schema_1.paymentGateway.status,
                },
            })
                .from(schema_1.withdrawalPaymentAccounts)
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.userId, schema_1.users.id))
                .leftJoin(schema_1.paymentGateway, (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.paymentGatewayId, schema_1.paymentGateway.id))
                .where((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.id, id))
                .limit(1);
            return result || null;
        }
        catch (error) {
            console.error("Error fetching withdrawal payment account by ID:", error);
            throw error;
        }
    },
    // Get withdrawal payment accounts with filters and pagination
    async getWithFilters(filters) {
        try {
            const { userId, paymentGatewayId, provider, isActive, verificationStatus, country, isPrimary, limit = 50, offset = 0, sortBy = "createdAt", sortOrder = "desc", } = filters;
            // Build where conditions
            const whereConditions = [];
            if (userId) {
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.userId, userId));
            }
            if (paymentGatewayId) {
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.paymentGatewayId, paymentGatewayId));
            }
            if (provider && provider.length > 0) {
                whereConditions.push((0, drizzle_orm_1.inArray)(schema_1.withdrawalPaymentAccounts.provider, provider));
            }
            if (isActive !== undefined) {
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.isActive, isActive));
            }
            if (verificationStatus && verificationStatus.length > 0) {
                whereConditions.push((0, drizzle_orm_1.inArray)(schema_1.withdrawalPaymentAccounts.verificationStatus, verificationStatus));
            }
            if (country) {
                whereConditions.push((0, drizzle_orm_1.like)(schema_1.withdrawalPaymentAccounts.country, `%${country}%`));
            }
            if (isPrimary !== undefined) {
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.isPrimary, isPrimary));
            }
            const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
            // Get total count for pagination
            const countQuery = connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
                .from(schema_1.withdrawalPaymentAccounts);
            if (whereClause) {
                countQuery.where(whereClause);
            }
            const totalResult = await countQuery;
            const total = totalResult[0]?.count || 0;
            // Build order-by expression
            let orderByExpr;
            switch (sortBy) {
                case "holderName":
                    orderByExpr = schema_1.withdrawalPaymentAccounts.holderName;
                    break;
                case "provider":
                    orderByExpr = schema_1.withdrawalPaymentAccounts.provider;
                    break;
                case "updatedAt":
                    orderByExpr = schema_1.withdrawalPaymentAccounts.updatedAt;
                    break;
                default:
                    orderByExpr = schema_1.withdrawalPaymentAccounts.createdAt;
            }
            // Main query with joins
            const results = await connection_1.db
                .select({
                id: schema_1.withdrawalPaymentAccounts.id,
                userId: schema_1.withdrawalPaymentAccounts.userId,
                paymentGatewayId: schema_1.withdrawalPaymentAccounts.paymentGatewayId,
                accountNumber: schema_1.withdrawalPaymentAccounts.accountNumber,
                holderName: schema_1.withdrawalPaymentAccounts.holderName,
                provider: schema_1.withdrawalPaymentAccounts.provider,
                bankName: schema_1.withdrawalPaymentAccounts.bankName,
                branchName: schema_1.withdrawalPaymentAccounts.branchName,
                branchAddress: schema_1.withdrawalPaymentAccounts.branchAddress,
                swiftCode: schema_1.withdrawalPaymentAccounts.swiftCode,
                iban: schema_1.withdrawalPaymentAccounts.iban,
                routingNumber: schema_1.withdrawalPaymentAccounts.routingNumber,
                walletAddress: schema_1.withdrawalPaymentAccounts.walletAddress,
                network: schema_1.withdrawalPaymentAccounts.network,
                accountHolderPhone: schema_1.withdrawalPaymentAccounts.accountHolderPhone,
                accountHolderEmail: schema_1.withdrawalPaymentAccounts.accountHolderEmail,
                country: schema_1.withdrawalPaymentAccounts.country,
                state: schema_1.withdrawalPaymentAccounts.state,
                city: schema_1.withdrawalPaymentAccounts.city,
                address: schema_1.withdrawalPaymentAccounts.address,
                postalCode: schema_1.withdrawalPaymentAccounts.postalCode,
                isPrimary: schema_1.withdrawalPaymentAccounts.isPrimary,
                isVerified: schema_1.withdrawalPaymentAccounts.isVerified,
                isActive: schema_1.withdrawalPaymentAccounts.isActive,
                verificationStatus: schema_1.withdrawalPaymentAccounts.verificationStatus,
                verificationNotes: schema_1.withdrawalPaymentAccounts.verificationNotes,
                minWithdrawalAmount: schema_1.withdrawalPaymentAccounts.minWithdrawalAmount,
                maxWithdrawalAmount: schema_1.withdrawalPaymentAccounts.maxWithdrawalAmount,
                withdrawalFee: schema_1.withdrawalPaymentAccounts.withdrawalFee,
                processingTime: schema_1.withdrawalPaymentAccounts.processingTime,
                additionalInfo: schema_1.withdrawalPaymentAccounts.additionalInfo,
                createdBy: schema_1.withdrawalPaymentAccounts.createdBy,
                updatedBy: schema_1.withdrawalPaymentAccounts.updatedBy,
                createdAt: schema_1.withdrawalPaymentAccounts.createdAt,
                updatedAt: schema_1.withdrawalPaymentAccounts.updatedAt,
                user: {
                    id: schema_1.users.id,
                    username: schema_1.users.username,
                    email: schema_1.users.email,
                },
                paymentGateway: {
                    id: schema_1.paymentGateway.id,
                    name: schema_1.paymentGateway.name,
                    methodId: schema_1.paymentGateway.methodId,
                    status: schema_1.paymentGateway.status,
                },
            })
                .from(schema_1.withdrawalPaymentAccounts)
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.userId, schema_1.users.id))
                .leftJoin(schema_1.paymentGateway, (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.paymentGatewayId, schema_1.paymentGateway.id))
                .where(whereClause)
                .orderBy(sortOrder === "desc" ? (0, drizzle_orm_1.desc)(orderByExpr) : (0, drizzle_orm_1.asc)(orderByExpr))
                .limit(limit)
                .offset(offset);
            // Calculate pagination
            const currentOffset = filters.offset || 0;
            const currentLimit = filters.limit || 50;
            const page = Math.floor(currentOffset / currentLimit) + 1;
            const pageSize = currentLimit;
            const totalPages = Math.ceil(total / currentLimit);
            return {
                data: results,
                total,
                pagination: {
                    page,
                    pageSize,
                    total,
                    totalPages,
                },
            };
        }
        catch (error) {
            console.error("Error fetching withdrawal payment accounts with filters:", error);
            throw error;
        }
    },
    // Get all withdrawal payment accounts for a specific user
    async getByUserId(userId) {
        try {
            const results = await connection_1.db
                .select({
                id: schema_1.withdrawalPaymentAccounts.id,
                userId: schema_1.withdrawalPaymentAccounts.userId,
                paymentGatewayId: schema_1.withdrawalPaymentAccounts.paymentGatewayId,
                accountNumber: schema_1.withdrawalPaymentAccounts.accountNumber,
                holderName: schema_1.withdrawalPaymentAccounts.holderName,
                provider: schema_1.withdrawalPaymentAccounts.provider,
                bankName: schema_1.withdrawalPaymentAccounts.bankName,
                branchName: schema_1.withdrawalPaymentAccounts.branchName,
                branchAddress: schema_1.withdrawalPaymentAccounts.branchAddress,
                swiftCode: schema_1.withdrawalPaymentAccounts.swiftCode,
                iban: schema_1.withdrawalPaymentAccounts.iban,
                routingNumber: schema_1.withdrawalPaymentAccounts.routingNumber,
                walletAddress: schema_1.withdrawalPaymentAccounts.walletAddress,
                network: schema_1.withdrawalPaymentAccounts.network,
                accountHolderPhone: schema_1.withdrawalPaymentAccounts.accountHolderPhone,
                accountHolderEmail: schema_1.withdrawalPaymentAccounts.accountHolderEmail,
                country: schema_1.withdrawalPaymentAccounts.country,
                state: schema_1.withdrawalPaymentAccounts.state,
                city: schema_1.withdrawalPaymentAccounts.city,
                address: schema_1.withdrawalPaymentAccounts.address,
                postalCode: schema_1.withdrawalPaymentAccounts.postalCode,
                isPrimary: schema_1.withdrawalPaymentAccounts.isPrimary,
                isVerified: schema_1.withdrawalPaymentAccounts.isVerified,
                isActive: schema_1.withdrawalPaymentAccounts.isActive,
                verificationStatus: schema_1.withdrawalPaymentAccounts.verificationStatus,
                verificationNotes: schema_1.withdrawalPaymentAccounts.verificationNotes,
                minWithdrawalAmount: schema_1.withdrawalPaymentAccounts.minWithdrawalAmount,
                maxWithdrawalAmount: schema_1.withdrawalPaymentAccounts.maxWithdrawalAmount,
                withdrawalFee: schema_1.withdrawalPaymentAccounts.withdrawalFee,
                processingTime: schema_1.withdrawalPaymentAccounts.processingTime,
                additionalInfo: schema_1.withdrawalPaymentAccounts.additionalInfo,
                createdBy: schema_1.withdrawalPaymentAccounts.createdBy,
                updatedBy: schema_1.withdrawalPaymentAccounts.updatedBy,
                createdAt: schema_1.withdrawalPaymentAccounts.createdAt,
                updatedAt: schema_1.withdrawalPaymentAccounts.updatedAt,
                user: {
                    id: schema_1.users.id,
                    username: schema_1.users.username,
                    email: schema_1.users.email,
                },
                paymentGateway: {
                    id: schema_1.paymentGateway.id,
                    name: schema_1.paymentGateway.name,
                    methodId: schema_1.paymentGateway.methodId,
                    status: schema_1.paymentGateway.status,
                },
            })
                .from(schema_1.withdrawalPaymentAccounts)
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.userId, schema_1.users.id))
                .leftJoin(schema_1.paymentGateway, (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.paymentGatewayId, schema_1.paymentGateway.id))
                .where((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.userId, userId))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.withdrawalPaymentAccounts.isPrimary), (0, drizzle_orm_1.desc)(schema_1.withdrawalPaymentAccounts.createdAt));
            return results;
        }
        catch (error) {
            console.error("Error fetching withdrawal payment accounts by user ID:", error);
            throw error;
        }
    },
    // Get primary withdrawal payment account for a user
    async getPrimaryByUserId(userId) {
        try {
            const [result] = await connection_1.db
                .select({
                id: schema_1.withdrawalPaymentAccounts.id,
                userId: schema_1.withdrawalPaymentAccounts.userId,
                paymentGatewayId: schema_1.withdrawalPaymentAccounts.paymentGatewayId,
                accountNumber: schema_1.withdrawalPaymentAccounts.accountNumber,
                holderName: schema_1.withdrawalPaymentAccounts.holderName,
                provider: schema_1.withdrawalPaymentAccounts.provider,
                bankName: schema_1.withdrawalPaymentAccounts.bankName,
                branchName: schema_1.withdrawalPaymentAccounts.branchName,
                branchAddress: schema_1.withdrawalPaymentAccounts.branchAddress,
                swiftCode: schema_1.withdrawalPaymentAccounts.swiftCode,
                iban: schema_1.withdrawalPaymentAccounts.iban,
                routingNumber: schema_1.withdrawalPaymentAccounts.routingNumber,
                walletAddress: schema_1.withdrawalPaymentAccounts.walletAddress,
                network: schema_1.withdrawalPaymentAccounts.network,
                accountHolderPhone: schema_1.withdrawalPaymentAccounts.accountHolderPhone,
                accountHolderEmail: schema_1.withdrawalPaymentAccounts.accountHolderEmail,
                country: schema_1.withdrawalPaymentAccounts.country,
                state: schema_1.withdrawalPaymentAccounts.state,
                city: schema_1.withdrawalPaymentAccounts.city,
                address: schema_1.withdrawalPaymentAccounts.address,
                postalCode: schema_1.withdrawalPaymentAccounts.postalCode,
                isPrimary: schema_1.withdrawalPaymentAccounts.isPrimary,
                isVerified: schema_1.withdrawalPaymentAccounts.isVerified,
                isActive: schema_1.withdrawalPaymentAccounts.isActive,
                verificationStatus: schema_1.withdrawalPaymentAccounts.verificationStatus,
                verificationNotes: schema_1.withdrawalPaymentAccounts.verificationNotes,
                minWithdrawalAmount: schema_1.withdrawalPaymentAccounts.minWithdrawalAmount,
                maxWithdrawalAmount: schema_1.withdrawalPaymentAccounts.maxWithdrawalAmount,
                withdrawalFee: schema_1.withdrawalPaymentAccounts.withdrawalFee,
                processingTime: schema_1.withdrawalPaymentAccounts.processingTime,
                additionalInfo: schema_1.withdrawalPaymentAccounts.additionalInfo,
                createdBy: schema_1.withdrawalPaymentAccounts.createdBy,
                updatedBy: schema_1.withdrawalPaymentAccounts.updatedBy,
                createdAt: schema_1.withdrawalPaymentAccounts.createdAt,
                updatedAt: schema_1.withdrawalPaymentAccounts.updatedAt,
                user: {
                    id: schema_1.users.id,
                    username: schema_1.users.username,
                    email: schema_1.users.email,
                },
                paymentGateway: {
                    id: schema_1.paymentGateway.id,
                    name: schema_1.paymentGateway.name,
                    methodId: schema_1.paymentGateway.methodId,
                    status: schema_1.paymentGateway.status,
                },
            })
                .from(schema_1.withdrawalPaymentAccounts)
                .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.userId, schema_1.users.id))
                .leftJoin(schema_1.paymentGateway, (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.paymentGatewayId, schema_1.paymentGateway.id))
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.userId, userId), (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.isPrimary, true), (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.isActive, true)))
                .limit(1);
            return result || null;
        }
        catch (error) {
            console.error("Error fetching primary withdrawal payment account:", error);
            throw error;
        }
    },
    // Update withdrawal payment account
    async update(id, data) {
        try {
            // If this is set as primary, unset other primary accounts for the same user
            if (data.isPrimary && data.userId) {
                await connection_1.db
                    .update(schema_1.withdrawalPaymentAccounts)
                    .set({ isPrimary: false })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.userId, data.userId), (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.isPrimary, true), (0, drizzle_orm_1.sql) `${schema_1.withdrawalPaymentAccounts.id} != ${id}`));
            }
            await connection_1.db
                .update(schema_1.withdrawalPaymentAccounts)
                .set({
                ...data,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.id, id));
            // Fetch the updated record with user details
            return await this.getById(id);
        }
        catch (error) {
            console.error("Error updating withdrawal payment account:", error);
            throw error;
        }
    },
    // Delete withdrawal payment account
    async delete(id) {
        try {
            const result = await connection_1.db
                .delete(schema_1.withdrawalPaymentAccounts)
                .where((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.id, id));
            // For MySQL2, we need to check if the operation was successful
            return true; // If no error was thrown, the operation was successful
        }
        catch (error) {
            console.error("Error deleting withdrawal payment account:", error);
            return false;
        }
    },
    // Soft delete (deactivate) withdrawal payment account
    async deactivate(id) {
        try {
            await connection_1.db
                .update(schema_1.withdrawalPaymentAccounts)
                .set({
                isActive: false,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.id, id));
            return true; // If no error was thrown, the operation was successful
        }
        catch (error) {
            console.error("Error deactivating withdrawal payment account:", error);
            return false;
        }
    },
    // Set account as primary
    async setAsPrimary(id, userId) {
        try {
            // Unset other primary accounts for the same user
            await connection_1.db
                .update(schema_1.withdrawalPaymentAccounts)
                .set({ isPrimary: false })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.userId, userId), (0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.isPrimary, true)));
            // Set this account as primary
            await connection_1.db
                .update(schema_1.withdrawalPaymentAccounts)
                .set({
                isPrimary: true,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.id, id));
            return true; // If no error was thrown, the operation was successful
        }
        catch (error) {
            console.error("Error setting withdrawal payment account as primary:", error);
            return false;
        }
    },
    // Update verification status
    async updateVerificationStatus(id, status, notes) {
        try {
            await connection_1.db
                .update(schema_1.withdrawalPaymentAccounts)
                .set({
                verificationStatus: status,
                verificationNotes: notes,
                updatedAt: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.id, id));
            return true; // If no error was thrown, the operation was successful
        }
        catch (error) {
            console.error("Error updating verification status:", error);
            return false;
        }
    },
    // Get account statistics
    async getAccountStats(userId) {
        try {
            const whereConditions = [];
            if (userId) {
                whereConditions.push((0, drizzle_orm_1.eq)(schema_1.withdrawalPaymentAccounts.userId, userId));
            }
            const whereClause = whereConditions.length > 0 ? (0, drizzle_orm_1.and)(...whereConditions) : undefined;
            // Get basic counts
            const [stats] = await connection_1.db
                .select({
                totalAccounts: (0, drizzle_orm_1.sql) `COUNT(*)`,
                activeAccounts: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.withdrawalPaymentAccounts.isActive} = true THEN 1 END)`,
                verifiedAccounts: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.withdrawalPaymentAccounts.verificationStatus} = 'verified' THEN 1 END)`,
                pendingVerification: (0, drizzle_orm_1.sql) `COUNT(CASE WHEN ${schema_1.withdrawalPaymentAccounts.verificationStatus} = 'pending' THEN 1 END)`,
            })
                .from(schema_1.withdrawalPaymentAccounts)
                .where(whereClause);
            // Get providers distribution
            const providers = await connection_1.db
                .select({
                provider: schema_1.withdrawalPaymentAccounts.provider,
                count: (0, drizzle_orm_1.sql) `COUNT(*)`,
            })
                .from(schema_1.withdrawalPaymentAccounts)
                .where(whereClause)
                .groupBy(schema_1.withdrawalPaymentAccounts.provider)
                .orderBy((0, drizzle_orm_1.desc)((0, drizzle_orm_1.sql) `COUNT(*)`));
            return {
                totalAccounts: stats.totalAccounts || 0,
                activeAccounts: stats.activeAccounts || 0,
                verifiedAccounts: stats.verifiedAccounts || 0,
                pendingVerification: stats.pendingVerification || 0,
                providers: providers.map(p => ({
                    provider: p.provider || "unknown",
                    count: p.count || 0,
                })),
            };
        }
        catch (error) {
            console.error("Error fetching account statistics:", error);
            throw error;
        }
    },
};
