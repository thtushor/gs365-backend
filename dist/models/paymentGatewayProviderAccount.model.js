"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayProviderAccountModel = void 0;
const connection_1 = require("../db/connection");
const paymentGatewayProviderAccount_1 = require("../db/schema/paymentGatewayProviderAccount");
const drizzle_orm_1 = require("drizzle-orm");
exports.PaymentGatewayProviderAccountModel = {
    async getAll(filter = {}) {
        const whereCondition = [];
        if (filter.paymentGatewayProviderId)
            whereCondition.push((0, drizzle_orm_1.eq)(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount.paymentGatewayProviderId, filter.paymentGatewayProviderId));
        if (filter.status)
            whereCondition.push((0, drizzle_orm_1.eq)(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount.status, filter.status));
        const page = parseInt(filter.page) || 1;
        const pageSize = parseInt(filter.pageSize) || 10;
        const offset = (page - 1) * pageSize;
        const totalCount = await connection_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount)
            .where(whereCondition.length ? (0, drizzle_orm_1.and)(...whereCondition) : undefined);
        const data = await connection_1.db
            .select()
            .from(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount)
            .where(whereCondition.length ? (0, drizzle_orm_1.and)(...whereCondition) : undefined)
            .limit(pageSize)
            .offset(offset)
            .orderBy(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount.id);
        return {
            data,
            pagination: {
                page,
                pageSize,
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
            .from(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount)
            .where((0, drizzle_orm_1.eq)(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount.id, id));
    },
    async getByProviderId(paymentGatewayProviderId) {
        return connection_1.db
            .select()
            .from(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount)
            .where((0, drizzle_orm_1.eq)(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount.paymentGatewayProviderId, paymentGatewayProviderId));
    },
    async create(data) {
        const [result] = await connection_1.db
            .insert(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount)
            .values(data)
            .$returningId();
        return this.getById(Number(result.id));
    },
    async update(id, data) {
        await connection_1.db
            .update(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount)
            .set(data)
            .where((0, drizzle_orm_1.eq)(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount.id, id));
        return this.getById(id);
    },
    async delete(id) {
        return connection_1.db
            .delete(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount)
            .where((0, drizzle_orm_1.eq)(paymentGatewayProviderAccount_1.paymentGatewayProviderAccount.id, id));
    },
};
