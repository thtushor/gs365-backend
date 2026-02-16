"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DesignationModel = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const connection_1 = require("../db/connection");
exports.DesignationModel = {
    // CREATE
    async create(data) {
        const [newDesignation] = await connection_1.db
            .insert(schema_1.designation)
            .values({
            // adminId: data.adminId,
            designationName: data.designationName,
            adminUserType: data.adminUserType,
            permissions: data.permissions,
        });
        return newDesignation;
    },
    // READ ALL
    async findAll() {
        return await connection_1.db.select().from(schema_1.designation);
    },
    // READ BY ID
    async findById(id) {
        const [result] = await connection_1.db
            .select()
            .from(schema_1.designation)
            .where((0, drizzle_orm_1.eq)(schema_1.designation.id, id));
        return result || null;
    },
    // UPDATE
    async update(id, data) {
        const [updated] = await connection_1.db
            .update(schema_1.designation)
            .set({
            designationName: data.designationName,
            adminUserType: data.adminUserType,
            permissions: data.permissions,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.designation.id, id));
        return updated || null;
    },
    // DELETE
    async remove(id) {
        const [deleted] = await connection_1.db
            .delete(schema_1.designation)
            .where((0, drizzle_orm_1.eq)(schema_1.designation.id, id));
        return deleted || null;
    },
};
