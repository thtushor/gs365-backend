import { eq, and, sql, desc, asc, like, inArray } from "drizzle-orm";
import { db } from "../db/connection";
import { withdrawalPaymentAccounts, users, paymentGateway } from "../db/schema";

export interface WithdrawalPaymentAccountFilters {
  userId?: number;
  paymentGatewayId?: number;
  provider?: string[];
  isActive?: boolean;
  verificationStatus?: string[];
  country?: string;
  isPrimary?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "createdAt" | "updatedAt" | "holderName" | "provider";
  sortOrder?: "asc" | "desc";
}

export interface WithdrawalPaymentAccountWithUser {
  id: number;
  userId: number;
  paymentGatewayId: number | null;
  accountNumber: string | null;
  holderName: string | null;
  provider: string | null;
  bankName: string | null;
  branchName: string | null;
  branchAddress: string | null;
  swiftCode: string | null;
  iban: string | null;
  routingNumber: string | null;
  walletAddress: string | null;
  network: string | null;
  accountHolderPhone: string | null;
  accountHolderEmail: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  postalCode: string | null;
  isPrimary: boolean | null;
  isVerified: boolean | null;
  isActive: boolean | null;
  verificationStatus: string | null;
  verificationNotes: string | null;
  minWithdrawalAmount: string | null;
  maxWithdrawalAmount: string | null;
  withdrawalFee: string | null;
  processingTime: string | null;
  additionalInfo: string | null;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  user: {
    id: number;
    username: string | null;
    email: string | null;
  } | null;
  paymentGateway: {
    id: number;
    name: string | null;
    methodId: number;
    status: string | null;
  } | null;
}

