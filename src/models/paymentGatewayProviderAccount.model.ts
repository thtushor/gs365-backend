import { db } from "../db/connection";
import {
  paymentGatewayProviderAccount,
  NewPaymentGatewayProviderAccount,
} from "../db/schema/paymentGatewayProviderAccount";
import { eq, and, sql } from "drizzle-orm";

export const PaymentGatewayProviderAccountModel = {
  async getAll(filter: any = {}) {
    const whereCondition = [];
    if (filter.paymentGatewayProviderId)
      whereCondition.push(
        eq(
          paymentGatewayProviderAccount.paymentGatewayProviderId,
          filter.paymentGatewayProviderId
        )
      );
    if (filter.status)
      whereCondition.push(
        eq(paymentGatewayProviderAccount.status, filter.status)
      );

    const page = parseInt(filter.page as string) || 1;
    const pageSize = parseInt(filter.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(paymentGatewayProviderAccount)
      .where(whereCondition.length ? and(...whereCondition) : undefined);

    const data = await db
      .select()
      .from(paymentGatewayProviderAccount)
      .where(whereCondition.length ? and(...whereCondition) : undefined)
      .limit(pageSize)
      .offset(offset)
      .orderBy(paymentGatewayProviderAccount.id);

    return {
      data,
      pagination: {
        page,
        pageSize,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / pageSize),
        hasNext: page < Math.ceil((totalCount[0]?.count || 0) / pageSize),
        hasPrev: page > 1,
      },
    };
  },

  async getById(id: number) {
    return db
      .select()
      .from(paymentGatewayProviderAccount)
      .where(eq(paymentGatewayProviderAccount.id, id));
  },

  async getByProviderId(paymentGatewayProviderId: number) {
    return db
      .select()
      .from(paymentGatewayProviderAccount)
      .where(
        eq(
          paymentGatewayProviderAccount.paymentGatewayProviderId,
          paymentGatewayProviderId
        )
      );
  },

  async create(data: typeof NewPaymentGatewayProviderAccount) {
    const [result] = await db
      .insert(paymentGatewayProviderAccount)
      .values(data)
      .$returningId();

    return this.getById(Number(result.id));
  },

  async update(
    id: number,
    data: Partial<typeof NewPaymentGatewayProviderAccount>
  ) {
    await db
      .update(paymentGatewayProviderAccount)
      .set(data)
      .where(eq(paymentGatewayProviderAccount.id, id));
    return this.getById(id);
  },

  async delete(id: number) {
    return db
      .delete(paymentGatewayProviderAccount)
      .where(eq(paymentGatewayProviderAccount.id, id));
  },
};
