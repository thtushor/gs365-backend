"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayModel = void 0;
const connection_1 = require("../db/connection");
const paymentGateway_1 = require("../db/schema/paymentGateway");
const drizzle_orm_1 = require("drizzle-orm");
const paymentMethods_model_1 = require("./paymentMethods.model");
const paymentMethodsTypes_model_1 = require("./paymentMethodsTypes.model");
const country_1 = require("../db/schema/country");
const schema_1 = require("../db/schema");
const paymentMethodsTypes_controller_1 = require("../controllers/paymentMethodsTypes.controller");
exports.PaymentGatewayModel = {
    async getAll(filter = {}) {
        const whereCondition = [];
        if (filter.status)
            whereCondition.push((0, drizzle_orm_1.eq)(paymentGateway_1.paymentGateway.status, filter.status));
        if (filter.countryId)
            whereCondition.push((0, drizzle_orm_1.eq)(paymentGateway_1.paymentGateway.countryId, filter.countryId));
        if (filter.methodId)
            whereCondition.push((0, drizzle_orm_1.eq)(paymentGateway_1.paymentGateway.methodId, Number(filter.methodId)));
        if (filter.name)
            whereCondition.push((0, drizzle_orm_1.like)(paymentGateway_1.paymentGateway.name, `%${filter.name}%`));
        if (filter.network)
            whereCondition.push((0, drizzle_orm_1.like)(paymentGateway_1.paymentGateway.network, `%${filter.network}%`));
        if (filter.paymentMethodTypeId) {
            whereCondition.push((0, drizzle_orm_1.sql) `JSON_CONTAINS(${paymentGateway_1.paymentGateway.paymentMethodTypeIds}, CAST(${filter.paymentMethodTypeId} AS JSON))`);
        }
        return connection_1.db
            .select()
            .from(paymentGateway_1.paymentGateway)
            .where(whereCondition.length ? (0, drizzle_orm_1.and)(...whereCondition) : undefined);
    },
    async getById(id) {
        const result = await connection_1.db
            .select({
            id: paymentGateway_1.paymentGateway.id,
            name: paymentGateway_1.paymentGateway.name,
            network: paymentGateway_1.paymentGateway.network,
            status: paymentGateway_1.paymentGateway.status,
            countryId: paymentGateway_1.paymentGateway.countryId,
            methodId: paymentGateway_1.paymentGateway.methodId,
            paymentMethodTypeIds: paymentGateway_1.paymentGateway.paymentMethodTypeIds,
            minDeposit: paymentGateway_1.paymentGateway.minDeposit,
            maxDeposit: paymentGateway_1.paymentGateway.maxDeposit,
            minWithdraw: paymentGateway_1.paymentGateway.minWithdraw,
            maxWithdraw: paymentGateway_1.paymentGateway.maxWithdraw,
            bonus: paymentGateway_1.paymentGateway.bonus,
            paymentMethods: {
                id: schema_1.paymentMethods.id,
                name: schema_1.paymentMethods.name,
                status: schema_1.paymentMethods.status,
            },
            country: {
                id: country_1.countries.id,
                name: country_1.countries.name,
                flagUrl: country_1.countries.flagUrl,
                code: country_1.countries.code,
                currencyId: country_1.countries.currencyId,
                status: country_1.countries.status,
            },
        })
            .from(paymentGateway_1.paymentGateway)
            .leftJoin(schema_1.paymentMethods, (0, drizzle_orm_1.eq)(paymentGateway_1.paymentGateway.methodId, schema_1.paymentMethods.id))
            .leftJoin(country_1.countries, (0, drizzle_orm_1.eq)(country_1.countries.id, paymentGateway_1.paymentGateway.countryId))
            .where((0, drizzle_orm_1.eq)(paymentGateway_1.paymentGateway.id, id));
        let paymentTypes = typeof result[0].paymentMethodTypeIds === "string"
            ? JSON.parse(result[0].paymentMethodTypeIds)
            : result[0].paymentMethodTypeIds || [];
        paymentTypes = Array.isArray(paymentTypes) ? paymentTypes : [];
        const paymentTypesPopulate = [];
        await Promise.all(paymentTypes.map(async (value) => {
            if (value) {
                const paymentMethodType = await (0, paymentMethodsTypes_controller_1.getPaymentMethodTypeByIdWithoutResponsse)(value);
                if (paymentMethodType)
                    paymentTypesPopulate.push(paymentMethodType);
            }
        }));
        return [
            {
                ...result[0],
                paymentTypes: paymentTypesPopulate,
            },
        ];
    },
    async create(data) {
        // Validate methodId
        const method = await paymentMethods_model_1.PaymentMethodModel.getById(data.methodId);
        if (!method || method.length === 0) {
            throw new Error("Invalid payment method id");
        }
        console.log("test");
        // Validate paymentMethodTypeIds (array of numbers)
        if (!Array.isArray(data.paymentMethodTypeIds)) {
            throw new Error("paymentMethodTypeIds must be an array of numbers");
        }
        for (const typeId of data.paymentMethodTypeIds) {
            const type = await paymentMethodsTypes_model_1.PaymentMethodTypesModel.getById(typeId);
            if (!type || type.length === 0) {
                throw new Error(`Invalid payment method type id: ${typeId}`);
            }
        }
        if (!data.countryId) {
            throw new Error(`Invalid country id`);
        }
        // Validate countryId
        const country = await connection_1.db
            .select()
            .from(country_1.countries)
            .where((0, drizzle_orm_1.eq)(country_1.countries.id, data.countryId));
        if (!country || country.length === 0) {
            throw new Error("Invalid country id");
        }
        return connection_1.db.insert(paymentGateway_1.paymentGateway).values({
            name: data.name,
            methodId: data.methodId,
            paymentMethodTypeIds: data.paymentMethodTypeIds, // JSON handled by Drizzle
            iconUrl: data.iconUrl,
            minDeposit: data.minDeposit,
            maxDeposit: data.maxDeposit,
            minWithdraw: data.minWithdraw,
            maxWithdraw: data.maxWithdraw,
            bonus: data.bonus,
            status: data.status, // maps to status
            // statusDeposit: "active",           // or use data.statusDeposit if your payload includes it
            countryId: data.countryId,
            network: data.network,
            currencyConversionRate: data.currencyConversionRate,
        });
    },
    async update(id, data) {
        return connection_1.db
            .update(paymentGateway_1.paymentGateway)
            .set(data)
            .where((0, drizzle_orm_1.sql) `${paymentGateway_1.paymentGateway.id} = ${id}`);
    },
    async delete(id) {
        return connection_1.db.delete(paymentGateway_1.paymentGateway).where((0, drizzle_orm_1.sql) `${paymentGateway_1.paymentGateway.id} = ${id}`);
    },
};
