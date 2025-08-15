import { and, eq, like, sql } from "drizzle-orm";
import { db } from "../db/connection";
import { turnover } from "../db/schema/turnover";
import type { NewTurnover } from "../db/schema/turnover";

export type TurnoverFilters = {
  userId?: number;
  type?: "default" | "promotion";
  status?: "active" | "inactive";
  turnoverName?: string;
  keyword?: string;
  transactionId?: number;
  page?: number | string;
  pageSize?: number | string;
};

export const TurnoverModel = {
  async getAll(filter: TurnoverFilters = {}) {
    const whereConditions = [] as any[];
    if (filter.userId)
      whereConditions.push(eq(turnover.userId, Number(filter.userId)));
    if (filter.type)
      whereConditions.push(eq(turnover.type as any, filter.type));
    if (filter.status)
      whereConditions.push(eq(turnover.status as any, filter.status));
    if (filter.turnoverName)
      whereConditions.push(
        like(turnover.turnoverName, `%${filter.turnoverName}%`)
      );
    if (filter.transactionId)
      whereConditions.push(
        eq(turnover.transactionId, Number(filter.transactionId))
      );
    if (filter.keyword) {
      const kw = `%${filter.keyword}%`;
      whereConditions.push(like(turnover.turnoverName, kw));
    }

    const page = parseInt(String(filter.page ?? 1), 10) || 1;
    const pageSize = parseInt(String(filter.pageSize ?? 10), 10) || 10;
    const offset = (page - 1) * pageSize;

    const totalRows = await db
      .select({ count: sql<number>`count(*)` })
      .from(turnover)
      .where(whereConditions.length ? and(...whereConditions) : undefined);

    const data = await db
      .select()
      .from(turnover)
      .where(whereConditions.length ? and(...whereConditions) : undefined)
      .limit(pageSize)
      .offset(offset)
      .orderBy(turnover.id);

    const total = totalRows?.[0]?.count ?? 0;

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNext: page < Math.ceil(total / pageSize),
        hasPrev: page > 1,
      },
    };
  },

  async getById(id: number) {
    return db.select().from(turnover).where(eq(turnover.id, id));
  },

  async create(data: NewTurnover) {
    return db.insert(turnover).values(data);
  },

  async update(
    id: number,
    data: Partial<
      Pick<
        NewTurnover,
        | "userId"
        | "type"
        | "status"
        | "turnoverName"
        | "targetTurnover"
        | "remainingTurnover"
        | "transactionId"
      >
    >
  ) {
    return db.update(turnover).set(data).where(eq(turnover.id, id));
  },

  async delete(id: number) {
    return db.delete(turnover).where(eq(turnover.id, id));
  },
};
