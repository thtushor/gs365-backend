"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserPhoneModel = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
exports.UserPhoneModel = {
    async create(data) {
        try {
            // If setting as primary, unset existing primary for user
            if (data.isPrimary) {
                await connection_1.db.update(schema_1.userPhones).set({ isPrimary: false }).where((0, drizzle_orm_1.eq)(schema_1.userPhones.userId, data.userId));
            }
            await connection_1.db.insert(schema_1.userPhones).values({
                userId: data.userId,
                phoneNumber: data.phoneNumber,
                isPrimary: data.isPrimary ?? false,
                isVerified: data.isVerified ?? false,
                isSmsCapable: data.isSmsCapable ?? true,
            });
            const list = await this.getByUserId(data.userId);
            return list.find((p) => p.phoneNumber === data.phoneNumber) || null;
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error during phone create";
            throw new Error(message);
        }
    },
    async getById(id) {
        const [row] = await connection_1.db
            .select({
            id: schema_1.userPhones.id,
            userId: schema_1.userPhones.userId,
            phoneNumber: schema_1.userPhones.phoneNumber,
            isPrimary: schema_1.userPhones.isPrimary,
            isVerified: schema_1.userPhones.isVerified,
            isSmsCapable: schema_1.userPhones.isSmsCapable,
            otp: schema_1.userPhones.otp,
            otp_expiry: schema_1.userPhones.otp_expiry,
            createdAt: schema_1.userPhones.createdAt,
            updatedAt: schema_1.userPhones.updatedAt,
            user: {
                id: schema_1.users.id,
                username: schema_1.users.username,
                email: schema_1.users.email,
            },
        })
            .from(schema_1.userPhones)
            .leftJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.users.id, schema_1.userPhones.userId))
            .where((0, drizzle_orm_1.eq)(schema_1.userPhones.id, id))
            .limit(1);
        return row || null;
    },
    async getByUserId(userId) {
        const list = await connection_1.db
            .select({
            id: schema_1.userPhones.id,
            userId: schema_1.userPhones.userId,
            phoneNumber: schema_1.userPhones.phoneNumber,
            isPrimary: schema_1.userPhones.isPrimary,
            isVerified: schema_1.userPhones.isVerified,
            isSmsCapable: schema_1.userPhones.isSmsCapable,
            otp: schema_1.userPhones.otp,
            otp_expiry: schema_1.userPhones.otp_expiry,
            createdAt: schema_1.userPhones.createdAt,
            updatedAt: schema_1.userPhones.updatedAt,
        })
            .from(schema_1.userPhones)
            .where((0, drizzle_orm_1.eq)(schema_1.userPhones.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.userPhones.isPrimary), (0, drizzle_orm_1.desc)(schema_1.userPhones.isVerified), (0, drizzle_orm_1.asc)(schema_1.userPhones.id));
        return list;
    },
    async getWithFilters(filters) {
        const whereClauses = [];
        if (filters.userId !== undefined)
            whereClauses.push((0, drizzle_orm_1.eq)(schema_1.userPhones.userId, filters.userId));
        if (filters.isPrimary !== undefined)
            whereClauses.push((0, drizzle_orm_1.eq)(schema_1.userPhones.isPrimary, filters.isPrimary));
        if (filters.isVerified !== undefined)
            whereClauses.push((0, drizzle_orm_1.eq)(schema_1.userPhones.isVerified, filters.isVerified));
        if (filters.isSmsCapable !== undefined)
            whereClauses.push((0, drizzle_orm_1.eq)(schema_1.userPhones.isSmsCapable, filters.isSmsCapable));
        const where = whereClauses.length ? (0, drizzle_orm_1.and)(...whereClauses) : undefined;
        const list = await connection_1.db
            .select({
            id: schema_1.userPhones.id,
            userId: schema_1.userPhones.userId,
            phoneNumber: schema_1.userPhones.phoneNumber,
            isPrimary: schema_1.userPhones.isPrimary,
            isVerified: schema_1.userPhones.isVerified,
            isSmsCapable: schema_1.userPhones.isSmsCapable,
            otp: schema_1.userPhones.otp,
            otp_expiry: schema_1.userPhones.otp_expiry,
            createdAt: schema_1.userPhones.createdAt,
            updatedAt: schema_1.userPhones.updatedAt,
        })
            .from(schema_1.userPhones)
            .where(where)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.userPhones.isPrimary), (0, drizzle_orm_1.desc)(schema_1.userPhones.isVerified), (0, drizzle_orm_1.desc)(schema_1.userPhones.updatedAt));
        return list;
    },
    async update(id, data) {
        try {
            // Sanitize input to only allow whitelisted fields
            const allowed = {};
            if (typeof data.phoneNumber === "string")
                allowed.phoneNumber = data.phoneNumber;
            if (typeof data.isPrimary === "boolean")
                allowed.isPrimary = data.isPrimary;
            if (typeof data.isVerified === "boolean")
                allowed.isVerified = data.isVerified;
            if (typeof data.isSmsCapable === "boolean")
                allowed.isSmsCapable = data.isSmsCapable;
            if (allowed.isPrimary) {
                const current = await this.getById(id);
                if (current?.userId) {
                    await connection_1.db.update(schema_1.userPhones).set({ isPrimary: false }).where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.userPhones.userId, current.userId), (0, drizzle_orm_1.eq)(schema_1.userPhones.isPrimary, true)));
                }
            }
            await connection_1.db.update(schema_1.userPhones).set({ ...allowed, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.userPhones.id, id));
            return this.getById(id);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error during phone update";
            throw new Error(message);
        }
    },
    async delete(id) {
        await connection_1.db.delete(schema_1.userPhones).where((0, drizzle_orm_1.eq)(schema_1.userPhones.id, id));
        return true;
    },
    async setPrimary(id) {
        const current = await this.getById(id);
        if (!current?.userId)
            return false;
        await connection_1.db.update(schema_1.userPhones).set({ isPrimary: false }).where((0, drizzle_orm_1.eq)(schema_1.userPhones.userId, current.userId));
        await connection_1.db.update(schema_1.userPhones).set({ isPrimary: true, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.userPhones.id, id));
        return true;
    },
    async verify(id) {
        await connection_1.db.update(schema_1.userPhones).set({ isVerified: true, otp: null, otp_expiry: null, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.userPhones.id, id));
        return this.getById(id);
    },
    async setOtp(id, otp, expiry) {
        await connection_1.db.update(schema_1.userPhones).set({ otp, otp_expiry: expiry, updatedAt: new Date() }).where((0, drizzle_orm_1.eq)(schema_1.userPhones.id, id));
        return true;
    },
    async verifyWithOtp(id, otp) {
        const row = await this.getById(id);
        if (!row)
            return { success: false, message: "Phone not found" };
        if (row.isVerified)
            return { success: false, message: "Phone already verified" };
        if (row.otp !== otp)
            return { success: false, message: "Invalid OTP" };
        if (!row.otp_expiry || new Date() > new Date(row.otp_expiry))
            return { success: false, message: "OTP expired" };
        await this.verify(id);
        return { success: true, message: "Phone verified successfully" };
    },
};
