import { Request, Response } from "express";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { promotions } from "../db/schema/promotions";
import { settings } from "../db/schema/settings";
import { NewTurnover, turnover } from "../db/schema/turnover";
import { users } from "../db/schema/users";
import { games } from "../db/schema/games";
import { currencies } from "../db/schema/currency";
import {
  eq,
  and,
  like,
  asc,
  desc,
  sql,
  inArray,
  isNotNull,
  aliasedTable,
} from "drizzle-orm";
import { generateUniqueTransactionId } from "../utils/refCode";
import {
  adminUsers,
  commission,
  currencyConversion,
  paymentGateway,
  paymentGatewayProvider,
  paymentGatewayProviderAccount,
} from "../db/schema";
import { BalanceModel } from "../models/balance.model";
import { AdminMainBalanceModel } from "../models/adminMainBalance.model";

type CreateDepositBody = {
  userId: number;
  amount: number;
  givenTransactionId?: string;
  currencyId: number;
  promotionId?: number;
  paymentGatewayProviderAccountId?: number;
  notes?: string;
  attachment?: string;
};

export const createDeposit = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      amount,
      currencyId,
      promotionId,
      paymentGatewayProviderAccountId,
      notes,
      givenTransactionId,
      attachment,
    } = req.body as CreateDepositBody;

    const user = (req as any).user;

    if (!userId || !amount || !currencyId) {
      return res.status(400).json({
        status: false,
        message: "userId, amount and currencyId are required",
      });
    }

    const customTransactionId = await generateUniqueTransactionId();

    const [createdTxn] = await db.insert(transactions).values({
      userId: Number(userId),
      type: "deposit",
      amount: Number(amount),
      currencyId: Number(currencyId),
      promotionId: promotionId ? Number(promotionId) : null,
      status: "pending",
      customTransactionId,
      paymentGatewayProviderAccountId: paymentGatewayProviderAccountId
        ? Number(paymentGatewayProviderAccountId)
        : null,
      notes: notes ?? null,
      givenTransactionId: givenTransactionId ?? null,
      attachment: attachment ?? null,
      processedBy: user?.userType === "admin" ? user?.id : null,
      processedByUser: user?.userType === "user" ? user?.id : null,
    } as any);

    return res.status(201).json({
      status: true,
      message: "Deposit created. Pending approval.",
      data: {
        transactionId: (createdTxn as any).insertId,
        customTransactionId,
      },
    });
  } catch (err) {
    console.error("createDeposit error", err);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error", errors: err });
  }
};

