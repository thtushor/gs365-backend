import { Response } from "express";
import { WithdrawalPaymentAccountModel } from "../models/withdrawalPaymentAccount.model";
import { asyncHandler } from "../utils/asyncHandler";
import { AuthenticatedRequest } from "../utils/types";

// Create a new withdrawal payment account
export const createWithdrawalPaymentAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log("🔄 Creating withdrawal payment account...");
    
    const {
      userId,
      paymentGatewayId,
      accountNumber,
      holderName,
      provider,
      bankName,
      branchName,
      branchAddress,
      swiftCode,
      iban,
      routingNumber,
      walletAddress,
      network,
      accountHolderPhone,
      accountHolderEmail,
      country,
      state,
      city,
      address,
      postalCode,
      isPrimary = false,
      isVerified = false,
      isActive = true,
      verificationStatus = "pending",
      verificationNotes,
      minWithdrawalAmount,
      maxWithdrawalAmount,
      withdrawalFee,
      processingTime,
      additionalInfo,
    } = req.body;

    // Validate required fields
    if (!userId || !holderName) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: userId, holderName",
      });
    }

    // Validate payment gateway specific fields
    if (paymentGatewayId && !provider) {
      return res.status(400).json({
        success: false,
        message: "Provider is required when payment gateway ID is provided",
      });
    }

    if (provider === "bank" && !bankName) {
      return res.status(400).json({
        success: false,
        message: "Bank name is required for bank accounts",
      });
    }

    if (provider === "crypto" && !walletAddress) {
      return res.status(400).json({
        success: false,
        message: "Wallet address is required for cryptocurrency accounts",
      });
    }

    const accountData = {
      userId: Number(userId),
      paymentGatewayId: paymentGatewayId ? Number(paymentGatewayId) : null,
      accountNumber,
      holderName,
      provider,
      bankName,
      branchName,
      branchAddress,
      swiftCode,
      iban,
      routingNumber,
      walletAddress,
      network,
      accountHolderPhone,
      accountHolderEmail,
      country,
      state,
      city,
      address,
      postalCode,
      isPrimary,
      isVerified,
      isActive,
      verificationStatus,
      verificationNotes,
      minWithdrawalAmount,
      maxWithdrawalAmount,
      withdrawalFee,
      processingTime,
      additionalInfo,
      createdBy: req.user?.username || "system",
      updatedBy: req.user?.username || "system",
    };

    const result = await WithdrawalPaymentAccountModel.create(accountData);

    console.log("✅ Withdrawal payment account created successfully");

    res.status(201).json({
      success: true,
      message: "Withdrawal payment account created successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error creating withdrawal payment account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create withdrawal payment account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get withdrawal payment account by ID
export const getWithdrawalPaymentAccountById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid account ID is required",
      });
    }

    console.log(`🔄 Fetching withdrawal payment account ID: ${id}`);

    const result = await WithdrawalPaymentAccountModel.getById(Number(id));

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal payment account not found",
      });
    }

    console.log("✅ Withdrawal payment account fetched successfully");

    res.status(200).json({
      success: true,
      message: "Withdrawal payment account retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error fetching withdrawal payment account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawal payment account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get withdrawal payment accounts with filters
export const getWithdrawalPaymentAccounts = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log("🔄 Fetching withdrawal payment accounts...");
    
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
    } = req.query;

    // Parse and validate parameters
    const filters = {
      userId: userId ? Number(userId) : undefined,
      paymentGatewayId: paymentGatewayId ? Number(paymentGatewayId) : undefined,
      provider: provider ? (Array.isArray(provider) ? provider : [provider]) as string[] : undefined,
      isActive: isActive !== undefined ? isActive === "true" : undefined,
      verificationStatus: verificationStatus ? (Array.isArray(verificationStatus) ? verificationStatus : [verificationStatus]) as string[] : undefined,
      country: country as string | undefined,
      isPrimary: isPrimary !== undefined ? isPrimary === "true" : undefined,
      limit: Number(limit),
      offset: Number(offset),
      sortBy: sortBy as "createdAt" | "updatedAt" | "holderName" | "provider",
      sortOrder: sortOrder as "asc" | "desc",
    };

    // Validate numeric parameters
    if (filters.limit < 1 || filters.limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100",
      });
    }

    if (filters.offset < 0) {
      return res.status(400).json({
        success: false,
        message: "Offset must be non-negative",
      });
    }

    const result = await WithdrawalPaymentAccountModel.getWithFilters(filters);

    console.log("✅ Withdrawal payment accounts fetched successfully");

    res.status(200).json({
      success: true,
      message: "Withdrawal payment accounts retrieved successfully",
      data: result.data,
      pagination: result.pagination,
      total: result.total,
    });
  } catch (error) {
    console.error("❌ Error fetching withdrawal payment accounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch withdrawal payment accounts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get withdrawal payment accounts by user ID
export const getWithdrawalPaymentAccountsByUserId = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    console.log(`🔄 Fetching withdrawal payment accounts for user ID: ${userId}`);

    const result = await WithdrawalPaymentAccountModel.getByUserId(Number(userId));

    console.log("✅ User withdrawal payment accounts fetched successfully");

    res.status(200).json({
      success: true,
      message: "User withdrawal payment accounts retrieved successfully",
      data: result,
      total: result.length,
    });
  } catch (error) {
    console.error("❌ Error fetching user withdrawal payment accounts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user withdrawal payment accounts",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get primary withdrawal payment account for user
export const getPrimaryWithdrawalPaymentAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    console.log(`🔄 Fetching primary withdrawal payment account for user ID: ${userId}`);

    const result = await WithdrawalPaymentAccountModel.getPrimaryByUserId(Number(userId));

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "No primary withdrawal payment account found for this user",
      });
    }

    console.log("✅ Primary withdrawal payment account fetched successfully");

    res.status(200).json({
      success: true,
      message: "Primary withdrawal payment account retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error fetching primary withdrawal payment account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch primary withdrawal payment account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Update withdrawal payment account
export const updateWithdrawalPaymentAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid account ID is required",
      });
    }

    console.log(`🔄 Updating withdrawal payment account ID: ${id}`);

    const updateData = {
      ...req.body,
      updatedBy: req.user?.username || "system",
    };

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.userId;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    const result = await WithdrawalPaymentAccountModel.update(Number(id), updateData);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal payment account not found",
      });
    }

    console.log("✅ Withdrawal payment account updated successfully");

    res.status(200).json({
      success: true,
      message: "Withdrawal payment account updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error updating withdrawal payment account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update withdrawal payment account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Delete withdrawal payment account
export const deleteWithdrawalPaymentAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid account ID is required",
      });
    }

    console.log(`🔄 Deleting withdrawal payment account ID: ${id}`);

    const result = await WithdrawalPaymentAccountModel.delete(Number(id));

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal payment account not found",
      });
    }

    console.log("✅ Withdrawal payment account deleted successfully");

    res.status(200).json({
      success: true,
      message: "Withdrawal payment account deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting withdrawal payment account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete withdrawal payment account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Deactivate withdrawal payment account
export const deactivateWithdrawalPaymentAccount = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid account ID is required",
      });
    }

    console.log(`🔄 Deactivating withdrawal payment account ID: ${id}`);

    const result = await WithdrawalPaymentAccountModel.deactivate(Number(id));

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal payment account not found",
      });
    }

    console.log("✅ Withdrawal payment account deactivated successfully");

    res.status(200).json({
      success: true,
      message: "Withdrawal payment account deactivated successfully",
    });
  } catch (error) {
    console.error("❌ Error deactivating withdrawal payment account:", error);
    res.status(500).json({
      success: false,
      message: "Failed to deactivate withdrawal payment account",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Set account as primary
export const setAccountAsPrimary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid account ID is required",
      });
    }

    if (!userId || isNaN(Number(userId))) {
      return res.status(400).json({
        success: false,
        message: "Valid user ID is required",
      });
    }

    console.log(`🔄 Setting withdrawal payment account ID: ${id} as primary for user ID: ${userId}`);

    const result = await WithdrawalPaymentAccountModel.setAsPrimary(Number(id), Number(userId));

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal payment account not found",
      });
    }

    console.log("✅ Withdrawal payment account set as primary successfully");

    res.status(200).json({
      success: true,
      message: "Withdrawal payment account set as primary successfully",
    });
  } catch (error) {
    console.error("❌ Error setting account as primary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to set account as primary",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Update verification status
export const updateVerificationStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({
        success: false,
        message: "Valid account ID is required",
      });
    }

    if (!status || !["pending", "verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid verification status is required (pending, verified, rejected)",
      });
    }

    console.log(`🔄 Updating verification status for withdrawal payment account ID: ${id} to: ${status}`);

    const result = await WithdrawalPaymentAccountModel.updateVerificationStatus(Number(id), status, notes);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Withdrawal payment account not found",
      });
    }

    console.log("✅ Verification status updated successfully");

    res.status(200).json({
      success: true,
      message: "Verification status updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating verification status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update verification status",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get account statistics
export const getAccountStats = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.query;
    
    console.log("🔄 Fetching withdrawal payment account statistics...");

    const result = await WithdrawalPaymentAccountModel.getAccountStats(
      userId ? Number(userId) : undefined
    );

    console.log("✅ Account statistics fetched successfully");

    res.status(200).json({
      success: true,
      message: "Account statistics retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error fetching account statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch account statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});
