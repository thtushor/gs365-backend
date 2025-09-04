import { db } from "../db/connection";
import {
  NewPaymentGateway,
  PaymentGateway,
  paymentGateway,
} from "../db/schema/paymentGateway";
import { eq, sql, and, like } from "drizzle-orm";
import { PaymentMethodModel } from "./paymentMethods.model";
import { PaymentMethodTypesModel } from "./paymentMethodsTypes.model";
import { countries, NewCountry } from "../db/schema/country";
import { paymentMethods } from "../db/schema";
import {
  getPaymentMethodTypeById,
  getPaymentMethodTypeByIdWithoutResponsse,
} from "../controllers/paymentMethodsTypes.controller";
import { Country } from "../db/seed-fn/currency";

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
    const result = await db
      .select({
        id: paymentGateway.id,
        name: paymentGateway.name,
        network: paymentGateway.network,
        status: paymentGateway.status,
        countryId: paymentGateway.countryId,
        methodId: paymentGateway.methodId,
        paymentMethodTypeIds: paymentGateway.paymentMethodTypeIds,
        minDeposit: paymentGateway.minDeposit,
        maxDeposit: paymentGateway.maxDeposit,
        minWithdraw: paymentGateway.minWithdraw,
        maxWithdraw: paymentGateway.maxWithdraw,
        bonus: paymentGateway.bonus,
        paymentMethods: {
          id: paymentMethods.id,
          name: paymentMethods.name,
          status: paymentMethods.status,
        },
        country: {
          id: countries.id,
          name: countries.name,
          flagUrl: countries.flagUrl,
          code: countries.code,
          currencyId: countries.currencyId,
          status: countries.status,
        },
      })
      .from(paymentGateway)
      .leftJoin(paymentMethods, eq(paymentGateway.methodId, paymentMethods.id))
      .leftJoin(countries, eq(countries.id, paymentGateway.countryId))
      .where(eq(paymentGateway.id, id));

    let paymentTypes = typeof result[0].paymentMethodTypeIds === "string"
      ? (JSON.parse(result[0].paymentMethodTypeIds) as number[])
      : (result[0].paymentMethodTypeIds as number[]) || [];

    paymentTypes = Array.isArray(paymentTypes) ? paymentTypes : [];

    const paymentTypesPopulate: Country[] = [];

    await Promise.all(
      paymentTypes.map(async (value) => {
        if (value) {
          const paymentMethodType =
            await getPaymentMethodTypeByIdWithoutResponsse(value);

          if (paymentMethodType)
            paymentTypesPopulate.push(paymentMethodType as unknown as Country);
        }
      })
    );

    return [
      {
        ...result[0],
        paymentTypes: paymentTypesPopulate as Country[],
      },
    ];
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
    return db.insert(paymentGateway).values({
  name: data.name,
  methodId: data.methodId,
  paymentMethodTypeIds: data.paymentMethodTypeIds, // JSON handled by Drizzle
  iconUrl: data.iconUrl,
  minDeposit: data.minDeposit,
  maxDeposit: data.maxDeposit,
  minWithdraw: data.minWithdraw,
  maxWithdraw: data.maxWithdraw,
  bonus: data.bonus,
  status: data.status,               // maps to status
  // statusDeposit: "active",           // or use data.statusDeposit if your payload includes it
  countryId: data.countryId,
  network: data.network,
  currencyConversionRate: data.currencyConversionRate,
});

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