export const createAffiliateWithdraw = async (req: Request, res: Response) => {
  try {
    const {
      affiliateId,
      amount,
      currencyId,
      withdrawMethod, // "bank" or "wallet"
      notes,
      attachment,
      // Bank fields
      accountNumber,
      accountHolderName,
      bankName,
      branchName,
      branchAddress,
      swiftCode,
      iban,
      // Wallet fields
      walletAddress,
      network,
      remainingBalance,
    } = req.body as {
      affiliateId: number;
      amount: number;
      currencyId: number;
      remainingBalance: number;
      withdrawMethod: "bank" | "wallet";
      notes?: string;
      attachment?: string;
      accountNumber?: string;
      accountHolderName?: string;
      bankName?: string;
      branchName?: string;
      branchAddress?: string;
      swiftCode?: string;
      iban?: string;
      walletAddress?: string;
      network?: string;
    };

    const user = (req as unknown as { user: any }).user as any;

    // ✅ Validate basic fields
    if (!affiliateId || !amount || !currencyId || !withdrawMethod) {
      return res.status(400).json({
        status: false,
        message:
          "affiliateId, amount, currencyId, withdrawMethod, are required",
      });
    }
    if (typeof remainingBalance !== "number" || remainingBalance < 0) {
      return res.status(400).json({
        status: false,
        message: "remainingBalance is not valid",
      });
    }

    // ✅ Validate method-specific fields
    if (withdrawMethod === "bank") {
      if (!accountNumber || !accountHolderName || !bankName) {
        return res.status(400).json({
          status: false,
          message:
            "For bank withdrawal, accountNumber, accountHolderName, and bankName are required",
        });
      }
    } else if (withdrawMethod === "wallet") {
      if (!walletAddress || !network) {
        return res.status(400).json({
          status: false,
          message:
            "For wallet withdrawal, walletAddress and network are required",
        });
      }
    }

    const customTransactionId = await generateUniqueTransactionId();

    const result = await db.transaction(async (tx) => {
      await tx
        .update(commission)
        .set({ status: "paid" })
        .where(
          and(
            eq(commission.adminUserId, Number(affiliateId)),
            eq(commission.status, "approved")
          )
        );

      await tx
        .update(adminUsers)
        .set({
          remainingBalance: remainingBalance,
        })
        .where(eq(adminUsers.id, Number(affiliateId)));

      const [createdTxn] = await tx.insert(transactions).values({
        affiliateId: Number(affiliateId),
        type: "withdraw" as any,
        amount: Number(amount),
        currencyId: Number(currencyId),
        status: "pending" as any,
        customTransactionId,
        notes: notes ?? null,
        attachment: attachment ?? null,
        withdrawMethod,
        accountNumber: accountNumber ?? null,
        accountHolderName: accountHolderName ?? null,
        bankName: bankName ?? null,
        branchName: branchName ?? null,
        branchAddress: branchAddress ?? null,
        swiftCode: swiftCode ?? null,
        iban: iban ?? null,
        walletAddress: walletAddress ?? null,
        network: network ?? null,
      } as any);

      const transactionId =
        (createdTxn as any).insertId ?? (createdTxn as any)?.id;

      // Create admin main balance record for affiliate withdrawal
      await AdminMainBalanceModel.create({
        amount: Number(amount),
        type: "admin_withdraw",
        status: "pending", // Match transaction status
        transactionId: transactionId,
        currencyId: Number(currencyId),

        createdByPlayer: user?.userType === "user" ? user?.id : undefined,
        createdByAdmin: user?.userType === "admin" ? user?.id : undefined,
        notes: `Affiliate withdrawal - Transaction ID: ${customTransactionId}`,
      },tx);
      
      return { transactionId, customTransactionId };
    });

    return res.status(201).json({
      status: true,
      message: "Withdrawal request created successfully",
      data: result,
    });
  } catch (err) {
    console.error("createAffiliateWithdraw error", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      errors: err,
    });
  }
};

type CreateWithdrawBody = {
  userId: number;
  amount: number;
  currencyId: number;
  paymentGatewayId?: number;
  notes?: string;
  attachment?: string;
  // Bank-specific fields
  accountNumber?: string;
  accountHolderName?: string;
  bankName?: string;
  branchName?: string;
  branchAddress?: string;
  swiftCode?: string;
  iban?: string;
  // Wallet-specific fields
  walletAddress?: string;
  network?: string;
};

