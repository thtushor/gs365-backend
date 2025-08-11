import { Request, Response } from "express";
import { PaymentMethodModel } from "../models/paymentMethods.model";

export const getAllPaymentMethod = async (req: Request, res: Response) => {
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
  const types = await PaymentMethodModel.getAll(filter);
  res.json(types);
};

export const getPaymentMethodById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const type = await PaymentMethodModel.getById(Number(id));
  if (!type.length) return res.status(404).json({ message: "Not found" });
  res.json(type[0]);
  return;
};


export const getPaymentMethodByName = async (req: Request, res: Response) => {
  const { name } = req.params;
  const { status } = req.query;
  const method = await PaymentMethodModel.getPaymentMethodByName(name, {status: status as "active"|"inactive"|undefined});
  res.json(method);
};

export const createPaymentMethod = async (req: Request, res: Response) => {
  const { name } = req.body;
  await PaymentMethodModel.create({ name });
  res.status(201).json({ message: "Created" });
};

export const updatePaymentMethod = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status } = req.body;
  await PaymentMethodModel.update(Number(id), { name, status });
  res.json({ message: "Updated" });
};

export const deletePaymentMethod = async (req: Request, res: Response) => {
  const { id } = req.params;
  await PaymentMethodModel.delete(Number(id));
  res.json({ message: "Deleted" });
};
