"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePaymentMethod = exports.updatePaymentMethod = exports.createPaymentMethod = exports.getPaymentMethodByName = exports.getPaymentMethodById = exports.getAllPaymentMethod = void 0;
const paymentMethods_model_1 = require("../models/paymentMethods.model");
const getAllPaymentMethod = async (req, res) => {
    let status;
    if (typeof req.query.status === "string" &&
        (req.query.status === "active" || req.query.status === "inactive")) {
        status = req.query.status;
    }
    const filter = {};
    if (status) {
        filter.status = status;
    }
    const types = await paymentMethods_model_1.PaymentMethodModel.getAll(filter);
    res.json(types);
};
exports.getAllPaymentMethod = getAllPaymentMethod;
const getPaymentMethodById = async (req, res) => {
    const { id } = req.params;
    const type = await paymentMethods_model_1.PaymentMethodModel.getById(Number(id));
    if (!type.length)
        return res.status(404).json({ message: "Not found" });
    res.json(type[0]);
    return;
};
exports.getPaymentMethodById = getPaymentMethodById;
const getPaymentMethodByName = async (req, res) => {
    const { name } = req.params;
    const { status } = req.query;
    const method = await paymentMethods_model_1.PaymentMethodModel.getPaymentMethodByName(name, { status: status });
    res.json(method);
};
exports.getPaymentMethodByName = getPaymentMethodByName;
const createPaymentMethod = async (req, res) => {
    const { name } = req.body;
    await paymentMethods_model_1.PaymentMethodModel.create({ name });
    res.status(201).json({ message: "Created" });
};
exports.createPaymentMethod = createPaymentMethod;
const updatePaymentMethod = async (req, res) => {
    const { id } = req.params;
    const { name, status } = req.body;
    await paymentMethods_model_1.PaymentMethodModel.update(Number(id), { name, status });
    res.json({ message: "Updated" });
};
exports.updatePaymentMethod = updatePaymentMethod;
const deletePaymentMethod = async (req, res) => {
    const { id } = req.params;
    await paymentMethods_model_1.PaymentMethodModel.delete(Number(id));
    res.json({ message: "Deleted" });
};
exports.deletePaymentMethod = deletePaymentMethod;
