import { getPaymentMethodTypeById } from "../controllers/paymentMethodsTypes.controller";
import { db } from "../db/connection";
import {
  paymentGateway,
  paymentGatewayProvider,
  paymentGatewayProviderAccount,
  PaymentGatewayProviderAccount,
  paymentMethodTypes,
  paymentProvider,
} from "../db/schema";
import { paymentMethods } from "../db/schema/paymentMethods";
import { and, eq, sql } from "drizzle-orm";
import { PaymentMethodTypesModel } from "./paymentMethodsTypes.model";

export const PaymentMethodModel = {
  async getAll(filter: { status?: "active" | "inactive"; name?: string }) {
    return db
      .select()
      .from(paymentMethods)
      .where(
        and(
          filter.status ? eq(paymentMethods.status, filter.status) : undefined,
          filter.name ? eq(paymentMethods.name, filter.name) : undefined
        )
      );
  },
  async getById(id: number) {
    return db.select().from(paymentMethods).where(eq(paymentMethods.id, id));
  },
  async getPaymentMethodByName(
    name: string,
    { status }: { status?: "active" | "inactive" }
  ) {
    const method = await db
      .select()
      .from(paymentMethods)
      .where(
        and(
          eq(paymentMethods.name, name),
          status ? eq(paymentMethods.status, status) : undefined
        )
      );

    if (!method.length) {
      return [];
    }

    const paymentGatewaysWithProviders = await db
      .select({
        gateway: paymentGateway,
        provider: paymentProvider,
        gatewayProvider: paymentGatewayProvider,
      })
      .from(paymentGateway)
      .leftJoin(
        paymentGatewayProvider,
        eq(paymentGatewayProvider.gatewayId, paymentGateway.id)
      )
      .leftJoin(
        paymentProvider,
        eq(paymentProvider.id, paymentGatewayProvider.providerId)
      )
      .where(
        and(
          eq(paymentGateway.methodId, method[0].id),
          eq(paymentGateway.status, "active"),
          eq(paymentGatewayProvider.status, "active"),
          eq(paymentProvider.status, "active")
        )
      );

    // Group gateways with their providers
    const gatewaysMap = new Map<string | number, any>();

    // Process each row and fetch payment method types
    for (const row of paymentGatewaysWithProviders) {
      const gatewayId = row.gateway.id;

      if (!gatewaysMap.has(gatewayId)) {
        let parsedPaymentMethodTypeIds: number[] = [];
        try {
          if (row?.gateway?.paymentMethodTypeIds) {
            parsedPaymentMethodTypeIds = Array.isArray(
              row.gateway.paymentMethodTypeIds
            )
              ? row.gateway.paymentMethodTypeIds
              : JSON.parse(row.gateway.paymentMethodTypeIds as string);
          }
        } catch (error) {
          console.error("Error parsing paymentMethodTypeIds:", error);
          parsedPaymentMethodTypeIds = [];
        }

        const purifiedPaymentMethodType =
          typeof parsedPaymentMethodTypeIds === "string"
            ? []
            : parsedPaymentMethodTypeIds;

        // Fetch payment method types data for each ID
        const paymentMethodTypesData = [];
        for (const typeId of purifiedPaymentMethodType) {
          try {
            const typeData = await PaymentMethodTypesModel.getById(
              Number(typeId)
            );
            if (typeData && typeData.length > 0) {
              paymentMethodTypesData.push(typeData[0]);
            }
          } catch (error) {
            console.error(
              `Error fetching payment method type ${typeId}:`,
              error
            );
          }
        }

        gatewaysMap.set(gatewayId, {
          ...row.gateway,
          paymentMethodTypeIds:
            typeof parsedPaymentMethodTypeIds === "string"
              ? []
              : parsedPaymentMethodTypeIds,
          paymentMethodTypes: paymentMethodTypesData,
          providers: [],
        });
      }

      const accountData = row?.gatewayProvider?.id
        ? await db
            .select()
            .from(paymentGatewayProviderAccount)
            .where(
              eq(
                paymentGatewayProviderAccount.paymentGatewayProviderId,
                row?.gatewayProvider?.id
              )
            )
            .limit(1)
        : [];

      if (row.provider) {
        const existingProvider = gatewaysMap
          .get(gatewayId)
          .providers.find((p: any) => p.id === row.provider?.id);

        if (!existingProvider && row.provider) {
          gatewaysMap.get(gatewayId).providers.push({
            ...row.provider,
            licenseKey: row?.gatewayProvider?.licenseKey,
            commission: row?.gatewayProvider?.commission,
            isRecomended: row?.gatewayProvider?.isRecommended,
            gatewayProvider: {
              ...row?.gatewayProvider,
              account: accountData,
            },
          });
        }
      }
    }

    const paymentGateways = Array.from(gatewaysMap.values());

    return [
      {
        ...method[0],
        paymentGateways,
      },
    ];
  },
  async create(data: { name: string }) {
    return db.insert(paymentMethods).values(data);
  },
  async update(
    id: number,
    data: { name: string; status: "active" | "inactive" }
  ) {
    return db
      .update(paymentMethods)
      .set(data)
      .where(sql`${paymentMethods.id} = ${id}`);
  },
  async delete(id: number) {
    return db.delete(paymentMethods).where(sql`${paymentMethods.id} = ${id}`);
  },
};
