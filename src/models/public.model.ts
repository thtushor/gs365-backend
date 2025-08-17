import { and, eq, inArray, sql } from "drizzle-orm";
import {
  dropdownOptions,
  dropdowns,
  game_providers,
  games,
  promotions,
  sports,
} from "../db/schema";
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
export const getDropdownById = async (id: number) => {
  const [dropdown] = await db
    .select()
    .from(dropdowns)
    .where(eq(dropdowns.id, id));
  if (!dropdown) return null;

  const options = await db
    .select()
    .from(dropdownOptions)
    .where(
      and(
        eq(dropdownOptions.dropdown_id, id),
        eq(dropdownOptions.status, "active")
      )
    );

  return {
    ...dropdown,
    options: options.length
      ? options.map((opt) => ({
          id: opt.id,
          title: opt.title,
          status: opt.status,
          imgUrl: opt.imgUrl,
          created_at: opt.created_at,
          created_by: opt.created_by,
        }))
      : undefined,
  };
};
export const getAllDropdowns = async () => {
  const dropdownsList = await db.select().from(dropdowns);

  const dataWithOptions = await Promise.all(
    dropdownsList.map(async (dropdown: any) => {
      const options = await db
        .select()
        .from(dropdownOptions)
        .where(
          and(
            eq(dropdownOptions.dropdown_id, dropdown.id),
            eq(dropdownOptions.status, "active")
          )
        );

      return {
        ...dropdown,
        options: options.length
          ? options.map((opt) => ({
              id: opt.id,
              title: opt.title,
              status: opt.status,
              imgUrl: opt.imgUrl,
              created_at: opt.created_at,
              created_by: opt.created_by,
            }))
          : [],
      };
    })
  );

  return dataWithOptions;
};
export const getPaginatedDropdowns = async (page: number, pageSize: number) => {
  const offset = (page - 1) * pageSize;

  const dropdownsList = await db
    .select()
    .from(dropdowns)
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(dropdowns);

  const total = Number(countResult[0].count);

  const dataWithOptions = await Promise.all(
    dropdownsList.map(async (dropdown: any) => {
      const options = await db
        .select()
        .from(dropdownOptions)
        .where(
          and(
            eq(dropdownOptions.dropdown_id, dropdown.id),
            eq(dropdownOptions.status, "active")
          )
        );

      return {
        ...dropdown,
        options: options.length
          ? options.map((opt) => ({
              id: opt.id,
              title: opt.title,
              status: opt.status,
              imgUrl: opt.imgUrl,
              created_at: opt.created_at,
              created_by: opt.created_by,
            }))
          : [],
      };
    })
  );

  return {
    data: dataWithOptions,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const getProvidersByCategoryId = async (categoryId: number) => {
  // Step 1: Get all games under this categoryId
  const matchedGames = await db
    .select({
      providerInfo: games.providerInfo,
    })
    .from(games)
    .where(sql`JSON_EXTRACT(${games.categoryInfo}, '$.id') = ${categoryId}`);
  console.log("matchedGames", matchedGames);
  if (matchedGames.length === 0) return [];

  // Step 2: Extract unique providerIds (force type = number[])
  const providerIds: number[] = [
    ...new Set(
      matchedGames
        .map((g) => g.providerInfo?.id)
        .filter((id): id is number => typeof id === "number") // ✅ type guard
    ),
  ];

  if (providerIds.length === 0) return [];

  // Step 3: Fetch provider details
  const providers = await db
    .select()
    .from(game_providers)
    .where(inArray(game_providers.id, providerIds));

  return providers;
};

export async function getGameDetailsById(id: number) {
  const [game] = await db.select().from(games).where(eq(games.id, id));

  return game || null;
}
export async function getPaginatedGameList(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  const rows = await db.select().from(games).limit(pageSize).offset(offset);

  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(games);

  const total = Number(countResult[0].count);

  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getPaginatedCategoryWiseGameList(
  page: number,
  pageSize: number,
  categoryId: number
) {
  const offset = (page - 1) * pageSize;

  // Fetch rows with JSON filter and status = 'active'
  const rows = await db
    .select()
    .from(games)
    .where(
      sql`${games.status} = 'active' AND JSON_EXTRACT(${games.categoryInfo}, '$.id') = ${categoryId}`
    )
    .limit(pageSize)
    .offset(offset);

  // Count total matching rows
  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(games)
    .where(
      sql`${games.status} = 'active' AND JSON_EXTRACT(${games.categoryInfo}, '$.id') = ${categoryId}`
    );

  const total = Number(countResult[0].count);

  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getSportDetailsById(id: number) {
  const [sport] = await db.select().from(sports).where(eq(sports.id, id));

  return sport || null;
}
export async function getPaginatedSportList(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  const rows = await db.select().from(sports).limit(pageSize).offset(offset);

  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(sports);

  const total = Number(countResult[0].count);

  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getPaginatedCategoryWiseSportList(
  page: number,
  pageSize: number,
  categoryId: number
) {
  const offset = (page - 1) * pageSize;

  // Fetch rows with JSON filter and status = 'active'
  const rows = await db
    .select()
    .from(sports)
    .where(
      sql`${sports.status} = 'active' AND JSON_EXTRACT(${sports.categoryInfo}, '$.id') = ${categoryId}`
    )
    .limit(pageSize)
    .offset(offset);

  // Count total matching rows
  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(sports)
    .where(
      sql`${sports.status} = 'active' AND JSON_EXTRACT(${sports.categoryInfo}, '$.id') = ${categoryId}`
    );

  const total = Number(countResult[0].count);

  return {
    data: rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}
