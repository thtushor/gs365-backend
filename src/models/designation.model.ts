
import { eq } from "drizzle-orm";
import { designation } from "../db/schema";
import { db } from "../db/connection";

export interface DesignationInput {
  adminId: number;
  designationName: string;
  adminUserType: string;
  permissions: string[]; // array of string permissions
}

export const DesignationModel = {
  // CREATE
  async create(data: DesignationInput) {
    const [newDesignation] = await db
      .insert(designation)
      .values({
        // adminId: data.adminId,
        designationName: data.designationName,
        adminUserType: data.adminUserType as any,
        permissions: data.permissions,
      })

    return newDesignation;
  },

  // READ ALL
  async findAll() {
    return await db.select().from(designation);
  },

  // READ BY ID
  async findById(id: number) {
    const [result] = await db
      .select()
      .from(designation)
      .where(eq(designation.id, id));

    return result || null;
  },

  // UPDATE
  async update(id: number, data: Partial<DesignationInput>) {
    const [updated] = await db
      .update(designation)
      .set({
        designationName: data.designationName,
        adminUserType: data.adminUserType as any,
        permissions: data.permissions,
      })
      .where(eq(designation.id, id))

    return updated || null;
  },

  // DELETE
  async remove(id: number) {
    const [deleted] = await db
      .delete(designation)
      .where(eq(designation.id, id))

    return deleted || null;
  },
};
