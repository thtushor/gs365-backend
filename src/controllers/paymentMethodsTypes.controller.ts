import { Request, Response } from "express";
import { PaymentMethodTypesModel } from "../models/paymentMethodsTypes.model";

export const getAllPaymentMethodTypes = async (req: Request, res: Response) => {
  let status: "active" | "inactive" | undefined;
  if (
    typeof req.query.status === "string" &&
    (req.query.status === "active" || req.query.status === "inactive")
  ) {
    status = req.query.status;
  }
  const filter: { status?: "active" | "inactive" } = {};
  if (status) {
    filter.status = status;
  }
  const types = await PaymentMethodTypesModel.getAll(filter);
  res.json(types);
};

export const getPaymentMethodTypeById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const type = await PaymentMethodTypesModel.getById(Number(id));
  if (!type.length) return res.status(404).json({ message: "Not found" });
  res.json(type[0]);
  return;
};

export const createPaymentMethodType = async (req: Request, res: Response) => {
  const { name, paymentMethodId } = req.body;
  await PaymentMethodTypesModel.create({
    name,
    paymentMethodId: Number(paymentMethodId),
  });
  res.status(201).json({ message: "Created" });
};

export const updatePaymentMethodType = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status } = req.body;
  await PaymentMethodTypesModel.update(Number(id), { name, status });
  res.json({ message: "Updated" });
};

export const deletePaymentMethodType = async (req: Request, res: Response) => {
  const { id } = req.params;
  await PaymentMethodTypesModel.delete(Number(id));
  res.json({ message: "Deleted" });
};
