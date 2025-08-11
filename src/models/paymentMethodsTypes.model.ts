import { db } from "../db/connection";
import { eq, sql } from "drizzle-orm";
import { paymentMethods, paymentMethodTypes } from "../db/schema";

export const PaymentMethodTypesModel = {
  async getAll(filter: { status?: "active" | "inactive" }) {
    return db
      .select({
        id: paymentMethodTypes.id,
        name: paymentMethodTypes.name,
        paymentMethodId: paymentMethodTypes.paymentMethodId,
        status: paymentMethodTypes.status,
        paymentMethod: {
          id: paymentMethods.id,
          name: paymentMethods.name,
          status: paymentMethods.status,
        },
      })
      .from(paymentMethodTypes)
      .leftJoin(
        paymentMethods,
        eq(paymentMethods.id, paymentMethodTypes.paymentMethodId)
      )
      .where(
        filter?.status
          ? eq(paymentMethodTypes.status, filter.status)
          : undefined
      );
  },
  async getById(id: number) {
    return db
      .select({
        id: paymentMethodTypes.id,
        name: paymentMethodTypes.name,
        paymentMethodId: paymentMethodTypes.paymentMethodId,
        status: paymentMethodTypes.status,
        paymentMethod: {
          id: paymentMethods.id,
          name: paymentMethods.name,
          status: paymentMethods.status,
        },
      })
      .from(paymentMethodTypes)
      .leftJoin(
        paymentMethods,
        eq(paymentMethods.id, paymentMethodTypes.paymentMethodId)
      )
      .where(sql`${paymentMethodTypes.id} = ${id}`);
  },
  async create(data: { name: string; paymentMethodId: number }) {
    return db.insert(paymentMethodTypes).values(data);
  },
  async update(
    id: number,
    data: { name: string; status: "active" | "inactive" }
  ) {
    return db
      .update(paymentMethodTypes)
      .set(data)
      .where(sql`${paymentMethodTypes.id} = ${id}`);
  },
  async delete(id: number) {
    return db
      .delete(paymentMethodTypes)
      .where(sql`${paymentMethodTypes.id} = ${id}`);
  },
};
