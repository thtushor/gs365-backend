import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../utils/types";
import { UserPhoneModel } from "../models/userPhone.model";

export const createUserPhone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const {
    userId,
    phoneNumber,
    isPrimary,
    isVerified,
    isSmsCapable,
  } = req.body;

  if (!userId || !phoneNumber) {
    return res.status(400).json({ status: false, message: "userId and phoneNumber are required" });
  }

  const created = await UserPhoneModel.create({
    userId: Number(userId),
    phoneNumber,
    isPrimary,
    isVerified,
    isSmsCapable,
  });

  return res.status(201).json({ status: true, message: "User phone created", data: created });
});

export const getUserPhones = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId, isPrimary, isVerified, isSmsCapable } = req.query;
  const list = await UserPhoneModel.getWithFilters({
    userId: userId ? Number(userId) : undefined,
    isPrimary: typeof isPrimary === "string" ? isPrimary === "true" : undefined,
    isVerified: typeof isVerified === "string" ? isVerified === "true" : undefined,
    isSmsCapable: typeof isSmsCapable === "string" ? isSmsCapable === "true" : undefined,
  });
  return res.json({ status: true, data: list });
});

export const getUserPhonesByUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ status: false, message: "userId is required" });
  const list = await UserPhoneModel.getByUserId(Number(userId));
  return res.json({ status: true, data: list });
});

export const getUserPhoneById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const row = await UserPhoneModel.getById(Number(id));
  if (!row) return res.status(404).json({ status: false, message: "Not found" });
  return res.json({ status: true, data: row });
});

export const updateUserPhone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const updated = await UserPhoneModel.update(Number(id), req.body);
  return res.json({ status: true, message: "Updated", data: updated });
});

export const deleteUserPhone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await UserPhoneModel.delete(Number(id));
  return res.json({ status: true, message: "Deleted" });
});

export const setPrimaryUserPhone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const ok = await UserPhoneModel.setPrimary(Number(id));
  if (!ok) return res.status(400).json({ status: false, message: "Failed to set primary" });
  return res.json({ status: true, message: "Set as primary" });
});

export const verifyUserPhone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const row = await UserPhoneModel.verify(Number(id));
  return res.json({ status: true, message: "Verified", data: row });
});


