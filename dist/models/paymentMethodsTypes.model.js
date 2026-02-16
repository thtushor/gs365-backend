"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodTypesModel = void 0;
const connection_1 = require("../db/connection");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
exports.PaymentMethodTypesModel = {
    async getAll(filter) {
        return connection_1.db
            .select({
            id: schema_1.paymentMethodTypes.id,
            name: schema_1.paymentMethodTypes.name,
            paymentMethodId: schema_1.paymentMethodTypes.paymentMethodId,
            status: schema_1.paymentMethodTypes.status,
            paymentMethod: {
                id: schema_1.paymentMethods.id,
                name: schema_1.paymentMethods.name,
                status: schema_1.paymentMethods.status,
            },
        })
            .from(schema_1.paymentMethodTypes)
            .leftJoin(schema_1.paymentMethods, (0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, schema_1.paymentMethodTypes.paymentMethodId))
            .where(filter?.status
            ? (0, drizzle_orm_1.eq)(schema_1.paymentMethodTypes.status, filter.status)
            : undefined);
    },
    async getById(id) {
        return connection_1.db
            .select({
            id: schema_1.paymentMethodTypes.id,
            name: schema_1.paymentMethodTypes.name,
            paymentMethodId: schema_1.paymentMethodTypes.paymentMethodId,
            status: schema_1.paymentMethodTypes.status,
            paymentMethod: {
                id: schema_1.paymentMethods.id,
                name: schema_1.paymentMethods.name,
                status: schema_1.paymentMethods.status,
            },
        })
            .from(schema_1.paymentMethodTypes)
            .leftJoin(schema_1.paymentMethods, (0, drizzle_orm_1.eq)(schema_1.paymentMethods.id, schema_1.paymentMethodTypes.paymentMethodId))
            .where((0, drizzle_orm_1.sql) `${schema_1.paymentMethodTypes.id} = ${id}`);
    },
    async create(data) {
        return connection_1.db.insert(schema_1.paymentMethodTypes).values(data);
    },
    async update(id, data) {
        return connection_1.db
            .update(schema_1.paymentMethodTypes)
            .set(data)
            .where((0, drizzle_orm_1.sql) `${schema_1.paymentMethodTypes.id} = ${id}`);
    },
    async delete(id) {
        return connection_1.db
            .delete(schema_1.paymentMethodTypes)
            .where((0, drizzle_orm_1.sql) `${schema_1.paymentMethodTypes.id} = ${id}`);
    },
};
