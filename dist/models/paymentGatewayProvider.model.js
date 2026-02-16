"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayProviderModel = void 0;
const connection_1 = require("../db/connection");
const paymentGatewayProvider_1 = require("../db/schema/paymentGatewayProvider");
const paymentGateway_1 = require("../db/schema/paymentGateway");
const paymentProvider_1 = require("../db/schema/paymentProvider");
const drizzle_orm_1 = require("drizzle-orm");
exports.PaymentGatewayProviderModel = {
    async getAll(filter = {}) {
        const whereCondition = [];
        if (filter.gatewayId)
            whereCondition.push((0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.gatewayId, filter.gatewayId));
        if (filter.providerId)
            whereCondition.push((0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.providerId, filter.providerId));
        if (filter.status) {
            whereCondition.push((0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.status, filter.status));
        }
        // Pagination parameters
        const page = parseInt(filter.page) || 1;
        const pageSize = parseInt(filter.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        // Get total count for pagination
        const totalCount = await connection_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(paymentGatewayProvider_1.paymentGatewayProvider)
            .where(whereCondition.length ? (0, drizzle_orm_1.and)(...whereCondition) : undefined);
        // Get paginated data
        const data = await connection_1.db
            .select({
            id: paymentGatewayProvider_1.paymentGatewayProvider.id,
            gatewayId: paymentGatewayProvider_1.paymentGatewayProvider.gatewayId,
            providerId: paymentGatewayProvider_1.paymentGatewayProvider.providerId,
            priority: paymentGatewayProvider_1.paymentGatewayProvider.priority,
            status: paymentGatewayProvider_1.paymentGatewayProvider.status,
            isRecommended: paymentGatewayProvider_1.paymentGatewayProvider?.isRecommended,
            licenseKey: paymentGatewayProvider_1.paymentGatewayProvider?.licenseKey,
            commission: paymentGatewayProvider_1.paymentGatewayProvider?.commission || 0,
            provider: {
                id: paymentProvider_1.paymentProvider.id,
                name: paymentProvider_1.paymentProvider.name,
                contactInfo: paymentProvider_1.paymentProvider.contactInfo,
                commissionPercentage: paymentProvider_1.paymentProvider.commissionPercentage,
                status: paymentProvider_1.paymentProvider.status,
            },
            gateway: {
                id: paymentGateway_1.paymentGateway.id,
                name: paymentGateway_1.paymentGateway.name,
                methodId: paymentGateway_1.paymentGateway.methodId,
                status: paymentGateway_1.paymentGateway.status,
                iconUrl: paymentGateway_1.paymentGateway.iconUrl,
                minDeposit: paymentGateway_1.paymentGateway.minDeposit,
                maxDeposit: paymentGateway_1.paymentGateway.maxDeposit,
                minWithdraw: paymentGateway_1.paymentGateway.minWithdraw,
                maxWithdraw: paymentGateway_1.paymentGateway.maxWithdraw,
                countryId: paymentGateway_1.paymentGateway.countryId,
                network: paymentGateway_1.paymentGateway.network,
                currencyConversionRate: paymentGateway_1.paymentGateway.currencyConversionRate,
            },
        })
            .from(paymentGatewayProvider_1.paymentGatewayProvider)
            .leftJoin(paymentGateway_1.paymentGateway, (0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.gatewayId, paymentGateway_1.paymentGateway.id))
            .leftJoin(paymentProvider_1.paymentProvider, (0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.providerId, paymentProvider_1.paymentProvider.id))
            .where(whereCondition.length ? (0, drizzle_orm_1.and)(...whereCondition) : undefined)
            .limit(pageSize)
            .offset(offset)
            .orderBy((0, drizzle_orm_1.asc)(paymentGatewayProvider_1.paymentGatewayProvider.priority), (0, drizzle_orm_1.desc)(paymentGatewayProvider_1.paymentGatewayProvider.id));
        return {
            data,
            pagination: {
                page,
                pageSize: pageSize,
                total: totalCount[0]?.count || 0,
                totalPages: Math.ceil((totalCount[0]?.count || 0) / pageSize),
                hasNext: page < Math.ceil((totalCount[0]?.count || 0) / pageSize),
                hasPrev: page > 1,
            },
        };
    },
    async getByGatewayId(gatewayId) {
        return connection_1.db
            .select({
            id: paymentGatewayProvider_1.paymentGatewayProvider.id,
            gatewayId: paymentGatewayProvider_1.paymentGatewayProvider.gatewayId,
            providerId: paymentGatewayProvider_1.paymentGatewayProvider.providerId,
            priority: paymentGatewayProvider_1.paymentGatewayProvider.priority,
            status: paymentGatewayProvider_1.paymentGatewayProvider.status,
            provider: {
                id: paymentProvider_1.paymentProvider.id,
                name: paymentProvider_1.paymentProvider.name,
                contactInfo: paymentProvider_1.paymentProvider.contactInfo,
                commissionPercentage: paymentProvider_1.paymentProvider.commissionPercentage,
                status: paymentProvider_1.paymentProvider.status,
            },
            gateway: {
                id: paymentGateway_1.paymentGateway.id,
                name: paymentGateway_1.paymentGateway.name,
                methodId: paymentGateway_1.paymentGateway.methodId,
                status: paymentGateway_1.paymentGateway.status,
                iconUrl: paymentGateway_1.paymentGateway.iconUrl,
                minDeposit: paymentGateway_1.paymentGateway.minDeposit,
                maxDeposit: paymentGateway_1.paymentGateway.maxDeposit,
                minWithdraw: paymentGateway_1.paymentGateway.minWithdraw,
                maxWithdraw: paymentGateway_1.paymentGateway.maxWithdraw,
                countryId: paymentGateway_1.paymentGateway.countryId,
                network: paymentGateway_1.paymentGateway.network,
                currencyConversionRate: paymentGateway_1.paymentGateway.currencyConversionRate,
            },
        })
            .from(paymentGatewayProvider_1.paymentGatewayProvider)
            .innerJoin(paymentProvider_1.paymentProvider, (0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.providerId, paymentProvider_1.paymentProvider.id))
            .innerJoin(paymentGateway_1.paymentGateway, (0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.gatewayId, paymentGateway_1.paymentGateway.id))
            .where((0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.gatewayId, gatewayId))
            .orderBy((0, drizzle_orm_1.asc)(paymentGatewayProvider_1.paymentGatewayProvider.priority), (0, drizzle_orm_1.desc)(paymentGatewayProvider_1.paymentGatewayProvider.id));
    },
    async getByProviderId(providerId, filter = {}) {
        const whereCondition = [(0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.providerId, providerId)];
        if (filter.status) {
            whereCondition.push((0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.status, filter.status));
        }
        // Pagination parameters
        const page = parseInt(filter.page) || 1;
        const pageSize = parseInt(filter.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        // Get total count for pagination
        const totalCount = await connection_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(paymentGatewayProvider_1.paymentGatewayProvider)
            .where((0, drizzle_orm_1.and)(...whereCondition));
        // Get paginated data
        const data = await connection_1.db
            .select({
            id: paymentGatewayProvider_1.paymentGatewayProvider.id,
            gatewayId: paymentGatewayProvider_1.paymentGatewayProvider.gatewayId,
            providerId: paymentGatewayProvider_1.paymentGatewayProvider.providerId,
            priority: paymentGatewayProvider_1.paymentGatewayProvider.priority,
            status: paymentGatewayProvider_1.paymentGatewayProvider.status,
            isRecommended: paymentGatewayProvider_1.paymentGatewayProvider?.isRecommended,
            licenseKey: paymentGatewayProvider_1.paymentGatewayProvider?.licenseKey,
            commission: paymentGatewayProvider_1.paymentGatewayProvider?.commission,
            provider: {
                id: paymentProvider_1.paymentProvider.id,
                name: paymentProvider_1.paymentProvider.name,
                contactInfo: paymentProvider_1.paymentProvider.contactInfo,
                commissionPercentage: paymentProvider_1.paymentProvider.commissionPercentage,
                status: paymentProvider_1.paymentProvider.status,
            },
            gateway: {
                id: paymentGateway_1.paymentGateway.id,
                name: paymentGateway_1.paymentGateway.name,
                methodId: paymentGateway_1.paymentGateway.methodId,
                status: paymentGateway_1.paymentGateway.status,
                iconUrl: paymentGateway_1.paymentGateway.iconUrl,
                minDeposit: paymentGateway_1.paymentGateway.minDeposit,
                maxDeposit: paymentGateway_1.paymentGateway.maxDeposit,
                minWithdraw: paymentGateway_1.paymentGateway.minWithdraw,
                maxWithdraw: paymentGateway_1.paymentGateway.maxWithdraw,
                countryId: paymentGateway_1.paymentGateway.countryId,
                network: paymentGateway_1.paymentGateway.network,
                currencyConversionRate: paymentGateway_1.paymentGateway.currencyConversionRate,
            },
        })
            .from(paymentGatewayProvider_1.paymentGatewayProvider)
            .innerJoin(paymentProvider_1.paymentProvider, (0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.providerId, paymentProvider_1.paymentProvider.id))
            .innerJoin(paymentGateway_1.paymentGateway, (0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.gatewayId, paymentGateway_1.paymentGateway.id))
            .where((0, drizzle_orm_1.and)(...whereCondition))
            .limit(pageSize)
            .offset(offset)
            .orderBy((0, drizzle_orm_1.asc)(paymentGatewayProvider_1.paymentGatewayProvider.priority), (0, drizzle_orm_1.desc)(paymentGatewayProvider_1.paymentGatewayProvider.id));
        return {
            data,
            pagination: {
                page,
                pageSize: pageSize,
                total: totalCount[0]?.count || 0,
                totalPages: Math.ceil((totalCount[0]?.count || 0) / pageSize),
                hasNext: page < Math.ceil((totalCount[0]?.count || 0) / pageSize),
                hasPrev: page > 1,
            },
        };
    },
    async create(data) {
        return connection_1.db.insert(paymentGatewayProvider_1.paymentGatewayProvider).values(data);
    },
    async update(id, data) {
        return connection_1.db
            .update(paymentGatewayProvider_1.paymentGatewayProvider)
            .set(data)
            .where((0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.id, id));
    },
    async delete(id) {
        return connection_1.db
            .delete(paymentGatewayProvider_1.paymentGatewayProvider)
            .where((0, drizzle_orm_1.sql) `${paymentGatewayProvider_1.paymentGatewayProvider.id} = ${id}`);
    },
    async deleteByGatewayAndProvider(gatewayId, providerId) {
        return connection_1.db
            .delete(paymentGatewayProvider_1.paymentGatewayProvider)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.gatewayId, gatewayId), (0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.providerId, providerId)));
    },
    async updateOtherRecommendations(gatewayId, excludeId) {
        return connection_1.db
            .update(paymentGatewayProvider_1.paymentGatewayProvider)
            .set({ isRecommended: false })
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(paymentGatewayProvider_1.paymentGatewayProvider.gatewayId, gatewayId), (0, drizzle_orm_1.sql) `${paymentGatewayProvider_1.paymentGatewayProvider.id} != ${excludeId}`));
    },
};
