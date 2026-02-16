"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentMethodType = exports.updatePaymentMethodType = exports.createPaymentMethodType = exports.getPaymentMethodTypeByIdWithoutResponsse = exports.getPaymentMethodTypeById = exports.getAllPaymentMethodTypes = void 0;
const paymentMethodsTypes_model_1 = require("../models/paymentMethodsTypes.model");
const getAllPaymentMethodTypes = async (req, res) => {
    let status;
    if (typeof req.query.status === "string" &&
        (req.query.status === "active" || req.query.status === "inactive")) {
        status = req.query.status;
    }
    const filter = {};
    if (status) {
        filter.status = status;
    }
    const types = await paymentMethodsTypes_model_1.PaymentMethodTypesModel.getAll(filter);
    res.json(types);
};
exports.getAllPaymentMethodTypes = getAllPaymentMethodTypes;
const getPaymentMethodTypeById = async (req, res) => {
    const { id } = req.params;
    const type = await paymentMethodsTypes_model_1.PaymentMethodTypesModel.getById(Number(id));
    if (!type.length)
        return res.status(404).json({ message: "Not found" });
    res.json(type[0]);
    return;
};
exports.getPaymentMethodTypeById = getPaymentMethodTypeById;
const getPaymentMethodTypeByIdWithoutResponsse = async (id) => {
    const type = await paymentMethodsTypes_model_1.PaymentMethodTypesModel.getById(id);
    if (!type.length)
        return null;
    return type[0];
};
exports.getPaymentMethodTypeByIdWithoutResponsse = getPaymentMethodTypeByIdWithoutResponsse;
const createPaymentMethodType = async (req, res) => {
    const { name, paymentMethodId } = req.body;
    await paymentMethodsTypes_model_1.PaymentMethodTypesModel.create({
        name,
        paymentMethodId: Number(paymentMethodId),
    });
    res.status(201).json({ message: "Created" });
};
exports.createPaymentMethodType = createPaymentMethodType;
const updatePaymentMethodType = async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;
    await paymentMethodsTypes_model_1.PaymentMethodTypesModel.update(Number(id), { name, status });
    res.json({ message: "Updated" });
};
exports.updatePaymentMethodType = updatePaymentMethodType;
const deletePaymentMethodType = async (req, res) => {
    const { id } = req.params;
    await paymentMethodsTypes_model_1.PaymentMethodTypesModel.delete(Number(id));
    res.json({ message: "Deleted" });
};
exports.deletePaymentMethodType = deletePaymentMethodType;