export const WithdrawalPaymentAccountModel = {
  // Create a new withdrawal payment account
  async create(data: Omit<WithdrawalPaymentAccountWithUser, "id" | "createdAt" | "updatedAt" | "user" | "paymentGateway">): Promise<WithdrawalPaymentAccountWithUser> {
    try {
      // If this is set as primary, unset other primary accounts for the same user
      if (data.isPrimary) {
        await db
          .update(withdrawalPaymentAccounts)
          .set({ isPrimary: false })
          .where(and(
            eq(withdrawalPaymentAccounts.userId, data.userId),
            eq(withdrawalPaymentAccounts.isPrimary, true)
          ));
      }

      await db
        .insert(withdrawalPaymentAccounts)
        .values({
          userId: data.userId,
          paymentGatewayId: data.paymentGatewayId,
          accountNumber: data.accountNumber,
          holderName: data.holderName,
          provider: data.provider,
          bankName: data.bankName,
          branchName: data.branchName,
          branchAddress: data.branchAddress,
          swiftCode: data.swiftCode,
          iban: data.iban,
          routingNumber: data.routingNumber,
          walletAddress: data.walletAddress,
          network: data.network,
          accountHolderPhone: data.accountHolderPhone,
          accountHolderEmail: data.accountHolderEmail,
          country: data.country,
          state: data.state,
          city: data.city,
          address: data.address,
          postalCode: data.postalCode,
          isPrimary: data.isPrimary,
          isVerified: data.isVerified,
          isActive: data.isActive,
          verificationStatus: data.verificationStatus,
          verificationNotes: data.verificationNotes,
          minWithdrawalAmount: data.minWithdrawalAmount,
          maxWithdrawalAmount: data.maxWithdrawalAmount,
          withdrawalFee: data.withdrawalFee,
          processingTime: data.processingTime,
          additionalInfo: data.additionalInfo,
          createdBy: data.createdBy,
          updatedBy: data.updatedBy,
        });

      // Fetch the created record to return the complete object with ID and timestamps
      const createdRecord = await this.getByUserId(data.userId);
      const foundRecord = createdRecord.find(record => 
        record.userId === data.userId && 
        record.holderName === data.holderName &&
        record.provider === data.provider
      );
      
      if (!foundRecord) {
        throw new Error("Failed to create withdrawal payment account - record not found after creation");
      }
      
      return foundRecord;
    } catch (error) {
      console.error("Error creating withdrawal payment account:", error);
      throw error;
    }
  },

  // Get withdrawal payment account by ID
  async getById(id: number): Promise<WithdrawalPaymentAccountWithUser | null> {
    try {
      const [result] = await db
        .select({
          id: withdrawalPaymentAccounts.id,
          userId: withdrawalPaymentAccounts.userId,
          paymentGatewayId: withdrawalPaymentAccounts.paymentGatewayId,
          accountNumber: withdrawalPaymentAccounts.accountNumber,
          holderName: withdrawalPaymentAccounts.holderName,
          provider: withdrawalPaymentAccounts.provider,
          bankName: withdrawalPaymentAccounts.bankName,
          branchName: withdrawalPaymentAccounts.branchName,
          branchAddress: withdrawalPaymentAccounts.branchAddress,
          swiftCode: withdrawalPaymentAccounts.swiftCode,
          iban: withdrawalPaymentAccounts.iban,
          routingNumber: withdrawalPaymentAccounts.routingNumber,
          walletAddress: withdrawalPaymentAccounts.walletAddress,
          network: withdrawalPaymentAccounts.network,
          accountHolderPhone: withdrawalPaymentAccounts.accountHolderPhone,
          accountHolderEmail: withdrawalPaymentAccounts.accountHolderEmail,
          country: withdrawalPaymentAccounts.country,
          state: withdrawalPaymentAccounts.state,
          city: withdrawalPaymentAccounts.city,
          address: withdrawalPaymentAccounts.address,
          postalCode: withdrawalPaymentAccounts.postalCode,
          isPrimary: withdrawalPaymentAccounts.isPrimary,
          isVerified: withdrawalPaymentAccounts.isVerified,
          isActive: withdrawalPaymentAccounts.isActive,
          verificationStatus: withdrawalPaymentAccounts.verificationStatus,
          verificationNotes: withdrawalPaymentAccounts.verificationNotes,
          minWithdrawalAmount: withdrawalPaymentAccounts.minWithdrawalAmount,
          maxWithdrawalAmount: withdrawalPaymentAccounts.maxWithdrawalAmount,
          withdrawalFee: withdrawalPaymentAccounts.withdrawalFee,
          processingTime: withdrawalPaymentAccounts.processingTime,
          additionalInfo: withdrawalPaymentAccounts.additionalInfo,
          createdBy: withdrawalPaymentAccounts.createdBy,
          updatedBy: withdrawalPaymentAccounts.updatedBy,
          createdAt: withdrawalPaymentAccounts.createdAt,
          updatedAt: withdrawalPaymentAccounts.updatedAt,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
          },
          paymentGateway: {
            id: paymentGateway.id,
            name: paymentGateway.name,
            methodId: paymentGateway.methodId,
            status: paymentGateway.status,
          },
        })
        .from(withdrawalPaymentAccounts)
        .leftJoin(users, eq(withdrawalPaymentAccounts.userId, users.id))
        .leftJoin(paymentGateway, eq(withdrawalPaymentAccounts.paymentGatewayId, paymentGateway.id))
        .where(eq(withdrawalPaymentAccounts.id, id))
        .limit(1);

      return result || null;
    } catch (error) {
      console.error("Error fetching withdrawal payment account by ID:", error);
      throw error;
    }
  },

  // Get withdrawal payment accounts with filters and pagination
  async getWithFilters(filters: WithdrawalPaymentAccountFilters): Promise<{
    data: WithdrawalPaymentAccountWithUser[];
    total: number;
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
    try {
      const {
        userId,
        paymentGatewayId,
        provider,
        isActive,
        verificationStatus,
        country,
        isPrimary,
        limit = 50,
        offset = 0,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = filters;

      // Build where conditions
      const whereConditions = [];

      if (userId) {
        whereConditions.push(eq(withdrawalPaymentAccounts.userId, userId));
      }

      if (paymentGatewayId) {
        whereConditions.push(eq(withdrawalPaymentAccounts.paymentGatewayId, paymentGatewayId));
      }

      if (provider && provider.length > 0) {
        whereConditions.push(inArray(withdrawalPaymentAccounts.provider, provider));
      }

      if (isActive !== undefined) {
        whereConditions.push(eq(withdrawalPaymentAccounts.isActive, isActive));
      }

      if (verificationStatus && verificationStatus.length > 0) {
        whereConditions.push(inArray(withdrawalPaymentAccounts.verificationStatus, verificationStatus));
      }

      if (country) {
        whereConditions.push(like(withdrawalPaymentAccounts.country, `%${country}%`));
      }

      if (isPrimary !== undefined) {
        whereConditions.push(eq(withdrawalPaymentAccounts.isPrimary, isPrimary));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get total count for pagination
      const countQuery = db
        .select({ count: sql<number>`count(*)` })
        .from(withdrawalPaymentAccounts);

      if (whereClause) {
        countQuery.where(whereClause);
      }

      const totalResult = await countQuery;
      const total = totalResult[0]?.count || 0;

      // Build order-by expression
      let orderByExpr: any;
      switch (sortBy) {
        case "holderName":
          orderByExpr = withdrawalPaymentAccounts.holderName;
          break;
        case "provider":
          orderByExpr = withdrawalPaymentAccounts.provider;
          break;
        case "updatedAt":
          orderByExpr = withdrawalPaymentAccounts.updatedAt;
          break;
        default:
          orderByExpr = withdrawalPaymentAccounts.createdAt;
      }

      // Main query with joins
      const results = await db
        .select({
          id: withdrawalPaymentAccounts.id,
          userId: withdrawalPaymentAccounts.userId,
          paymentGatewayId: withdrawalPaymentAccounts.paymentGatewayId,
          accountNumber: withdrawalPaymentAccounts.accountNumber,
          holderName: withdrawalPaymentAccounts.holderName,
          provider: withdrawalPaymentAccounts.provider,
          bankName: withdrawalPaymentAccounts.bankName,
          branchName: withdrawalPaymentAccounts.branchName,
          branchAddress: withdrawalPaymentAccounts.branchAddress,
          swiftCode: withdrawalPaymentAccounts.swiftCode,
          iban: withdrawalPaymentAccounts.iban,
          routingNumber: withdrawalPaymentAccounts.routingNumber,
          walletAddress: withdrawalPaymentAccounts.walletAddress,
          network: withdrawalPaymentAccounts.network,
          accountHolderPhone: withdrawalPaymentAccounts.accountHolderPhone,
          accountHolderEmail: withdrawalPaymentAccounts.accountHolderEmail,
          country: withdrawalPaymentAccounts.country,
          state: withdrawalPaymentAccounts.state,
          city: withdrawalPaymentAccounts.city,
          address: withdrawalPaymentAccounts.address,
          postalCode: withdrawalPaymentAccounts.postalCode,
          isPrimary: withdrawalPaymentAccounts.isPrimary,
          isVerified: withdrawalPaymentAccounts.isVerified,
          isActive: withdrawalPaymentAccounts.isActive,
          verificationStatus: withdrawalPaymentAccounts.verificationStatus,
          verificationNotes: withdrawalPaymentAccounts.verificationNotes,
          minWithdrawalAmount: withdrawalPaymentAccounts.minWithdrawalAmount,
          maxWithdrawalAmount: withdrawalPaymentAccounts.maxWithdrawalAmount,
          withdrawalFee: withdrawalPaymentAccounts.withdrawalFee,
          processingTime: withdrawalPaymentAccounts.processingTime,
          additionalInfo: withdrawalPaymentAccounts.additionalInfo,
          createdBy: withdrawalPaymentAccounts.createdBy,
          updatedBy: withdrawalPaymentAccounts.updatedBy,
          createdAt: withdrawalPaymentAccounts.createdAt,
          updatedAt: withdrawalPaymentAccounts.updatedAt,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
          },
          paymentGateway: {
            id: paymentGateway.id,
            name: paymentGateway.name,
            methodId: paymentGateway.methodId,
            status: paymentGateway.status,
          },
        })
        .from(withdrawalPaymentAccounts)
        .leftJoin(users, eq(withdrawalPaymentAccounts.userId, users.id))
        .leftJoin(paymentGateway, eq(withdrawalPaymentAccounts.paymentGatewayId, paymentGateway.id))
        .where(whereClause)
        .orderBy(sortOrder === "desc" ? desc(orderByExpr) : asc(orderByExpr))
        .limit(limit)
        .offset(offset);

      // Calculate pagination
      const currentOffset = filters.offset || 0;
      const currentLimit = filters.limit || 50;
      const page = Math.floor(currentOffset / currentLimit) + 1;
      const pageSize = currentLimit;
      const totalPages = Math.ceil(total / currentLimit);

      return {
        data: results,
        total,
        pagination: {
          page,
          pageSize,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error fetching withdrawal payment accounts with filters:", error);
      throw error;
    }
  },

  // Get all withdrawal payment accounts for a specific user
  async getByUserId(userId: number): Promise<WithdrawalPaymentAccountWithUser[]> {
    try {
      const results = await db
        .select({
          id: withdrawalPaymentAccounts.id,
          userId: withdrawalPaymentAccounts.userId,
          paymentGatewayId: withdrawalPaymentAccounts.paymentGatewayId,
          accountNumber: withdrawalPaymentAccounts.accountNumber,
          holderName: withdrawalPaymentAccounts.holderName,
          provider: withdrawalPaymentAccounts.provider,
          bankName: withdrawalPaymentAccounts.bankName,
          branchName: withdrawalPaymentAccounts.branchName,
          branchAddress: withdrawalPaymentAccounts.branchAddress,
          swiftCode: withdrawalPaymentAccounts.swiftCode,
          iban: withdrawalPaymentAccounts.iban,
          routingNumber: withdrawalPaymentAccounts.routingNumber,
          walletAddress: withdrawalPaymentAccounts.walletAddress,
          network: withdrawalPaymentAccounts.network,
          accountHolderPhone: withdrawalPaymentAccounts.accountHolderPhone,
          accountHolderEmail: withdrawalPaymentAccounts.accountHolderEmail,
          country: withdrawalPaymentAccounts.country,
          state: withdrawalPaymentAccounts.state,
          city: withdrawalPaymentAccounts.city,
          address: withdrawalPaymentAccounts.address,
          postalCode: withdrawalPaymentAccounts.postalCode,
          isPrimary: withdrawalPaymentAccounts.isPrimary,
          isVerified: withdrawalPaymentAccounts.isVerified,
          isActive: withdrawalPaymentAccounts.isActive,
          verificationStatus: withdrawalPaymentAccounts.verificationStatus,
          verificationNotes: withdrawalPaymentAccounts.verificationNotes,
          minWithdrawalAmount: withdrawalPaymentAccounts.minWithdrawalAmount,
          maxWithdrawalAmount: withdrawalPaymentAccounts.maxWithdrawalAmount,
          withdrawalFee: withdrawalPaymentAccounts.withdrawalFee,
          processingTime: withdrawalPaymentAccounts.processingTime,
          additionalInfo: withdrawalPaymentAccounts.additionalInfo,
          createdBy: withdrawalPaymentAccounts.createdBy,
          updatedBy: withdrawalPaymentAccounts.updatedBy,
          createdAt: withdrawalPaymentAccounts.createdAt,
          updatedAt: withdrawalPaymentAccounts.updatedAt,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
          },
          paymentGateway: {
            id: paymentGateway.id,
            name: paymentGateway.name,
            methodId: paymentGateway.methodId,
            status: paymentGateway.status,
          },
        })
        .from(withdrawalPaymentAccounts)
        .leftJoin(users, eq(withdrawalPaymentAccounts.userId, users.id))
        .leftJoin(paymentGateway, eq(withdrawalPaymentAccounts.paymentGatewayId, paymentGateway.id))
        .where(eq(withdrawalPaymentAccounts.userId, userId))
        .orderBy(desc(withdrawalPaymentAccounts.isPrimary), desc(withdrawalPaymentAccounts.createdAt));

      return results;
    } catch (error) {
      console.error("Error fetching withdrawal payment accounts by user ID:", error);
      throw error;
    }
  },

  // Get primary withdrawal payment account for a user
  async getPrimaryByUserId(userId: number): Promise<WithdrawalPaymentAccountWithUser | null> {
    try {
      const [result] = await db
        .select({
          id: withdrawalPaymentAccounts.id,
          userId: withdrawalPaymentAccounts.userId,
          paymentGatewayId: withdrawalPaymentAccounts.paymentGatewayId,
          accountNumber: withdrawalPaymentAccounts.accountNumber,
          holderName: withdrawalPaymentAccounts.holderName,
          provider: withdrawalPaymentAccounts.provider,
          bankName: withdrawalPaymentAccounts.bankName,
          branchName: withdrawalPaymentAccounts.branchName,
          branchAddress: withdrawalPaymentAccounts.branchAddress,
          swiftCode: withdrawalPaymentAccounts.swiftCode,
          iban: withdrawalPaymentAccounts.iban,
          routingNumber: withdrawalPaymentAccounts.routingNumber,
          walletAddress: withdrawalPaymentAccounts.walletAddress,
          network: withdrawalPaymentAccounts.network,
          accountHolderPhone: withdrawalPaymentAccounts.accountHolderPhone,
          accountHolderEmail: withdrawalPaymentAccounts.accountHolderEmail,
          country: withdrawalPaymentAccounts.country,
          state: withdrawalPaymentAccounts.state,
          city: withdrawalPaymentAccounts.city,
          address: withdrawalPaymentAccounts.address,
          postalCode: withdrawalPaymentAccounts.postalCode,
          isPrimary: withdrawalPaymentAccounts.isPrimary,
          isVerified: withdrawalPaymentAccounts.isVerified,
          isActive: withdrawalPaymentAccounts.isActive,
          verificationStatus: withdrawalPaymentAccounts.verificationStatus,
          verificationNotes: withdrawalPaymentAccounts.verificationNotes,
          minWithdrawalAmount: withdrawalPaymentAccounts.minWithdrawalAmount,
          maxWithdrawalAmount: withdrawalPaymentAccounts.maxWithdrawalAmount,
          withdrawalFee: withdrawalPaymentAccounts.withdrawalFee,
          processingTime: withdrawalPaymentAccounts.processingTime,
          additionalInfo: withdrawalPaymentAccounts.additionalInfo,
          createdBy: withdrawalPaymentAccounts.createdBy,
          updatedBy: withdrawalPaymentAccounts.updatedBy,
          createdAt: withdrawalPaymentAccounts.createdAt,
          updatedAt: withdrawalPaymentAccounts.updatedAt,
          user: {
            id: users.id,
            username: users.username,
            email: users.email,
          },
          paymentGateway: {
            id: paymentGateway.id,
            name: paymentGateway.name,
            methodId: paymentGateway.methodId,
            status: paymentGateway.status,
          },
        })
        .from(withdrawalPaymentAccounts)
        .leftJoin(users, eq(withdrawalPaymentAccounts.userId, users.id))
        .leftJoin(paymentGateway, eq(withdrawalPaymentAccounts.paymentGatewayId, paymentGateway.id))
        .where(and(
          eq(withdrawalPaymentAccounts.userId, userId),
          eq(withdrawalPaymentAccounts.isPrimary, true),
          eq(withdrawalPaymentAccounts.isActive, true)
        ))
        .limit(1);

      return result || null;
    } catch (error) {
      console.error("Error fetching primary withdrawal payment account:", error);
      throw error;
    }
  },

  // Update withdrawal payment account
  async update(id: number, data: Partial<WithdrawalPaymentAccountWithUser>): Promise<WithdrawalPaymentAccountWithUser | null> {
    try {
      // If this is set as primary, unset other primary accounts for the same user
      if (data.isPrimary && data.userId) {
        await db
          .update(withdrawalPaymentAccounts)
          .set({ isPrimary: false })
          .where(and(
            eq(withdrawalPaymentAccounts.userId, data.userId),
            eq(withdrawalPaymentAccounts.isPrimary, true),
            sql`${withdrawalPaymentAccounts.id} != ${id}`
          ));
      }

      await db
        .update(withdrawalPaymentAccounts)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(withdrawalPaymentAccounts.id, id));

      // Fetch the updated record with user details
      return await this.getById(id);
    } catch (error) {
      console.error("Error updating withdrawal payment account:", error);
      throw error;
    }
  },

  // Delete withdrawal payment account
  async delete(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(withdrawalPaymentAccounts)
        .where(eq(withdrawalPaymentAccounts.id, id));

      // For MySQL2, we need to check if the operation was successful
      return true; // If no error was thrown, the operation was successful
    } catch (error) {
      console.error("Error deleting withdrawal payment account:", error);
      return false;
    }
  },

  // Soft delete (deactivate) withdrawal payment account
  async deactivate(id: number): Promise<boolean> {
    try {
      await db
        .update(withdrawalPaymentAccounts)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(withdrawalPaymentAccounts.id, id));

      return true; // If no error was thrown, the operation was successful
    } catch (error) {
      console.error("Error deactivating withdrawal payment account:", error);
      return false;
    }
  },

  // Set account as primary
  async setAsPrimary(id: number, userId: number): Promise<boolean> {
    try {
      // Unset other primary accounts for the same user
      await db
        .update(withdrawalPaymentAccounts)
        .set({ isPrimary: false })
        .where(and(
          eq(withdrawalPaymentAccounts.userId, userId),
          eq(withdrawalPaymentAccounts.isPrimary, true)
        ));

      // Set this account as primary
      await db
        .update(withdrawalPaymentAccounts)
        .set({ 
          isPrimary: true,
          updatedAt: new Date()
        })
        .where(eq(withdrawalPaymentAccounts.id, id));

      return true; // If no error was thrown, the operation was successful
    } catch (error) {
      console.error("Error setting withdrawal payment account as primary:", error);
      return false;
    }
  },

  // Update verification status
  async updateVerificationStatus(id: number, status: string, notes?: string): Promise<boolean> {
    try {
      await db
        .update(withdrawalPaymentAccounts)
        .set({ 
          verificationStatus: status,
          verificationNotes: notes,
          updatedAt: new Date()
        })
        .where(eq(withdrawalPaymentAccounts.id, id));

      return true; // If no error was thrown, the operation was successful
    } catch (error) {
      console.error("Error updating verification status:", error);
      return false;
    }
  },

  // Get account statistics
  async getAccountStats(userId?: number): Promise<{
    totalAccounts: number;
    activeAccounts: number;
    verifiedAccounts: number;
    pendingVerification: number;
    providers: { provider: string; count: number }[];
  }> {
    try {
      const whereConditions = [];
      if (userId) {
        whereConditions.push(eq(withdrawalPaymentAccounts.userId, userId));
      }

      const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Get basic counts
      const [stats] = await db
        .select({
          totalAccounts: sql<number>`COUNT(*)`,
          activeAccounts: sql<number>`COUNT(CASE WHEN ${withdrawalPaymentAccounts.isActive} = true THEN 1 END)`,
          verifiedAccounts: sql<number>`COUNT(CASE WHEN ${withdrawalPaymentAccounts.verificationStatus} = 'verified' THEN 1 END)`,
          pendingVerification: sql<number>`COUNT(CASE WHEN ${withdrawalPaymentAccounts.verificationStatus} = 'pending' THEN 1 END)`,
        })
        .from(withdrawalPaymentAccounts)
        .where(whereClause);

      // Get providers distribution
      const providers = await db
        .select({
          provider: withdrawalPaymentAccounts.provider,
          count: sql<number>`COUNT(*)`,
        })
        .from(withdrawalPaymentAccounts)
        .where(whereClause)
        .groupBy(withdrawalPaymentAccounts.provider)
        .orderBy(desc(sql`COUNT(*)`));

      return {
        totalAccounts: stats.totalAccounts || 0,
        activeAccounts: stats.activeAccounts || 0,
        verifiedAccounts: stats.verifiedAccounts || 0,
        pendingVerification: stats.pendingVerification || 0,
        providers: providers.map(p => ({
          provider: p.provider || "unknown",
          count: p.count || 0,
        })),
      };
    } catch (error) {
      console.error("Error fetching account statistics:", error);
      throw error;
    }
  },
};
