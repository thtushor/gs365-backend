import { db } from "../db/connection";
import {
  NewPaymentProvider,
  PaymentProvider,
  paymentProvider,
} from "../db/schema/paymentProvider";
import { eq, sql, and, like } from "drizzle-orm";

export const PaymentProviderModel = {
  async getAll(filter: any = {}) {
    const whereCondition = [];
    if (filter.status)
      whereCondition.push(eq(paymentProvider.status, filter.status));
    if (filter.name)
      whereCondition.push(like(paymentProvider.name, `%${filter.name}%`));
    if (filter.commissionPercentage !== undefined)
      whereCondition.push(
        eq(
          paymentProvider.commissionPercentage,
          Number(filter.commissionPercentage)
        )
      );

    // Pagination parameters
    const page = parseInt(filter.page as string) || 1;
    const pageSize = parseInt(filter.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(paymentProvider)
      .where(whereCondition.length ? and(...whereCondition) : undefined);

    // Get paginated data
    const data = await db
      .select()
      .from(paymentProvider)
      .where(whereCondition.length ? and(...whereCondition) : undefined)
      .limit(pageSize)
      .offset(offset)
      .orderBy(paymentProvider.id);

    return {
      data,
      pagination: {
        page,
        pageSize: pageSize,
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
      .from(paymentProvider)
      .where(sql`${paymentProvider.id} = ${id}`);
  },

  async create(data: typeof NewPaymentProvider) {
    return db.insert(paymentProvider).values(data);
  },

  async update(id: number, data: any) {
    return db
      .update(paymentProvider)
      .set(data)
      .where(sql`${paymentProvider.id} = ${id}`);
  },

  async delete(id: number) {
    return db.delete(paymentProvider).where(sql`${paymentProvider.id} = ${id}`);
  },
};
