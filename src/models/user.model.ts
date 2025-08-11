import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, or, and, like } from "drizzle-orm";
import { users } from "../db/schema/users";
import bcrypt from "bcryptjs";

import { sql } from "drizzle-orm";
import { db } from "../db/connection";

export const findUserByUsernameOrEmail = async (usernameOrEmail: string) => {
  const [user] = await db
    .select()
    .from(users)
    // .leftJoin(currency, eq(currency.id, users.currency_id))
    .where(
      or(
        eq(users.username, usernameOrEmail),
        eq(users.email, usernameOrEmail),
        eq(users.phone, usernameOrEmail)
      )
    );
  return user;
};

export const createUser = async (data: {
  username: string;
  fullname: string;
  phone: string;
  email: string;
  password: string;
  currency_id: number;
  refer_code?: string;
  isAgreeWithTerms: boolean;
  createdBy?: number;
  referred_by?: number;
  referred_by_admin_user?: number;
  status: "active"|"inactive";
}) => {
  // const hashedPassword = await bcrypt.hash(data.password, 10);
  const [user] = await db.insert(users).values({
    ...data,
    created_by: data?.createdBy,
    referred_by: data?.referred_by,
    referred_by_admin_user: data?.referred_by_admin_user,
    // password: hashedPassword,
  });

  return user;
};

export const findUserByReferCode = async (refer_code: string) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.refer_code, refer_code));
  return user;
};

export const getUserById = async (id: number) => {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id));
  return user;
};

export interface UserFilters {
  playerId?: number;
  phone?: string;
  status?: string;
  keyword?: string;
  createdBy?: number;
  page?: number;
  pageSize?: number;
  referred_by?: number;
  referred_by_admin_user?: number;
}

export const getUsersWithFilters = async (filters: UserFilters) => {
  const {
    playerId,
    phone,
    status,
    keyword,
    page = 1,
    pageSize = 10,
    createdBy,
    referred_by,
    referred_by_admin_user,
  } = filters;

  const whereClauses = [];

  if (playerId) whereClauses.push(eq(users.id, playerId));
  if (phone) whereClauses.push(eq(users.phone, phone));
  if (status) whereClauses.push(eq(users.status as any, status));
  if (createdBy) whereClauses.push(eq(users.created_by, createdBy));
  if (referred_by_admin_user)
    whereClauses.push(eq(users.referred_by_admin_user, referred_by_admin_user));

  if (referred_by) {
    whereClauses.push(eq(users.referred_by, referred_by));
  }

  if (keyword) {
    const kw = `%${keyword}%`;
    whereClauses.push(
      or(
        like(users.username, `%${kw}%`),
        like(users.fullname, `%${kw}%`),
        like(users.email, `%${kw}%`),
        like(users.phone, `%${kw}%`)
      )
    );
  }
  const where = whereClauses.length ? and(...whereClauses) : undefined;
  // Get total count
  const total = await db
    .select({ count: sql`COUNT(*)` })
    .from(users)
    .where(where)
    .then((rows) => Number(rows[0]?.count || 0));
  // Get paginated data
  const data = await db
    .select()
    .from(users)
    .where(where)
    .limit(pageSize)
    .offset((page - 1) * pageSize);
  const totalPages = Math.ceil(total / pageSize);
  return {
    total,
    data,
    pagination: {
      page,
      pageSize,
      totalPages,
      total,
    },
  };
};

export const updateUser = async (
  id: number,
  data: Partial<{
    username: string;
    fullname: string;
    phone: string;
    email: string;
    password: string;
    currency_id: number;
    refer_code?: string;
    isAgreeWithTerms: boolean;
    status: "active" | "inactive";
    isLoggedIn: boolean;
  }>
) => {
  if (data.password) {
    // Optionally hash password if needed
    // data.password = await bcrypt.hash(data.password, 10);
  }
  const [user] = await db.update(users).set(data).where(eq(users.id, id));
  return user;
};

export const deleteUser = async (id: number) => {
  const result = await db.delete(users).where(eq(users.id, id));
  return result;
};
