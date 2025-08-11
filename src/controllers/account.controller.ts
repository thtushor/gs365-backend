import { Request, Response } from "express";
import { db } from "../db/connection";
import { accounts, accountTypes } from "../db/schema/accounts";
import { eq, and, sql, not, like } from "drizzle-orm";

// Account Types CRUD
export const getAllAccountTypes = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as "active" | "inactive" | undefined;
    const searchKey = req.query.searchKey as string | undefined;
    const whereCondition = [];
    if (status) whereCondition.push(eq(accountTypes.status, status));
    if (searchKey)
      whereCondition.push(like(accountTypes.name, `%${searchKey}%`));
    const rows = whereCondition.length
      ? await db
          .select()
          .from(accountTypes)
          .where(and(...whereCondition))
      : await db.select().from(accountTypes);
    res.json({ status: true, data: rows });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch account types", errors: err });
  }
};

export const createAccountType = async (req: Request, res: Response) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const [id] = await db
      .insert(accountTypes)
      .values({ name, description, status })
      .$returningId();
    const [type] = await db
      .select()
      .from(accountTypes)
      .where(eq(accountTypes.id, Number(id)));
    res.status(201).json(type);
  } catch (err) {
    res.status(500).json({ error: "Failed to create account type" });
  }
};

export const updateAccountType = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { name, description, status } = req.body;
    await db
      .update(accountTypes)
      .set({ name, description, status })
      .where(eq(accountTypes.id, id));
    const [type] = await db
      .select()
      .from(accountTypes)
      .where(eq(accountTypes.id, id));
    res.json(type);
  } catch (err) {
    res.status(500).json({ error: "Failed to update account type" });
  }
};

export const deleteAccountType = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(accountTypes).where(eq(accountTypes.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account type" });
  }
};

// Accounts CRUD
export const getAllAccounts = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as "active" | "inactive" | undefined;
    const userId = req.query.userId
      ? parseInt(req.query.userId as string, 10)
      : undefined;
    const pageSize = parseInt((req.query.pageSize as string) || "10", 10);
    const page = parseInt((req.query.page as string) || "1", 10);
    const whereCondition = [];
    if (status) whereCondition.push(eq(accounts.status, status));
    if (userId) whereCondition.push(eq(accounts.user_id, userId));
    // Count total
    const totalCountResult = whereCondition.length
      ? await db
          .select({ count: sql`count(*)`.mapWith(Number) })
          .from(accounts)
          .where(and(...whereCondition))
      : await db
          .select({ count: sql`count(*)`.mapWith(Number) })
          .from(accounts);
    const totalCount = totalCountResult[0]?.count || 0;
    // Fetch paginated
    const offset = (page - 1) * pageSize;
    const rows = whereCondition.length
      ? await db
          .select()
          .from(accounts)
          .where(and(...whereCondition))
          .limit(pageSize)
          .offset(offset)
      : await db.select().from(accounts).limit(pageSize).offset(offset);
    res.json({
      data: rows,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch accounts", errors: err });
  }
};

export const getAccountById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rows = await db.select().from(accounts).where(eq(accounts.id, id));
    if (!rows.length)
      return res.status(404).json({ error: "Account not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch account" });
  }
};

export const createAccount = async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.user_id || !data.currency_id || !data.account_type_id) {
      return res.status(400).json({
        error: "user_id, currency_id, and account_type_id are required",
      });
    }
    const [id] = await db.insert(accounts).values(data).$returningId();
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, Number(id)));
    res.status(201).json(account);
  } catch (err) {
    res.status(500).json({ error: "Failed to create account" });
  }
};

export const updateAccount = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    await db.update(accounts).set(data).where(eq(accounts.id, id));
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id));
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: "Failed to update account" });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db.delete(accounts).where(eq(accounts.id, id));
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete account" });
  }
};

export const updateAccountStatus = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;
    if (!id || !status)
      return res.status(400).json({ error: "id and status are required" });
    await db.update(accounts).set({ status }).where(eq(accounts.id, id));
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id));
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: "Failed to update account status" });
  }
};

// Get payment details for an account
export const getAccountPaymentDetails = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const rows = await db.select().from(accounts).where(eq(accounts.id, id));
    if (!rows.length)
      return res.status(404).json({ error: "Account not found" });
    const account = rows[0];
    // Only return payment-related fields
    const paymentDetails = {
      account_number: account.account_number,
      holder_name: account.holder_name,
      provider: account.provider,
      address: account.address,
      swift_code: account.swift_code,
      iban: account.iban,
      wallet_address: account.wallet_address,
      network: account.network,
    };
    res.json(paymentDetails);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch payment details" });
  }
};

// Update payment details for an account
export const updateAccountPaymentDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id, 10);
    const {
      account_number,
      holder_name,
      provider,
      address,
      swift_code,
      iban,
      wallet_address,
      network,
    } = req.body;
    const updateFields: any = {};
    if (account_number !== undefined)
      updateFields.account_number = account_number;
    if (holder_name !== undefined) updateFields.holder_name = holder_name;
    if (provider !== undefined) updateFields.provider = provider;
    if (address !== undefined) updateFields.address = address;
    if (swift_code !== undefined) updateFields.swift_code = swift_code;
    if (iban !== undefined) updateFields.iban = iban;
    if (wallet_address !== undefined)
      updateFields.wallet_address = wallet_address;
    if (network !== undefined) updateFields.network = network;
    await db.update(accounts).set(updateFields).where(eq(accounts.id, id));
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id));
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: "Failed to update payment details" });
  }
};

// Delete payment details for an account (set all payment fields to null)
export const deleteAccountPaymentDetails = async (
  req: Request,
  res: Response
) => {
  try {
    const id = parseInt(req.params.id, 10);
    await db
      .update(accounts)
      .set({
        account_number: null,
        holder_name: null,
        provider: null,
        address: null,
        swift_code: null,
        iban: null,
        wallet_address: null,
        network: null,
      })
      .where(eq(accounts.id, id));
    const [account] = await db
      .select()
      .from(accounts)
      .where(eq(accounts.id, id));
    res.json(account);
  } catch (err) {
    res.status(500).json({ error: "Failed to delete payment details" });
  }
};