export const createWithdraw = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      amount,
      currencyId,
      paymentGatewayId,
      notes,
      attachment,
      // Bank-specific fields
      accountNumber,
      accountHolderName,
      bankName,
      branchName,
      branchAddress,
      swiftCode,
      iban,
      // Wallet-specific fields
      walletAddress,
      network,
    } = req.body as CreateWithdrawBody;

    const user = (req as unknown as { user: any }).user as any;

    if (!userId || !amount || !currencyId || !paymentGatewayId) {
      return res.status(400).json({
        status: false,
        message: "userId, paymentGatewayId, amount and currencyId are required",
      });
    }

    // Validate amount is positive
    if (Number(amount) <= 0) {
      return res.status(400).json({
        status: false,
        message: "Amount must be greater than 0",
      });
    }

    // Check if user exists
    const [userExists] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!userExists) {
      return res.status(200).json({
        status: false,
        message: "User not found",
      });
    }

    const [getGateWayData] = await db
      .select()
      .from(paymentGateway)
      .where(eq(paymentGateway.id, paymentGatewayId));

    if (!getGateWayData?.id) {
      return res.status(200).json({
        status: false,
        message: "Gateway not found",
      });
    }

    // Get minimum withdrawable balance from settings
    const [settingsRow] = await db.select().from(settings).limit(1);
    const minWithdrawableBalance = Number(
      settingsRow?.minWithdrawableBalance || 25000
    );

    // Check for pending turnover
    const pendingTurnover = await db
      .select({
        id: turnover.id,
        remainingTurnover: turnover.remainingTurnover,
        targetTurnover: turnover.targetTurnover,
        type: turnover.type,
        status: turnover.status,
      })
      .from(turnover)
      .where(and(eq(turnover.userId, userId), eq(turnover.status, "active")));

    // Calculate user's current balance using BalanceModel
    const playerBalance = await BalanceModel.calculatePlayerBalance(userId);
    const currentBalance = playerBalance.currentBalance;

    // Check if user has sufficient withdrawable balance
    const hasSufficientBalance = currentBalance >= minWithdrawableBalance;

    // Check if there are any pending turnovers
    const hasPendingTurnover = pendingTurnover.length > 0;

    // User can withdraw if: sufficient balance AND no pending turnover
    const canWithdraw = hasSufficientBalance && !hasPendingTurnover && userExists.kyc_status!=="required";

    if (!canWithdraw) {
      let withdrawReason = "";
      if(userExists.kyc_status==="required"){
      withdrawReason = "Please verify your KYC status."
      }
      else if (!hasSufficientBalance) {
        withdrawReason = `Insufficient balance. Current balance: ${currentBalance.toFixed(
          2
        )}, Minimum required: ${minWithdrawableBalance.toFixed(2)}`;
      } else if (hasPendingTurnover) {
        const turnoverDetails = pendingTurnover
          .map(
            (t) =>
              `${t.type} turnover: ${Number(t.remainingTurnover).toFixed(
                2
              )} remaining out of ${Number(t.targetTurnover).toFixed(2)} target`
          )
          .join(", ");
        withdrawReason = `Pending turnover requirements: ${turnoverDetails}`;
      }

      return res.status(400).json({
        status: false,
        message: "Withdrawal not allowed",
        data: {
          canWithdraw: false,
          currentBalance: Number(currentBalance.toFixed(2)),
          minWithdrawableBalance,
          hasSufficientBalance,
          hasPendingTurnover,
          withdrawReason,
          pendingTurnover: pendingTurnover.map((t) => ({
            id: t.id,
            remainingTurnover: Number(t.remainingTurnover),
            targetTurnover: Number(t.targetTurnover),
            type: t.type,
            status: t.status,
          })),
        },
      });
    }

    // Check if withdrawal amount doesn't exceed current balance
    if (Number(amount) > currentBalance) {
      return res.status(400).json({
        status: false,
        message: "Withdrawal amount exceeds available balance",
        data: {
          requestedAmount: Number(amount),
          currentBalance: Number(currentBalance.toFixed(2)),
          availableForWithdrawal: Number(currentBalance.toFixed(2)),
        },
      });
    }

    const customTransactionId = await generateUniqueTransactionId();

    const result = await db.transaction(async (tx) => {
      // Create withdrawal transaction
      const [createdTxn] = await tx.insert(transactions).values({
        userId: Number(userId),
        type: "withdraw" as any,
        amount: Number(amount) as any,
        currencyId: Number(currencyId),
        paymentGatewayId: Number(paymentGatewayId),
        status: "pending" as any,
        customTransactionId,
        notes: notes ?? null,

        attachment: attachment ?? null,
        // Bank-specific fields
        accountNumber: accountNumber ?? null,
        accountHolderName: accountHolderName ?? null,
        bankName: getGateWayData?.name ?? bankName ?? null,
        branchName: branchName ?? null,
        branchAddress: branchAddress ?? null,
        swiftCode: swiftCode ?? null,
        iban: iban ?? null,

        // Wallet-specific fields
        walletAddress: walletAddress ?? null,
        network: network ?? null,
        processedBy: user?.userType === "admin" ? user?.id : null,
        processedByUser: user?.userType === "user" ? user?.id : null,
      } as any);

      const transactionId =
        (createdTxn as any).insertId ?? (createdTxn as any)?.id;

      // Create admin main balance record for player withdrawal
      await AdminMainBalanceModel.create({
        amount: Number(amount),
        type: "player_withdraw",
        status: "pending", // Match transaction status
        transactionId: transactionId,
        currencyId: Number(currencyId),
        createdByPlayer: user?.userType === "user" ? user?.id : undefined,
        createdByAdmin: user?.userType === "admin" ? user?.id : undefined,
        notes: `Player withdrawal - Transaction ID: ${customTransactionId}`,
      });

      return { transactionId, customTransactionId };
    });

    return res.status(201).json({
      status: true,
      message: "Withdrawal request created successfully",
      data: {
        ...result,
        amount: Number(amount),
        status: "pending",
        currentBalance: Number(currentBalance.toFixed(2)),
        remainingBalance: Number((currentBalance - Number(amount)).toFixed(2)),
      },
    });
  } catch (err) {
    console.error("createWithdraw error", err);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      pageSize,
      limit,
      type,
      status,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      userId,
      affiliateId,
      historyType = "global",
    } = req.query as Record<string, string | undefined>;

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.max(Number(pageSize ?? limit) || 10, 1);
    const offset = (currentPage - 1) * perPage;

    const validTypes = ["deposit", "withdraw"] as const;
    const validStatuses = ["approved", "pending", "rejected"] as const;

    const whereClauses: any[] = [inArray(transactions.type, validTypes)];
    if (type && (validTypes as readonly string[]).includes(type)) {
      whereClauses.push(eq(transactions.type, type as any));
    }
    if (status && (validStatuses as readonly string[]).includes(status)) {
      whereClauses.push(eq(transactions.status, status as any));
    }
    if (userId && !Number.isNaN(Number(userId))) {
      whereClauses.push(eq(transactions.userId, Number(userId)));
    }
    if (affiliateId && !Number.isNaN(Number(affiliateId))) {
      whereClauses.push(eq(transactions.affiliateId, Number(affiliateId)));
    }
    if (historyType === "affiliate") {
      whereClauses.push(isNotNull(transactions.affiliateId));
    }
    if (historyType === "user") {
      whereClauses.push(isNotNull(transactions.userId));
    }
    if (historyType === "promotion") {
      whereClauses.push(isNotNull(transactions.promotionId));
    }
    if (search && search.trim()) {
      whereClauses.push(like(transactions.customTransactionId, `%${search}%`));
    }

    const whereExpr = whereClauses.length
      ? (and as any)(...whereClauses)
      : undefined;

    const sortableColumns: Record<string, any> = {
      createdAt: transactions.createdAt,
      id: transactions.id,
      amount: transactions.amount,
      status: transactions.status,
      type: transactions.type,
    };
    const orderColumn = sortableColumns[sortBy] ?? transactions.createdAt;
    const orderExpr = (
      String(sortOrder).toLowerCase() === "asc"
        ? asc(orderColumn)
        : desc(orderColumn)
    ) as any;

    const total = await db
      .select({ count: sql`COUNT(*)` })
      .from(transactions)
      .where(whereExpr as any)
      .then((rows) => Number((rows as any)[0]?.count || 0));

    const processedByUser = aliasedTable(users, "processedByUser");
    const processedByAdmin = aliasedTable(adminUsers, "processedByAdmin");

    const data = await db
      .select({
        // Transaction fields
        id: transactions.id,
        userId: transactions.userId,
        affiliateId: transactions.affiliateId,
        type: transactions.type,
        amount: transactions.amount,
        currencyId: transactions.currencyId,
        promotionId: transactions.promotionId,
        promotionName: promotions.promotionName,
        promotionPercentage: promotions?.bonus,
        bonusAmount: transactions.bonusAmount,
        gameId: transactions.gameId,
        status: transactions.status,
        customTransactionId: transactions.customTransactionId,
        givenTransactionId: transactions.givenTransactionId,
        attachment: transactions.attachment,
        notes: transactions.notes,
        paymentGatewayProviderAccountId:
          transactions.paymentGatewayProviderAccountId,
        accountNumber: transactions.accountNumber,
        accountHolderName: transactions.accountHolderName,
        bankName: transactions.bankName,
        branchName: transactions.branchName,
        branchAddress: transactions.branchAddress,
        swiftCode: transactions.swiftCode,
        iban: transactions.iban,
        walletAddress: transactions.walletAddress,
        network: transactions.network,
        processedById: transactions.processedBy,
        processedByUserId: transactions?.processedByUser,
        processedAt: transactions.processedAt,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt,

        // User fields
        userUsername: users.username,
        userFullname: users.fullname,
        userPhone: users.phone,
        userEmail: users.email,
        userStatus: users.status,
        userIsVerified: users.isVerified,
        userCreatedAt: users.created_at,

        // affiliate
        affiliateUsername: adminUsers.username,
        affiliateName: adminUsers.fullname,
        affiliatePhone: adminUsers.phone,
        affiliateEmail: adminUsers.email,
        affiliateStatus: adminUsers.status,
        affiliateRegisterDate: adminUsers.created_at,

        // Game fields
        gameName: games.name,
        gameStatus: games.status,
        gameLogo: games.gameLogo,
        gameUrl: games.gameUrl,
        paymentGateway: paymentGateway,

        // Currency fields
        usdConversion: currencyConversion.rate,
        currencyCode: currencies.code,
        currencyName: currencies.name,
        currencySymbol: currencies.symbol,
        processedBy: sql`
  CASE 
    WHEN ${transactions.processedBy} IS NOT NULL THEN ${processedByAdmin.username}
    WHEN ${transactions.processedByUser} IS NOT NULL THEN ${processedByUser.username}
  END
`,
        processedByRoleType: sql`
CASE 
  WHEN ${transactions.processedBy} IS NOT NULL THEN ${processedByAdmin.role}
  WHEN ${transactions.processedByUser} IS NOT NULL THEN ${"player"}
END
`,
      })
      .from(transactions)
      .leftJoin(
        paymentGateway,
        eq(paymentGateway.id, transactions.paymentGatewayId)
      )
      .leftJoin(promotions, eq(transactions.promotionId, promotions.id))
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(
        currencyConversion,
        eq(transactions.currencyId, currencyConversion.toCurrency)
      )
      .leftJoin(
        processedByAdmin,
        eq(transactions?.processedBy, processedByAdmin?.id)
      )
      .leftJoin(
        processedByUser,
        eq(transactions.processedByUser, processedByUser.id)
      )
      .leftJoin(adminUsers, eq(transactions.affiliateId, adminUsers.id))
      .leftJoin(games, eq(transactions.gameId, games.id))
      .leftJoin(currencies, eq(transactions.currencyId, currencies.id))
      .where(whereExpr as any)
      .orderBy(orderExpr)
      .limit(perPage)
      .offset(offset);

    return res.status(200).json({
      status: true,
      data,
      pagination: {
        page: currentPage,
        pageSize: perPage,
        total,
        totalPages: Math.ceil(total / perPage),
      },
    });
  } catch (err) {
    console.error("getTransactions error", err);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error", errors: err });
  }
};

