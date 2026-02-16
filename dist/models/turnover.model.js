"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurnoverModel = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../db/connection");
const turnover_1 = require("../db/schema/turnover");
const schema_1 = require("../db/schema");
exports.TurnoverModel = {
    async getAll(filter = {}) {
        const whereConditions = [];
        if (filter.userId)
            whereConditions.push((0, drizzle_orm_1.eq)(turnover_1.turnover.userId, Number(filter.userId)));
        if (filter.type)
            whereConditions.push((0, drizzle_orm_1.eq)(turnover_1.turnover.type, filter.type));
        if (filter.status)
            whereConditions.push((0, drizzle_orm_1.eq)(turnover_1.turnover.status, filter.status));
        if (filter.turnoverName)
            whereConditions.push((0, drizzle_orm_1.like)(turnover_1.turnover.turnoverName, `%${filter.turnoverName}%`));
        if (filter.transactionId)
            whereConditions.push((0, drizzle_orm_1.eq)(turnover_1.turnover.transactionId, Number(filter.transactionId)));
        if (filter.keyword) {
            const kw = `%${filter.keyword}%`;
            whereConditions.push((0, drizzle_orm_1.like)(turnover_1.turnover.turnoverName, kw));
        }
        const page = parseInt(String(filter.page ?? 1), 10) || 1;
        const pageSize = parseInt(String(filter.pageSize ?? 10), 10) || 10;
        const offset = (page - 1) * pageSize;
        const totalRows = await connection_1.db
            .select({ count: (0, drizzle_orm_1.sql) `count(*)` })
            .from(turnover_1.turnover)
            .where(whereConditions.length ? (0, drizzle_orm_1.and)(...whereConditions) : undefined);
        const data = await connection_1.db
            .select({
            id: turnover_1.turnover.id,
            userId: turnover_1.turnover.userId,
            transactionId: turnover_1.turnover.transactionId,
            type: turnover_1.turnover.type,
            status: turnover_1.turnover.status,
            turnoverName: turnover_1.turnover.turnoverName,
            depositAmount: turnover_1.turnover.depositAmount,
            targetTurnover: turnover_1.turnover.targetTurnover,
            remainingTurnover: turnover_1.turnover.remainingTurnover,
            createdAt: turnover_1.turnover.createdAt,
            updatedAt: turnover_1.turnover.updatedAt,
            bonusAmount: schema_1.transactions.bonusAmount, // extra column from transactions
        })
            .from(turnover_1.turnover)
            .where(whereConditions.length ? (0, drizzle_orm_1.and)(...whereConditions) : undefined)
            .leftJoin(schema_1.transactions, (0, drizzle_orm_1.eq)(schema_1.transactions.id, turnover_1.turnover.transactionId))
            .limit(pageSize)
            .offset(offset)
            .orderBy((0, drizzle_orm_1.desc)(turnover_1.turnover.id));
        const total = totalRows?.[0]?.count ?? 0;
        return {
            data,
            pagination: {
                page,
                pageSize,
                total,
                totalPages: Math.ceil(total / pageSize),
                hasNext: page < Math.ceil(total / pageSize),
                hasPrev: page > 1,
            },
        };
    },
    async getById(id) {
        return connection_1.db.select().from(turnover_1.turnover).where((0, drizzle_orm_1.eq)(turnover_1.turnover.id, id));
    },
    async create(data) {
        return connection_1.db.insert(turnover_1.turnover).values(data);
    },
    async update(id, data) {
        return connection_1.db.update(turnover_1.turnover).set(data).where((0, drizzle_orm_1.eq)(turnover_1.turnover.id, id));
    },
    async delete(id) {
        return connection_1.db.delete(turnover_1.turnover).where((0, drizzle_orm_1.eq)(turnover_1.turnover.id, id));
    },
};
