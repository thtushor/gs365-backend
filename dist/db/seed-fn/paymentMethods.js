"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedPaymentMethods = seedPaymentMethods;
exports.seedPaymentMethodTypes = seedPaymentMethodTypes;
const paymentMethods_1 = require("../schema/paymentMethods");
const connection_1 = require("../connection");
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../schema");
async function seedPaymentMethods() {
    const types = [
        { id: 1, name: "Local bank", status: "active" },
        { id: 2, name: "E wallet", status: "active" },
        { id: 3, name: "Crypto", status: "active" },
        { id: 4, name: "International", status: "active" },
    ];
    try {
        await connection_1.db
            .insert(paymentMethods_1.paymentMethods)
            .values(types)
            .onDuplicateKeyUpdate({
            set: {
                id: (0, drizzle_orm_1.sql) `values(${paymentMethods_1.paymentMethods.id})`,
                name: (0, drizzle_orm_1.sql) `values(${paymentMethods_1.paymentMethods.name})`,
                status: (0, drizzle_orm_1.sql) `values(${paymentMethods_1.paymentMethods.status})`,
            },
        });
        console.log("✅ Payment methods seeded successfully!");
    }
    catch (e) {
        // Ignore duplicate entry errors
    }
}
async function seedPaymentMethodTypes() {
    const types = [
        { id: 1, name: "Agent", paymentMethodId: 2, status: "active" },
        { id: 2, name: "Personal", paymentMethodId: 2, status: "active" },
        { id: 3, name: "USDT", paymentMethodId: 3, status: "active" },
        { id: 4, name: "Credit Card", paymentMethodId: 4, status: "active" },
        { id: 5, name: "Debit Card", paymentMethodId: 4, status: "active" },
    ];
    try {
        await connection_1.db
            .insert(schema_1.paymentMethodTypes)
            .values(types)
            .onDuplicateKeyUpdate({
            set: {
                id: (0, drizzle_orm_1.sql) `values(${schema_1.paymentMethodTypes.id})`,
                name: (0, drizzle_orm_1.sql) `values(${schema_1.paymentMethodTypes.name})`,
                status: (0, drizzle_orm_1.sql) `values(${schema_1.paymentMethodTypes.status})`,
            },
        });
        console.log("✅ Payment method type seeded successfully!");
    }
    catch (e) {
        // Ignore duplicate entry errors
    }
}
