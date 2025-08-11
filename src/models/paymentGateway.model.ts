import { db } from "../db/connection";
import {
  NewPaymentGateway,
  PaymentGateway,
  paymentGateway,
} from "../db/schema/paymentGateway";
import { eq, sql, and, like } from "drizzle-orm";
import { PaymentMethodModel } from "./paymentMethods.model";
import { PaymentMethodTypesModel } from "./paymentMethodsTypes.model";
import { countries } from "../db/schema/country";

export const PaymentGatewayModel = {
  async getAll(filter: any = {}) {
    const whereCondition = [];
    if (filter.status)
      whereCondition.push(eq(paymentGateway.status, filter.status));
    if (filter.countryId)
      whereCondition.push(eq(paymentGateway.countryId, filter.countryId));
    if (filter.methodId)
      whereCondition.push(eq(paymentGateway.methodId, Number(filter.methodId)));
    if (filter.name)
      whereCondition.push(like(paymentGateway.name, `%${filter.name}%`));
    if (filter.network)
      whereCondition.push(like(paymentGateway.network, `%${filter.network}%`));
    if (filter.paymentMethodTypeId) {
      whereCondition.push(
        sql`JSON_CONTAINS(${paymentGateway.paymentMethodTypeIds}, CAST(${filter.paymentMethodTypeId} AS JSON))`
      );
    }
    return db
      .select()
      .from(paymentGateway)
      .where(whereCondition.length ? and(...whereCondition) : undefined);
  },
  async getById(id: number) {
    return db
      .select()
      .from(paymentGateway)
      .where(sql`${paymentGateway.id} = ${id}`);
  },
  async create(data: typeof NewPaymentGateway) {
    // Validate methodId
    const method = await PaymentMethodModel.getById(data.methodId);

    if (!method || method.length === 0) {
      throw new Error("Invalid payment method id");
    }
    console.log("test");
    // Validate paymentMethodTypeIds (array of numbers)
    if (!Array.isArray(data.paymentMethodTypeIds)) {
      throw new Error("paymentMethodTypeIds must be an array of numbers");
    }
    for (const typeId of data.paymentMethodTypeIds) {
      const type = await PaymentMethodTypesModel.getById(typeId);
      if (!type || type.length === 0) {
        throw new Error(`Invalid payment method type id: ${typeId}`);
      }
    }

    if (!data.countryId) {
      throw new Error(`Invalid country id`);
    }
    // Validate countryId
    const country = await db
      .select()
      .from(countries)
      .where(eq(countries.id, data.countryId));

    if (!country || country.length === 0) {
      throw new Error("Invalid country id");
    }
    return db.insert(paymentGateway).values(data);
  },
  async update(id: number, data: any) {
    return db
      .update(paymentGateway)
      .set(data)
      .where(sql`${paymentGateway.id} = ${id}`);
  },
  async delete(id: number) {
    return db.delete(paymentGateway).where(sql`${paymentGateway.id} = ${id}`);
  },
};
