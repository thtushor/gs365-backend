import { and, eq, inArray, sql } from "drizzle-orm";
import { dropdownOptions, promotions } from "../db/schema";
import { db } from "../db/connection";
import { promotionPublicSelectFields } from "../selected_field/promotionSelectFields";

export const getPublicPromotionById = async (id: number) => {
  const [promotion] = await db
    .select()
    .from(promotions)
    .where(and(eq(promotions.id, id), eq(promotions.status, "active")));

  if (!promotion) return null;

  const typeIds = Array.isArray(promotion.promotionTypeId)
    ? promotion.promotionTypeId
    : [];

  const typeOptions =
    typeIds.length > 0
      ? await db
          .select()
          .from(dropdownOptions)
          .where(inArray(dropdownOptions.id, typeIds))
      : [];

  return {
    ...promotion,
    promotionType: {
      id: typeIds,
      data: typeOptions,
    },
  };
};

export const getPublicPaginatedPromotions = async (
  page: number,
  pageSize: number
) => {
  const offset = (page - 1) * pageSize;

  const rows = await db
    .select()
    .from(promotions)
    .where(eq(promotions.status, "active"))
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(promotions)
    .where(eq(promotions.status, "active"));

  const total = Number(countResult[0].count);

  // Collect all unique type IDs from all rows
  const allTypeIds: number[] = Array.from(
    new Set(
      rows.flatMap((row) =>
        Array.isArray(row.promotionTypeId) ? row.promotionTypeId : []
      )
    )
  );

  // Fetch dropdown options
  const dropdownOptionMap: Record<number, typeof dropdownOptions.$inferSelect> =
    {};
  if (allTypeIds.length > 0) {
    const options = await db
      .select()
      .from(dropdownOptions)
      .where(inArray(dropdownOptions.id, allTypeIds));

    for (const opt of options) {
      dropdownOptionMap[opt.id] = opt;
    }
  }

  const data = rows.map((promotion) => {
    const typeIds = Array.isArray(promotion.promotionTypeId)
      ? promotion.promotionTypeId
      : [];

    const typeData = typeIds.map((id) => dropdownOptionMap[id]).filter(Boolean);

    return {
      ...promotion,
      promotionType: {
        id: typeIds,
        data: typeData,
      },
    };
  });

  return {
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};
