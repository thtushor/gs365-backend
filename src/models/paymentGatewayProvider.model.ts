import { db } from "../db/connection";
import {
  NewPaymentGatewayProvider,
  PaymentGatewayProvider,
  paymentGatewayProvider,
} from "../db/schema/paymentGatewayProvider";
import { paymentGateway } from "../db/schema/paymentGateway";
import { paymentProvider } from "../db/schema/paymentProvider";
import { eq, sql, and, desc, asc } from "drizzle-orm";

export const PaymentGatewayProviderModel = {
  async getAll(filter: any = {}) {
    const whereCondition = [];
    if (filter.gatewayId)
      whereCondition.push(
        eq(paymentGatewayProvider.gatewayId, filter.gatewayId)
      );
    if (filter.providerId)
      whereCondition.push(
        eq(paymentGatewayProvider.providerId, filter.providerId)
      );

    if (filter.status) {
      whereCondition.push(eq(paymentGatewayProvider.status, filter.status));
    }

    // Pagination parameters
    const page = parseInt(filter.page as string) || 1;
    const pageSize = parseInt(filter.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(paymentGatewayProvider)
      .where(whereCondition.length ? and(...whereCondition) : undefined);

    // Get paginated data
    const data = await db
      .select({
        id: paymentGatewayProvider.id,
        gatewayId: paymentGatewayProvider.gatewayId,
        providerId: paymentGatewayProvider.providerId,
        priority: paymentGatewayProvider.priority,
        status: paymentGatewayProvider.status,
        isRecommended: paymentGatewayProvider?.isRecommended,
        licenseKey: paymentGatewayProvider?.licenseKey,
        commission: paymentGatewayProvider?.commission || 0,
        provider: {
          id: paymentProvider.id,
          name: paymentProvider.name,
          contactInfo: paymentProvider.contactInfo,
          commissionPercentage: paymentProvider.commissionPercentage,
          status: paymentProvider.status,
        },
        gateway: {
          id: paymentGateway.id,
          name: paymentGateway.name,
          methodId: paymentGateway.methodId,
          status: paymentGateway.status,
          iconUrl: paymentGateway.iconUrl,
          minDeposit: paymentGateway.minDeposit,
          maxDeposit: paymentGateway.maxDeposit,
          minWithdraw: paymentGateway.minWithdraw,
          maxWithdraw: paymentGateway.maxWithdraw,
          countryId: paymentGateway.countryId,
          network: paymentGateway.network,
          currencyConversionRate: paymentGateway.currencyConversionRate,
        },
      })
      .from(paymentGatewayProvider)
      .leftJoin(
        paymentGateway,
        eq(paymentGatewayProvider.gatewayId, paymentGateway.id)
      )
      .leftJoin(
        paymentProvider,
        eq(paymentGatewayProvider.providerId, paymentProvider.id)
      )
      .where(whereCondition.length ? and(...whereCondition) : undefined)
      .limit(pageSize)
      .offset(offset)
      .orderBy(
        asc(paymentGatewayProvider.priority),
        desc(paymentGatewayProvider.id)
      );

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

  async getByGatewayId(gatewayId: number) {
    return db
      .select({
        id: paymentGatewayProvider.id,
        gatewayId: paymentGatewayProvider.gatewayId,
        providerId: paymentGatewayProvider.providerId,
        priority: paymentGatewayProvider.priority,
        status: paymentGatewayProvider.status,
        provider: {
          id: paymentProvider.id,
          name: paymentProvider.name,
          contactInfo: paymentProvider.contactInfo,
          commissionPercentage: paymentProvider.commissionPercentage,
          status: paymentProvider.status,
        },
        gateway: {
          id: paymentGateway.id,
          name: paymentGateway.name,
          methodId: paymentGateway.methodId,
          status: paymentGateway.status,
          iconUrl: paymentGateway.iconUrl,
          minDeposit: paymentGateway.minDeposit,
          maxDeposit: paymentGateway.maxDeposit,
          minWithdraw: paymentGateway.minWithdraw,
          maxWithdraw: paymentGateway.maxWithdraw,
          countryId: paymentGateway.countryId,
          network: paymentGateway.network,
          currencyConversionRate: paymentGateway.currencyConversionRate,
        },
      })
      .from(paymentGatewayProvider)
      .innerJoin(
        paymentProvider,
        eq(paymentGatewayProvider.providerId, paymentProvider.id)
      )
      .innerJoin(
        paymentGateway,
        eq(paymentGatewayProvider.gatewayId, paymentGateway.id)
      )
      .where(eq(paymentGatewayProvider.gatewayId, gatewayId))
      .orderBy(
        asc(paymentGatewayProvider.priority),
        desc(paymentGatewayProvider.id)
      );
  },

  async getByProviderId(providerId: number, filter: any = {}) {
    const whereCondition = [eq(paymentGatewayProvider.providerId, providerId)];

    if (filter.status) {
      whereCondition.push(eq(paymentGatewayProvider.status, filter.status));
    }

    // Pagination parameters
    const page = parseInt(filter.page as string) || 1;
    const pageSize = parseInt(filter.pageSize as string) || 10;
    const offset = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(paymentGatewayProvider)
      .where(and(...whereCondition));

    // Get paginated data
    const data = await db
      .select({
        id: paymentGatewayProvider.id,
        gatewayId: paymentGatewayProvider.gatewayId,
        providerId: paymentGatewayProvider.providerId,
        priority: paymentGatewayProvider.priority,
        status: paymentGatewayProvider.status,
        isRecommended: paymentGatewayProvider?.isRecommended,
        licenseKey: paymentGatewayProvider?.licenseKey,
        commission: paymentGatewayProvider?.commission,
        provider: {
          id: paymentProvider.id,
          name: paymentProvider.name,
          contactInfo: paymentProvider.contactInfo,
          commissionPercentage: paymentProvider.commissionPercentage,
          status: paymentProvider.status,
        },
        gateway: {
          id: paymentGateway.id,
          name: paymentGateway.name,
          methodId: paymentGateway.methodId,
          status: paymentGateway.status,
          iconUrl: paymentGateway.iconUrl,
          minDeposit: paymentGateway.minDeposit,
          maxDeposit: paymentGateway.maxDeposit,
          minWithdraw: paymentGateway.minWithdraw,
          maxWithdraw: paymentGateway.maxWithdraw,
          countryId: paymentGateway.countryId,
          network: paymentGateway.network,
          currencyConversionRate: paymentGateway.currencyConversionRate,
        },
      })
      .from(paymentGatewayProvider)
      .innerJoin(
        paymentProvider,
        eq(paymentGatewayProvider.providerId, paymentProvider.id)
      )
      .innerJoin(
        paymentGateway,
        eq(paymentGatewayProvider.gatewayId, paymentGateway.id)
      )
      .where(and(...whereCondition))
      .limit(pageSize)
      .offset(offset)
      .orderBy(
        asc(paymentGatewayProvider.priority),
        desc(paymentGatewayProvider.id)
      );

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

  async create(data: typeof NewPaymentGatewayProvider) {
    return db.insert(paymentGatewayProvider).values(data);
  },

  async update(id: number, data: any) {
    return db
      .update(paymentGatewayProvider)
      .set(data)
      .where(eq(paymentGatewayProvider.id, id));
  },

  async delete(id: number) {
    return db
      .delete(paymentGatewayProvider)
      .where(sql`${paymentGatewayProvider.id} = ${id}`);
  },

  async deleteByGatewayAndProvider(gatewayId: number, providerId: number) {
    return db
      .delete(paymentGatewayProvider)
      .where(
        and(
          eq(paymentGatewayProvider.gatewayId, gatewayId),
          eq(paymentGatewayProvider.providerId, providerId)
        )
      );
  },

  async updateOtherRecommendations(gatewayId: number, excludeId: number) {
    return db
      .update(paymentGatewayProvider)
      .set({ isRecommended: false })
      .where(
        and(
          eq(paymentGatewayProvider.gatewayId, gatewayId),
          sql`${paymentGatewayProvider.id} != ${excludeId}`
        )
      );
  },
};
