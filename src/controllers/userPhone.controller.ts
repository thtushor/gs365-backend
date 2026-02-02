import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../utils/types";
import { UserPhoneModel } from "../models/userPhone.model";
import { sendOTPSMS } from "../utils/smsService";

export const createUserPhone = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
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
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create user phone";
    return res.status(400).json({ status: false, message });
  }
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
  try {
    const { id } = req.params;
    // Only pass whitelisted fields to the model
    const payload: any = {};
    if (typeof req.body.phoneNumber === "string") payload.phoneNumber = req.body.phoneNumber;
    if (typeof req.body.isPrimary === "boolean") payload.isPrimary = req.body.isPrimary;
    if (typeof req.body.isVerified === "boolean") payload.isVerified = req.body.isVerified;
    if (typeof req.body.isSmsCapable === "boolean") payload.isSmsCapable = req.body.isSmsCapable;

    const updated = await UserPhoneModel.update(Number(id), payload);
    return res.json({ status: true, message: "Updated", data: updated });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update user phone";
    return res.status(400).json({ status: false, message });
  }
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

export const sendPhoneOtp = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const phone = await UserPhoneModel.getById(Number(id));

  if (!phone) {
    return res.status(404).json({ status: false, message: "Phone not found" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 10);

  await UserPhoneModel.setOtp(Number(id), otp, expiry);

  const smsRes = await sendOTPSMS(phone.phoneNumber, otp, 10);

  if (!smsRes.success) {
    return res.status(500).json({ status: false, message: "Failed to send SMS OTP", error: smsRes.msg });
  }

  return res.json({ status: true, message: "OTP sent successfully" });
});

export const verifyPhoneOtp = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ status: false, message: "OTP is required" });
  }

  const result = await UserPhoneModel.verifyWithOtp(Number(id), otp);

  if (!result.success) {
    return res.status(400).json({ status: false, message: result.message });
  }

  return res.json({ status: true, message: result.message });
});


