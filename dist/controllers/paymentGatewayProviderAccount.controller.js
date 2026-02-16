"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayProviderAccountController = void 0;
const paymentGatewayProviderAccount_model_1 = require("../models/paymentGatewayProviderAccount.model");
const asyncHandler_1 = require("../utils/asyncHandler");
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
exports.PaymentGatewayProviderAccountController = {
    getAll: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const filters = req.query;
        const result = await paymentGatewayProviderAccount_model_1.PaymentGatewayProviderAccountModel.getAll(filters);
        res.status(200).json({
            status: true,
            data: result.data,
            message: "Payment Gateway Provider Accounts fetched successfully",
            pagination: result.pagination,
        });
    }),
    getById: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const data = await paymentGatewayProviderAccount_model_1.PaymentGatewayProviderAccountModel.getById(Number(id));
        if (!data || data.length === 0) {
            return res
                .status(404)
                .json({ status: false, message: "Account not found" });
        }
        res.status(200).json({
            status: true,
            message: "Payment Gateway Provider Account fetched successfully",
            data: data[0],
        });
    }),
    getByProviderId: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { paymentGatewayProviderId } = req.params;
        const data = await paymentGatewayProviderAccount_model_1.PaymentGatewayProviderAccountModel.getByProviderId(Number(paymentGatewayProviderId));
        res.status(200).json({
            status: true,
            message: "Payment Gateway Provider Accounts fetched successfully",
            data,
        });
    }),
    create: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (req.body?.isPrimary && req?.body?.is_primary === true) {
            const existing = await paymentGatewayProviderAccount_model_1.PaymentGatewayProviderAccountModel.getByProviderId(Number(req.body?.paymentGatewayProviderId));
            if (existing && existing.length > 0) {
                return res
                    .status(400)
                    .json({ status: false, message: "Primary account already exists" });
            }
            await connection_1.db
                .update(schema_1.paymentGatewayProviderAccount)
                .set({
                isPrimary: false,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.paymentGatewayProviderAccount.paymentGatewayProviderId, Number(req.body?.paymentGatewayProviderId)));
        }
        const created = await paymentGatewayProviderAccount_model_1.PaymentGatewayProviderAccountModel.create(req.body);
        res.status(201).json({
            status: true,
            message: "Payment Gateway Provider Account created successfully",
            data: created,
        });
    }),
    update: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const existing = await paymentGatewayProviderAccount_model_1.PaymentGatewayProviderAccountModel.getById(Number(id));
        if (!existing || existing.length === 0) {
            return res
                .status(404)
                .json({ status: false, message: "Account not found" });
        }
        if (req.body?.isPrimary && req?.body?.isPrimary === true) {
            await connection_1.db
                .update(schema_1.paymentGatewayProviderAccount)
                .set({
                isPrimary: false,
            })
                .where((0, drizzle_orm_1.eq)(schema_1.paymentGatewayProviderAccount.paymentGatewayProviderId, existing[0].paymentGatewayProviderId));
        }
        const updated = await paymentGatewayProviderAccount_model_1.PaymentGatewayProviderAccountModel.update(Number(id), req.body);
        res.status(200).json({
            status: true,
            message: "Payment Gateway Provider Account updated successfully",
            data: updated,
        });
    }),
    delete: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        await paymentGatewayProviderAccount_model_1.PaymentGatewayProviderAccountModel.delete(Number(id));
        res.status(200).json({
            status: true,
            message: "Payment Gateway Provider Account deleted successfully",
        });
    }),
};
