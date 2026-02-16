"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentProviderModel = void 0;
const connection_1 = require("../db/connection");
const paymentProvider_1 = require("../db/schema/paymentProvider");
const drizzle_orm_1 = require("drizzle-orm");
exports.PaymentProviderModel = {
    async getAll(filter = {}) {
        const whereCondition = [];
        if (filter.status)
            whereCondition.push((0, drizzle_orm_1.eq)(paymentProvider_1.paymentProvider.status, filter.status));
        if (filter.name)
            whereCondition.push((0, drizzle_orm_1.like)(paymentProvider_1.paymentProvider.name, `%${filter.name}%`));
        if (filter.commissionPercentage !== undefined)
            whereCondition.push((0, drizzle_orm_1.eq)(paymentProvider_1.paymentProvider.commissionPercentage, Number(filter.commissionPercentage)));
        // Pagination parameters
        const page = parseInt(filter.page) || 1;
        const pageSize = parseInt(filter.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        // Get total count for pagination
        const totalCount = await connection_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(paymentProvider_1.paymentProvider)
            .where(whereCondition.length ? (0, drizzle_orm_1.and)(...whereCondition) : undefined);
        // Get paginated data
        const data = await connection_1.db
            .select()
            .from(paymentProvider_1.paymentProvider)
            .where(whereCondition.length ? (0, drizzle_orm_1.and)(...whereCondition) : undefined)
            .limit(pageSize)
            .offset(offset)
            .orderBy(paymentProvider_1.paymentProvider.id);
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
    async getById(id) {
        return connection_1.db
            .select()
            .from(paymentProvider_1.paymentProvider)
            .where((0, drizzle_orm_1.sql) `${paymentProvider_1.paymentProvider.id} = ${id}`);
    },
    async create(data) {
        return connection_1.db.insert(paymentProvider_1.paymentProvider).values(data);
    },
    async update(id, data) {
        return connection_1.db
            .update(paymentProvider_1.paymentProvider)
            .set(data)
            .where((0, drizzle_orm_1.sql) `${paymentProvider_1.paymentProvider.id} = ${id}`);
    },
    async delete(id) {
        return connection_1.db.delete(paymentProvider_1.paymentProvider).where((0, drizzle_orm_1.sql) `${paymentProvider_1.paymentProvider.id} = ${id}`);
    },
};
