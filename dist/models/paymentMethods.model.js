"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodModel = void 0;
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const paymentMethods_1 = require("../db/schema/paymentMethods");
const drizzle_orm_1 = require("drizzle-orm");
const paymentMethodsTypes_model_1 = require("./paymentMethodsTypes.model");
exports.PaymentMethodModel = {
    async getAll(filter) {
        return connection_1.db
            .select()
            .from(paymentMethods_1.paymentMethods)
            .where((0, drizzle_orm_1.and)(filter.status ? (0, drizzle_orm_1.eq)(paymentMethods_1.paymentMethods.status, filter.status) : undefined, filter.name ? (0, drizzle_orm_1.eq)(paymentMethods_1.paymentMethods.name, filter.name) : undefined));
    },
    async getById(id) {
        return connection_1.db.select().from(paymentMethods_1.paymentMethods).where((0, drizzle_orm_1.eq)(paymentMethods_1.paymentMethods.id, id));
    },
    async getPaymentMethodByName(name, { status }) {
        const method = await connection_1.db
            .select()
            .from(paymentMethods_1.paymentMethods)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(paymentMethods_1.paymentMethods.name, name), status ? (0, drizzle_orm_1.eq)(paymentMethods_1.paymentMethods.status, status) : undefined));
        if (!method.length) {
            return [];
        }
        const paymentGatewaysWithProviders = await connection_1.db
            .select({
            gateway: schema_1.paymentGateway,
            provider: schema_1.paymentProvider,
            gatewayProvider: schema_1.paymentGatewayProvider,
        })
            .from(schema_1.paymentGateway)
            .leftJoin(schema_1.paymentGatewayProvider, (0, drizzle_orm_1.eq)(schema_1.paymentGatewayProvider.gatewayId, schema_1.paymentGateway.id))
            .leftJoin(schema_1.paymentProvider, (0, drizzle_orm_1.eq)(schema_1.paymentProvider.id, schema_1.paymentGatewayProvider.providerId))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.paymentGateway.methodId, method[0].id), (0, drizzle_orm_1.eq)(schema_1.paymentGateway.status, "active"), (0, drizzle_orm_1.eq)(schema_1.paymentGatewayProvider.status, "active"), (0, drizzle_orm_1.eq)(schema_1.paymentProvider.status, "active")));
        // Group gateways with their providers
        const gatewaysMap = new Map();
        // Process each row and fetch payment method types
        for (const row of paymentGatewaysWithProviders) {
            const gatewayId = row.gateway.id;
            if (!gatewaysMap.has(gatewayId)) {
                let parsedPaymentMethodTypeIds = [];
                try {
                    if (row?.gateway?.paymentMethodTypeIds) {
                        parsedPaymentMethodTypeIds = Array.isArray(row.gateway.paymentMethodTypeIds)
                            ? row.gateway.paymentMethodTypeIds
                            : JSON.parse(row.gateway.paymentMethodTypeIds);
                    }
                }
                catch (error) {
                    console.error("Error parsing paymentMethodTypeIds:", error);
                    parsedPaymentMethodTypeIds = [];
                }
                const purifiedPaymentMethodType = typeof parsedPaymentMethodTypeIds === "string"
                    ? []
                    : parsedPaymentMethodTypeIds;
                // Fetch payment method types data for each ID
                const paymentMethodTypesData = [];
                for (const typeId of purifiedPaymentMethodType) {
                    try {
                        const typeData = await paymentMethodsTypes_model_1.PaymentMethodTypesModel.getById(Number(typeId));
                        if (typeData && typeData.length > 0) {
                            paymentMethodTypesData.push(typeData[0]);
                        }
                    }
                    catch (error) {
                        console.error(`Error fetching payment method type ${typeId}:`, error);
                    }
                }
                gatewaysMap.set(gatewayId, {
                    ...row.gateway,
                    paymentMethodTypeIds: typeof parsedPaymentMethodTypeIds === "string"
                        ? []
                        : parsedPaymentMethodTypeIds,
                    paymentMethodTypes: paymentMethodTypesData,
                    providers: [],
                });
            }
            const accountData = row?.gatewayProvider?.id
                ? await connection_1.db
                    .select()
                    .from(schema_1.paymentGatewayProviderAccount)
                    .where((0, drizzle_orm_1.eq)(schema_1.paymentGatewayProviderAccount.paymentGatewayProviderId, row?.gatewayProvider?.id))
                    .limit(1)
                : [];
            if (row.provider) {
                const existingProvider = gatewaysMap
                    .get(gatewayId)
                    .providers.find((p) => p.id === row.provider?.id);
                if (!existingProvider && row.provider) {
                    gatewaysMap.get(gatewayId).providers.push({
                        ...row.provider,
                        licenseKey: row?.gatewayProvider?.licenseKey,
                        commission: row?.gatewayProvider?.commission,
                        isRecomended: row?.gatewayProvider?.isRecommended,
                        gatewayProvider: {
                            ...row?.gatewayProvider,
                            account: accountData,
                        },
                    });
                }
            }
        }
        const paymentGateways = Array.from(gatewaysMap.values());
        return [
            {
                ...method[0],
                paymentGateways,
            },
        ];
    },
    async create(data) {
        return connection_1.db.insert(paymentMethods_1.paymentMethods).values(data);
    },
    async update(id, data) {
        return connection_1.db
            .update(paymentMethods_1.paymentMethods)
            .set(data)
            .where((0, drizzle_orm_1.sql) `${paymentMethods_1.paymentMethods.id} = ${id}`);
    },
    async delete(id) {
        return connection_1.db.delete(paymentMethods_1.paymentMethods).where((0, drizzle_orm_1.sql) `${paymentMethods_1.paymentMethods.id} = ${id}`);
    },
};
