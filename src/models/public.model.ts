import { and, eq, inArray, sql } from "drizzle-orm";
import {
  dropdownOptions,
  dropdowns,
  game_providers,
  games,
  promotions,
  sports,
  sports_providers,
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

export const getAllProvidersByCategoryId = async (categoryId: number) => {
  // --- GAME PROVIDERS ---
  const matchedGameProviders = await db
    .select({ providerId: games.providerId })
    .from(games)
    .where(eq(games.categoryId, categoryId));

  const gameProviderIds = [
    ...new Set(
      matchedGameProviders
        .map((g) => g.providerId)
        .filter((id): id is number => typeof id === "number")
    ),
  ];

  const game_providers_list = gameProviderIds.length
    ? await db
        .select()
        .from(game_providers)
        .where(inArray(game_providers.id, gameProviderIds))
    : [];

  // --- SPORT PROVIDERS ---
  const matchedSportProviders = await db
    .select({ providerId: sports.providerId })
    .from(sports)
    .where(eq(sports.categoryId, categoryId));

  const sportProviderIds = [
    ...new Set(
      matchedSportProviders
        .map((s) => s.providerId)
        .filter((id): id is number => typeof id === "number")
    ),
  ];

  const sport_providers_list = sportProviderIds.length
    ? await db
        .select()
        .from(game_providers)
        .where(inArray(game_providers.id, sportProviderIds))
    : [];

  return {
    game_providers: game_providers_list,
    sport_providers: sport_providers_list,
  };
};

export async function getGameDetailsById(id: number) {
  const [game] = await db
    .select({
      // Game fields
      id: games.id,
      name: games.name,
      parentId: games.parentId,
      status: games.status,
      isFavorite: games.isFavorite,
      isExclusive: games.isExclusive,
      apiKey: games.apiKey,
      licenseKey: games.licenseKey,
      gameLogo: games.gameLogo,
      secretPin: games.secretPin,
      gameUrl: games.gameUrl,
      ggrPercent: games.ggrPercent,
      categoryId: games.categoryId,
      providerId: games.providerId,
      createdBy: games.createdBy,
      createdAt: games.createdAt,

      // Joined info
      categoryInfo: dropdownOptions,
      providerInfo: game_providers,
    })
    .from(games)
    .leftJoin(dropdownOptions, eq(games.categoryId, dropdownOptions.id))
    .leftJoin(game_providers, eq(games.providerId, game_providers.id))
    .where(eq(games.id, id));

  if (!game) return null;

  return {
    ...game,
    categoryInfo: game.categoryInfo || null,
    providerInfo: game.providerInfo || null,
  };
}

export async function getPaginatedGameList(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  const rows = await db
    .select()
    .from(games)
    .where(eq(games.status, "active"))
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(games)
    .where(eq(games.status, "active"));

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

  const rows = await db
    .select({
      id: games.id,
      name: games.name,
      parentId: games.parentId,
      status: games.status,
      isFavorite: games.isFavorite,
      isExclusive: games.isExclusive,
      apiKey: games.apiKey,
      licenseKey: games.licenseKey,
      logo: games.gameLogo,
      secretPin: games.secretPin,
      url: games.gameUrl,
      ggrPercent: games.ggrPercent,
      categoryId: games.categoryId,
      providerId: games.providerId,
      createdBy: games.createdBy,
      createdAt: games.createdAt,
      categoryInfo: dropdownOptions,
      providerInfo: game_providers,
    })
    .from(games)
    .leftJoin(dropdownOptions, eq(games.categoryId, dropdownOptions.id))
    .leftJoin(game_providers, eq(games.providerId, game_providers.id))
    .where(and(eq(games.categoryId, categoryId), eq(games.status, "active")))
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(games)
    .where(and(eq(games.categoryId, categoryId), eq(games.status, "active")));

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
  const [sport] = await db
    .select({
      // Game fields
      id: sports.id,
      name: sports.name,
      parentId: sports.parentId,
      status: sports.status,
      isFavorite: sports.isFavorite,
      isExclusive: sports.isExclusive,
      apiKey: sports.apiKey,
      licenseKey: sports.licenseKey,
      gameLogo: sports.sportLogo,
      secretPin: sports.secretPin,
      gameUrl: sports.sportUrl,
      ggrPercent: sports.ggrPercent,
      categoryId: sports.categoryId,
      providerId: sports.providerId,
      createdBy: sports.createdBy,
      createdAt: sports.createdAt,

      // Joined info
      categoryInfo: dropdownOptions,
      providerInfo: sports_providers,
    })
    .from(sports)
    .leftJoin(dropdownOptions, eq(sports.categoryId, dropdownOptions.id))
    .leftJoin(sports_providers, eq(sports.providerId, sports_providers.id))
    .where(and(eq(sports.id, id), eq(sports.status, "active")));

  if (!sport) return null;

  return {
    ...sport,
    categoryInfo: sport.categoryInfo || null,
    providerInfo: sport.providerInfo || null,
  };
}

export async function getPaginatedSportList(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  const rows = await db
    .select()
    .from(sports)
    .where(eq(sports.status, "active"))
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(sports)
    .where(eq(sports.status, "active"));

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

  const rows = await db
    .select({
      id: sports.id,
      name: sports.name,
      parentId: sports.parentId,
      status: sports.status,
      isFavorite: sports.isFavorite,
      isExclusive: sports.isExclusive,
      apiKey: sports.apiKey,
      licenseKey: sports.licenseKey,
      logo: sports.sportLogo,
      secretPin: sports.secretPin,
      url: sports.sportUrl,
      ggrPercent: sports.ggrPercent,
      categoryId: sports.categoryId,
      providerId: sports.providerId,
      createdBy: sports.createdBy,
      createdAt: sports.createdAt,
      categoryInfo: dropdownOptions,
      providerInfo: sports_providers,
    })
    .from(sports)
    .leftJoin(dropdownOptions, eq(sports.categoryId, dropdownOptions.id))
    .leftJoin(sports_providers, eq(sports.providerId, sports_providers.id))
    .where(and(eq(sports.categoryId, categoryId), eq(sports.status, "active")))
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(sports)
    .where(and(eq(sports.categoryId, categoryId), eq(sports.status, "active")));

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
export async function getGameOrSportListBasedOnCategoryAndProvider(
  type: "games" | "sports",
  providerId: number,
  categoryId?: number // ✅ make optional
) {
  if (type === "games") {
    const conditions = [
      eq(games.providerId, providerId),
      eq(games.status, "active"),
    ];

    if (categoryId) {
      conditions.push(eq(games.categoryId, categoryId));
    }

    const rows = await db
      .select({
        id: games.id,
        name: games.name,
        parentId: games.parentId,
        status: games.status,
        isFavorite: games.isFavorite,
        isExclusive: games.isExclusive,
        apiKey: games.apiKey,
        licenseKey: games.licenseKey,
        logo: games.gameLogo,
        secretPin: games.secretPin,
        url: games.gameUrl,
        ggrPercent: games.ggrPercent,
        categoryId: games.categoryId,
        providerId: games.providerId,
        createdBy: games.createdBy,
        createdAt: games.createdAt,
        categoryInfo: dropdownOptions,
        providerInfo: sports_providers,
      })
      .from(games)
      .leftJoin(dropdownOptions, eq(games.categoryId, dropdownOptions.id))
      .leftJoin(sports_providers, eq(games.providerId, sports_providers.id))
      .where(and(...conditions));

    return {
      data: rows.map((row) => ({
        ...row,
        categoryInfo: row.categoryInfo || null,
        providerInfo: row.providerInfo || null,
      })),
    };
  }

  // ✅ sports case
  const conditions = [
    eq(sports.providerId, providerId),
    eq(sports.status, "active"),
  ];

  if (categoryId) {
    conditions.push(eq(sports.categoryId, categoryId));
  }

  const rows = await db
    .select({
      id: sports.id,
      name: sports.name,
      parentId: sports.parentId,
      status: sports.status,
      isFavorite: sports.isFavorite,
      isExclusive: sports.isExclusive,
      apiKey: sports.apiKey,
      licenseKey: sports.licenseKey,
      logo: sports.sportLogo,
      secretPin: sports.secretPin,
      url: sports.sportUrl,
      ggrPercent: sports.ggrPercent,
      categoryId: sports.categoryId,
      providerId: sports.providerId,
      createdBy: sports.createdBy,
      createdAt: sports.createdAt,
      categoryInfo: dropdownOptions,
      providerInfo: sports_providers,
    })
    .from(sports)
    .leftJoin(dropdownOptions, eq(sports.categoryId, dropdownOptions.id))
    .leftJoin(sports_providers, eq(sports.providerId, sports_providers.id))
    .where(and(...conditions));

  return {
    data: rows.map((row) => ({
      ...row,
      categoryInfo: row.categoryInfo || null,
      providerInfo: row.providerInfo || null,
    })),
  };
}
