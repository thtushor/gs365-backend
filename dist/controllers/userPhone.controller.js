"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPhoneOtp = exports.sendPhoneOtp = exports.verifyUserPhone = exports.setPrimaryUserPhone = exports.deleteUserPhone = exports.updateUserPhone = exports.getUserPhoneById = exports.getUserPhonesByUser = exports.getUserPhones = exports.createUserPhone = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const userPhone_model_1 = require("../models/userPhone.model");
const smsService_1 = require("../utils/smsService");
exports.createUserPhone = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { userId, phoneNumber, isPrimary, isVerified, isSmsCapable, } = req.body;
        if (!userId || !phoneNumber) {
            return res.status(400).json({ status: false, message: "userId and phoneNumber are required" });
        }
        // Check if user already has 3 phone numbers
        const existingPhones = await userPhone_model_1.UserPhoneModel.getByUserId(Number(userId));
        if (existingPhones.length >= 3) {
            return res.status(400).json({ status: false, message: "Maximum 3 phone numbers allowed" });
        }
        const created = await userPhone_model_1.UserPhoneModel.create({
            userId: Number(userId),
            phoneNumber,
            isPrimary,
            isVerified: false, // Force false for new phones initially if they must be verified manually
            isSmsCapable,
        });
        return res.status(201).json({ status: true, message: "User phone created", data: created });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to create user phone";
        return res.status(400).json({ status: false, message });
    }
});
exports.getUserPhones = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, isPrimary, isVerified, isSmsCapable } = req.query;
    const list = await userPhone_model_1.UserPhoneModel.getWithFilters({
        userId: userId ? Number(userId) : undefined,
        isPrimary: typeof isPrimary === "string" ? isPrimary === "true" : undefined,
        isVerified: typeof isVerified === "string" ? isVerified === "true" : undefined,
        isSmsCapable: typeof isSmsCapable === "string" ? isSmsCapable === "true" : undefined,
    });
    return res.json({ status: true, data: list });
});
exports.getUserPhonesByUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.params;
    if (!userId)
        return res.status(400).json({ status: false, message: "userId is required" });
    const list = await userPhone_model_1.UserPhoneModel.getByUserId(Number(userId));
    return res.json({ status: true, data: list });
});
exports.getUserPhoneById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const row = await userPhone_model_1.UserPhoneModel.getById(Number(id));
    if (!row)
        return res.status(404).json({ status: false, message: "Not found" });
    return res.json({ status: true, data: row });
});
exports.updateUserPhone = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    try {
        const { id } = req.params;
        const existingPhone = await userPhone_model_1.UserPhoneModel.getById(Number(id));
        if (!existingPhone) {
            return res.status(404).json({ status: false, message: "Phone not found" });
        }
        // If attempting to update phone number, check if it's verified
        if (req.body.phoneNumber && req.body.phoneNumber !== existingPhone.phoneNumber) {
            if (existingPhone.isVerified) {
                return res.status(400).json({ status: false, message: "Cannot edit phone number once it is verified" });
            }
        }
        // Only pass whitelisted fields to the model
        const payload = {};
        if (typeof req.body.phoneNumber === "string")
            payload.phoneNumber = req.body.phoneNumber;
        if (typeof req.body.isPrimary === "boolean")
            payload.isPrimary = req.body.isPrimary;
        if (typeof req.body.isVerified === "boolean")
            payload.isVerified = req.body.isVerified;
        if (typeof req.body.isSmsCapable === "boolean")
            payload.isSmsCapable = req.body.isSmsCapable;
        const updated = await userPhone_model_1.UserPhoneModel.update(Number(id), payload);
        return res.json({ status: true, message: "Updated", data: updated });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Failed to update user phone";
        return res.status(400).json({ status: false, message });
    }
});
exports.deleteUserPhone = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    await userPhone_model_1.UserPhoneModel.delete(Number(id));
    return res.json({ status: true, message: "Deleted" });
});
exports.setPrimaryUserPhone = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const ok = await userPhone_model_1.UserPhoneModel.setPrimary(Number(id));
    if (!ok)
        return res.status(400).json({ status: false, message: "Failed to set primary" });
    return res.json({ status: true, message: "Set as primary" });
});
exports.verifyUserPhone = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const row = await userPhone_model_1.UserPhoneModel.verify(Number(id));
    return res.json({ status: true, message: "Verified", data: row });
});
exports.sendPhoneOtp = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { phoneNumber } = req.body;
    const phone = await userPhone_model_1.UserPhoneModel.getById(Number(id));
    if (!phone) {
        return res.status(404).json({ status: false, message: "Phone not found" });
    }
    // Validate phoneNumber if provided in body
    if (phoneNumber && phone.phoneNumber !== phoneNumber) {
        return res.status(400).json({ status: false, message: "Phone number mismatch" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);
    await userPhone_model_1.UserPhoneModel.setOtp(Number(id), otp, expiry);
    const smsRes = await (0, smsService_1.sendOTPSMS)(phone.phoneNumber, otp, 10);
    if (!smsRes.success) {
        return res.status(500).json({ status: false, message: "Failed to send SMS OTP", error: smsRes.msg });
    }
    return res.json({ status: true, message: "OTP sent successfully" });
});
exports.verifyPhoneOtp = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const { otp, phoneNumber } = req.body;
    if (!otp) {
        return res.status(400).json({ status: false, message: "OTP is required" });
    }
    const phone = await userPhone_model_1.UserPhoneModel.getById(Number(id));
    if (!phone) {
        return res.status(404).json({ status: false, message: "Phone not found" });
    }
    // Validate phoneNumber if provided in body
    if (phoneNumber && phone.phoneNumber !== phoneNumber) {
        return res.status(400).json({ status: false, message: "Phone number mismatch" });
    }
    const result = await userPhone_model_1.UserPhoneModel.verifyWithOtp(Number(id), otp);
    if (!result.success) {
        return res.status(400).json({ status: false, message: result.message });
    }
    return res.json({ status: true, message: result.message });
});
