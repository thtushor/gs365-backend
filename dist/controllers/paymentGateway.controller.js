"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentGateway = exports.updatePaymentGateway = exports.createPaymentGateway = exports.getPaymentGatewayById = exports.getAllPaymentGateways = void 0;
const paymentGateway_model_1 = require("../models/paymentGateway.model");
const paymentGateway_1 = require("../db/schema/paymentGateway");
const drizzle_orm_1 = require("drizzle-orm");
// Helper to build where conditions for search/filter
function buildWhereCondition(query) {
    const whereCondition = [];
    if (query.status)
        whereCondition.push((0, drizzle_orm_1.eq)(paymentGateway_1.paymentGateway.status, query.status));
    if (query.countryId)
        whereCondition.push((0, drizzle_orm_1.eq)(paymentGateway_1.paymentGateway.countryId, query.countryCode));
    if (query.methodId)
        whereCondition.push((0, drizzle_orm_1.eq)(paymentGateway_1.paymentGateway.methodId, Number(query.methodId)));
    if (query.name)
        whereCondition.push((0, drizzle_orm_1.like)(paymentGateway_1.paymentGateway.name, `%${query.name}%`));
    if (query.network)
        whereCondition.push((0, drizzle_orm_1.like)(paymentGateway_1.paymentGateway.network, `%${query.network}%`));
    return whereCondition;
}
const getAllPaymentGateways = async (req, res) => {
    try {
        const pageSize = parseInt(req.query.pageSize || "10", 10);
        const page = parseInt(req.query.page || "1", 10);
        const filter = req.query;
        // Get all filtered
        const allRows = await paymentGateway_model_1.PaymentGatewayModel.getAll(filter);
        const totalCount = allRows.length;
        // Paginate
        const offset = (page - 1) * pageSize;
        const rows = allRows.slice(offset, offset + pageSize);
        res.json({
            data: rows,
            pagination: {
                total: totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to fetch payment gateways", errors: err });
    }
};
exports.getAllPaymentGateways = getAllPaymentGateways;
const getPaymentGatewayById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const row = await paymentGateway_model_1.PaymentGatewayModel.getById(id);
        if (!row.length)
            return res
                .status(404)
                .json({ status: false, message: "Payment gateway not found" });
        res.json({
            data: row[0],
            status: true,
            message: "Payment gateway fetched!",
        });
    }
    catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed to fetch payment gateway",
            errors: err,
        });
    }
};
exports.getPaymentGatewayById = getPaymentGatewayById;
const createPaymentGateway = async (req, res) => {
    try {
        await paymentGateway_model_1.PaymentGatewayModel.create(req.body);
        res.status(201).json({ message: "Payment gateway created" });
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to create payment gateway", errors: err });
    }
};
exports.createPaymentGateway = createPaymentGateway;
const updatePaymentGateway = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const result = await paymentGateway_model_1.PaymentGatewayModel.update(id, req.body);
        if (!result)
            return res.status(404).json({ error: "Payment gateway not found" });
        res.json({ message: "Payment gateway updated", status: true });
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to update payment gateway", errors: err });
    }
};
exports.updatePaymentGateway = updatePaymentGateway;
const deletePaymentGateway = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const result = await paymentGateway_model_1.PaymentGatewayModel.delete(id);
        if (!result)
            return res.status(404).json({ error: "Payment gateway not found" });
        res.json({ message: "Payment gateway deleted" });
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to delete payment gateway", errors: err });
    }
};
exports.deletePaymentGateway = deletePaymentGateway;
