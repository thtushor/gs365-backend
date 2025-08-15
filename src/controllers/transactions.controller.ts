import { Request, Response } from "express";
import { db } from "../db/connection";
import { transactions } from "../db/schema/transactions";
import { promotions } from "../db/schema/promotions";
import { settings } from "../db/schema/settings";
import { turnover } from "../db/schema/turnover";
import { eq, and, like, asc, desc, sql } from "drizzle-orm";
import { generateUniqueTransactionId } from "../utils/refCode";

type CreateDepositBody = {
  userId: number;
  amount: number;
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
      attachment,
    } = req.body as CreateDepositBody;

    if (!userId || !amount || !currencyId) {
      return res.status(400).json({
        status: false,
        message: "userId, amount and currencyId are required",
      });
    }

    const customTransactionId = await generateUniqueTransactionId();

    const result = await db.transaction(async (tx) => {
      // Optional promotion lookup
      let promo: {
        id: number;
        promotionName: string;
        turnoverMultiply: number;
        bonus: number;
      } | null = null;
      if (promotionId) {
        const [p] = await tx
          .select({
            id: promotions.id,
            promotionName: promotions.promotionName,
            turnoverMultiply: promotions.turnoverMultiply,
            bonus: promotions.bonus,
          })
          .from(promotions)
          .where(eq(promotions.id, Number(promotionId)));
        if (p) promo = p as any;
      }

      // Settings lookup for defaultTurnover
      const [settingsRow] = await tx.select().from(settings).limit(1);
      const defaultTurnoverMultiply = Number(
        (settingsRow as any)?.defaultTurnover ?? 1
      );

      // Create transaction
      const [createdTxn] = await tx.insert(transactions).values({
        userId: Number(userId),
        type: "deposit" as any,
        amount: Number(amount) as any,
        currencyId: Number(currencyId),
        promotionId: promo ? promo.id : null,
        status: "pending" as any,
        customTransactionId,
        paymentGatewayProviderAccountId: paymentGatewayProviderAccountId
          ? Number(paymentGatewayProviderAccountId)
          : null,
        notes: notes ?? null,
        attachment: attachment ?? null,
      } as any);

      const transactionId =
        (createdTxn as any).insertId ?? (createdTxn as any)?.id;

      const baseAmount = Number(amount);

      // Always create default turnover for transaction amount
      const defaultTarget = baseAmount * defaultTurnoverMultiply;
      await tx.insert(turnover).values({
        userId: Number(userId),
        transactionId: transactionId,
        type: "default",
        status: "active",
        turnoverName: `Default turnover for TXN ${customTransactionId}`,
        targetTurnover: defaultTarget as any,
        remainingTurnover: defaultTarget as any,
      } as any);

      // If promotion applied, create promotion turnover
      if (promo) {
        const bonusPercentage = Number(promo.bonus || 0);
        const bonusAmount = (baseAmount * bonusPercentage) / 100;
        const promoBase = bonusAmount;
        const promoTarget = promoBase * Number(promo.turnoverMultiply || 1);
        await tx.insert(turnover).values({
          userId: Number(userId),
          transactionId: transactionId,
          type: "promotion",
          status: "active",
          turnoverName: `Promotion: ${promo.promotionName}`,
          targetTurnover: promoTarget as any,
          remainingTurnover: promoTarget as any,
        } as any);
      }

      return { transactionId, customTransactionId };
    });

    return res.status(201).json({
      status: true,
      message: "Deposit created with turnover entries",
      data: result,
    });
  } catch (err) {
    console.error("createDeposit error", err);
    return res
      .status(500)
      .json({ status: false, message: "Internal Server Error", errors: err });
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
    } = req.query as Record<string, string | undefined>;

    const currentPage = Math.max(Number(page) || 1, 1);
    const perPage = Math.max(Number(pageSize ?? limit) || 10, 1);
    const offset = (currentPage - 1) * perPage;

    const validTypes = ["deposit", "withdraw"] as const;
    const validStatuses = ["approved", "pending", "rejected"] as const;

    const whereClauses: any[] = [];
    if (type && (validTypes as readonly string[]).includes(type)) {
      whereClauses.push(eq(transactions.type, type as any));
    }
    if (status && (validStatuses as readonly string[]).includes(status)) {
      whereClauses.push(eq(transactions.status, status as any));
    }
    if (userId && !Number.isNaN(Number(userId))) {
      whereClauses.push(eq(transactions.userId, Number(userId)));
    }
    if (search && search.trim()) {
      whereClauses.push(like(transactions.customTransactionId, `%${search}%`));
    }

    const whereExpr = whereClauses.length ? (and as any)(...whereClauses) : undefined;

    const sortableColumns: Record<string, any> = {
      createdAt: transactions.createdAt,
      id: transactions.id,
      amount: transactions.amount,
      status: transactions.status,
      type: transactions.type,
    };
    const orderColumn = sortableColumns[sortBy] ?? transactions.createdAt;
    const orderExpr = (String(sortOrder).toLowerCase() === "asc"
      ? asc(orderColumn)
      : desc(orderColumn)) as any;

    const total = await db
      .select({ count: sql`COUNT(*)` })
      .from(transactions)
      .where(whereExpr as any)
      .then((rows) => Number((rows as any)[0]?.count || 0));

    const data = await db
      .select()
      .from(transactions)
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
      return res.status(400).json({ status: false, message: "Invalid transaction id" });
    }

    const validStatuses = ["approved", "pending", "rejected"] as const;
    if (!status || !(validStatuses as readonly string[]).includes(status)) {
      return res.status(400).json({
        status: false,
        message: "Invalid or missing status. Allowed: approved, pending, rejected",
      });
    }

    const [existing] = await db.select().from(transactions).where(eq(transactions.id, id));
    if (!existing) {
      return res.status(404).json({ status: false, message: "Transaction not found" });
    }

    const processedBy = (req as any)?.user?.id ?? null;
    const updatePayload: any = {
      status: status as any,
      processedAt: new Date(),
    };
    if (processedBy) updatePayload.processedBy = Number(processedBy);
    if (typeof notes === "string") updatePayload.notes = notes;

    await db.update(transactions).set(updatePayload).where(eq(transactions.id, id));

    const [updated] = await db.select().from(transactions).where(eq(transactions.id, id));

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
