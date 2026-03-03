import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { rejectReasons } from "../db/schema/rejectReasons";
import type { NewRejectReason } from "../db/schema/rejectReasons";

export const RejectReasonModel = {
    async getAll() {
        return db.select().from(rejectReasons);
    },

    async getById(id: number) {
        const result = await db
            .select()
            .from(rejectReasons)
            .where(eq(rejectReasons.id, id));
        return result[0] || null;
    },

    async create(data: NewRejectReason) {
        return db.insert(rejectReasons).values(data);
    },

    async update(id: number, data: Partial<NewRejectReason>) {
        return db
            .update(rejectReasons)
            .set(data)
            .where(eq(rejectReasons.id, id));
    },

    async delete(id: number) {
        return db.delete(rejectReasons).where(eq(rejectReasons.id, id));
    },
};