export const updateTransactionStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, notes } = req.body as { status?: string; notes?: string };

    if (Number.isNaN(id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid transaction id" });
    }

    const validStatuses = ["approved", "pending", "rejected"] as const;
    if (!status || !(validStatuses as readonly string[]).includes(status)) {
      return res.status(400).json({
        status: false,
        message:
          "Invalid or missing status. Allowed: approved, pending, rejected",
      });
    }

    const [existing] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));
    if (!existing) {
      return res
        .status(404)
        .json({ status: false, message: "Transaction not found" });
    }

    const processedBy = (req as any)?.user?.id ?? null;
    const updatePayload: any = {
      status: status as any,
      processedAt: new Date(),
    };
    if (processedBy) updatePayload.processedBy = Number(processedBy);
    if (typeof notes === "string") updatePayload.notes = notes;

    await db
      .update(transactions)
      .set(updatePayload)
      .where(eq(transactions.id, id));

    if (updatePayload.status === "approved") {
      const baseAmount = Number(existing.amount);
      const userIdExisting = Number(existing.userId);

      // Settings lookup
      const [settingsRow] = await db.select().from(settings).limit(1);
      const defaultTurnoverMultiply = Number(settingsRow?.defaultTurnover ?? 1);

      // --- Create default turnover ---
      const defaultTarget = baseAmount * defaultTurnoverMultiply;
      await db.insert(turnover).values({
        userId: userIdExisting,
        transactionId: id,
        type: "default",
        status: "active",
        turnoverName: `Deposited for TXN ${existing.customTransactionId}`,
        depositAmount: baseAmount.toString(),
        targetTurnover: defaultTarget.toString(),
        remainingTurnover: defaultTarget.toString(),
      });

      // --- If promotion applied ---
      if (existing.promotionId) {
        const [promo] = await db
          .select()
          .from(promotions)
          .where(eq(promotions.id, existing.promotionId));
        if (promo) {
          const bonusAmount = (baseAmount * Number(promo.bonus)) / 100;
          const promoTarget = bonusAmount * Number(promo.turnoverMultiply ?? 1);

          await db.insert(turnover).values({
            userId: userIdExisting,
            transactionId: id,
            type: "promotion",
            status: "active",
            turnoverName: `Promotion: ${promo.promotionName}`,
            depositAmount: baseAmount.toString(),
            targetTurnover: promoTarget.toString(),
            remainingTurnover: promoTarget.toString(),
          });

          await db
            .update(transactions)
            .set({ bonusAmount: bonusAmount.toString() })
            .where(eq(transactions.id, id));

          // Admin main balance for promotion
          await AdminMainBalanceModel.create({
            amount: bonusAmount,
            type: "promotion",
            status: "approved",
            promotionId: promo.id,
            promotionName: promo.promotionName,
            transactionId: id,
            currencyId: existing.currencyId,
            notes: `Promotion bonus - ${promo.promotionName} (${promo.bonus}%)`,
          });
        }
      }

      // --- Admin main balance for deposit ---
      await AdminMainBalanceModel.create({
        amount: baseAmount,
        type: "player_deposit",
        status: "approved",
        transactionId: id,
        currencyId: existing.currencyId,
        notes: `Player deposit - Transaction ID: ${existing.customTransactionId}`,
      });
    }

    if (["rejected", "pending"].includes(updatePayload.status)) {
      await db
        .update(turnover)
        .set({
          status: "inactive",
        })
        .where(eq(turnover.transactionId, id));
    }

    // Update corresponding adminMainBalance records to match transaction status
    await AdminMainBalanceModel.updateByTransactionId(id, {
      status: status as any, // Update status to match transaction
    });

    const [updated] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));

    return res.status(200).json({
      status: true,
      message: `Transaction status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    console.error("updateTransactionStatus error", err);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error", errors: err });
  }
};
export const updateAffiliateWithdrawStatus = async (
  req: Request,
  res: Response
) => {
  const tx = db; // If you use transaction wrapper, replace with `await db.transaction(...)`
  try {
    const id = Number(req.params.id);
    const { status, notes } = req.body as { status?: string; notes?: string };

    if (Number.isNaN(id)) {
      return res
        .status(400)
        .json({ status: false, message: "Invalid transaction id" });
    }

    const validStatuses = ["approved", "pending", "rejected"] as const;
    if (!status || !(validStatuses as readonly string[]).includes(status)) {
      return res.status(400).json({
        status: false,
        message:
          "Invalid or missing status. Allowed: approved, pending, rejected",
      });
    }

    const [existing] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));

    if (!existing) {
      return res
        .status(404)
        .json({ status: false, message: "Transaction not found" });
    }

    const affiliateId = existing.affiliateId;
    const processedBy = (req as any)?.user?.id ?? null;
    const updatePayload: any = {
      status: status as any,
      processedAt: new Date(),
    };
    if (processedBy) updatePayload.processedBy = Number(processedBy);
    if (typeof notes === "string") updatePayload.notes = notes;

    await tx
      .update(transactions)
      .set(updatePayload)
      .where(eq(transactions.id, id));

    // Update corresponding adminMainBalance records to match transaction status
    await AdminMainBalanceModel.updateByTransactionId(id, {
      status: status as any, // Update status to match transaction
    });

    // Apply extra logic based on status
    if (status === "approved") {
      // ✅ Mark all 'paid' commissions as 'settled' for this affiliate
      await tx
        .update(commission)
        .set({ status: "settled" })
        .where(
          and(
            eq(commission.adminUserId, Number(affiliateId)),
            eq(commission.status, "paid")
          )
        );
    } else if (status === "rejected") {
      // ✅ Mark all 'paid' commissions back to 'approved'
      await tx
        .update(commission)
        .set({ status: "approved" })
        .where(
          and(
            eq(commission.adminUserId, Number(affiliateId)),
            eq(commission.status, "paid")
          )
        );

      // ✅ Set remaining balance to 0
      await tx
        .update(adminUsers)
        .set({ remainingBalance: 0 })
        .where(eq(adminUsers.id, Number(affiliateId)));
    }

    const [updated] = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, id));

    return res.status(200).json({
      status: true,
      message: `Transaction status updated to ${status}`,
      data: updated,
    });
  } catch (err) {
    console.error("updateTransactionStatus error", err);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error", errors: err });
  }
};

export const checkWithdrawCapability = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    if (Number.isNaN(userId)) {
      return res.status(400).json({
        status: false,
        message: "Invalid user ID",
      });
    }

    // Check if user exists
    const [user] = await db.select().from(users).where(eq(users.id, userId));

    if (!user) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // Get minimum withdrawable balance from settings
    const [settingsRow] = await db.select().from(settings).limit(1);
    const minWithdrawableBalance = Number(
      settingsRow?.minWithdrawableBalance || 25000
    );

    // Check for pending turnover
    const pendingTurnover = await db
      .select({
        id: turnover.id,
        remainingTurnover: turnover.remainingTurnover,
        targetTurnover: turnover.targetTurnover,
        type: turnover.type,
        status: turnover.status,
      })
      .from(turnover)
      .where(and(eq(turnover.userId, userId), eq(turnover.status, "active")));

    // Calculate user's current balance using BalanceModel
    const playerBalance = await BalanceModel.calculatePlayerBalance(userId);
    const currentBalance = playerBalance.currentBalance;

    // Check if user has sufficient withdrawable balance
    const hasSufficientBalance = currentBalance >= minWithdrawableBalance;

    // Check if there are any pending turnovers
    const hasPendingTurnover = pendingTurnover.length > 0;

    // User can withdraw if: sufficient balance AND no pending turnover
    const canWithdraw =
      hasSufficientBalance &&
      !hasPendingTurnover &&
      user.kyc_status === "verified" &&
      user.status === "active";

    // Determine the reason why withdrawal is not allowed
    let withdrawReason = null;
    if (!canWithdraw) {
      if (user.kyc_status === "required") {
        withdrawReason = "KYC is not verified";
      } else if (user.status !== "active") {
        withdrawReason = "User is not active";
      } else if (!hasSufficientBalance) {
        withdrawReason = `Insufficient balance. Current balance: ${currentBalance.toFixed(
          2
        )}, Minimum required: ${minWithdrawableBalance.toFixed(2)}`;
      } else if (hasPendingTurnover) {
        withdrawReason = `Turnover has not yet reached`;
      }
    }

    return res.status(200).json({
      status: true,
      message: "Withdraw capability check completed",
      data: {
        canWithdraw,
        currentBalance: Number(currentBalance.toFixed(2)),
        minWithdrawableBalance,
        hasSufficientBalance,
        hasPendingTurnover,
        withdrawReason,
        pendingTurnover: pendingTurnover.map((t) => ({
          id: t.id,
          remainingTurnover: Number(t.remainingTurnover),
          targetTurnover: Number(t.targetTurnover),
          type: t.type,
          status: t.status,
        })),
        balanceBreakdown: {
          totalDeposits: playerBalance.totalDeposits,
          totalWins: playerBalance.totalWins,
          totalWithdrawals: playerBalance.totalWithdrawals,
          totalLosses: playerBalance.totalLosses,
        },
      },
    });
  } catch (error) {
    console.error("Error checking withdraw capability:", error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
