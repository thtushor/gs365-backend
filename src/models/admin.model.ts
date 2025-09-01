import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import {
  eq,
  or,
  and,
  like,
  inArray,
  ne,
  desc,
  isNotNull,
  isNull,
} from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  adminUsers,
  announcements,
  currencies,
  dropdownOptions,
  dropdowns,
  game_providers,
  games,
  promotions,
  sports_providers,
} from "../db/schema";
import { db } from "../db/connection";
import { PromotionDataType } from "../utils/types";
import { promotionSelectFields } from "../selected_field/promotionSelectFields";
import { AnyMySqlTable } from "drizzle-orm/mysql-core";
import { sports } from "../db/schema/sports";

export const findAdminByUsernameOrEmail = async (usernameOrEmail: string) => {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(
      or(
        eq(adminUsers.username, usernameOrEmail),
        eq(adminUsers.email, usernameOrEmail),
        eq(adminUsers.phone, usernameOrEmail)
      )
    );
  return admin;
};

export const createAdmin = async (data: {
  username: string;
  fullname: string;
  phone: string;
  email: string;
  password: string;
  role: "admin" | "superAgent" | "agent" | "superAffiliate" | "affiliate";
  country?: string;
  city?: string;
  street?: string;
  minTrx?: string;
  maxTrx?: string;
  currency?: number;
  createdBy?: number;
  status?: "active" | "inactive";
  refCode?: string;
  referred_by?: number;
  commission_percent: number;
}) => {
  const [admin] = await db.insert(adminUsers).values({
    ...data,
    createdBy: data?.createdBy,
    referred_by: data?.referred_by,
  });
  return admin;
};

export const getAdminById = async (id: number) => {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.id, id));

  if (!admin) return null;

  let currencyInfo = null;
  let referDetails = null;

  // If admin has a currencyId, fetch the currency info
  if (admin?.currency) {
    const [currencyData] = await db
      .select()
      .from(currencies)
      .where(eq(currencies.id, admin.currency));

    if (currencyData) {
      currencyInfo = currencyData;
    }
  }
  // If admin has a referred_by field, fetch the refer details
  if (admin?.referred_by) {
    const [referData] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.id, admin.referred_by));

    if (referData) {
      referDetails = referData;
    }
  }

  return {
    ...admin,
    currencyInfo: currencyInfo,
    referDetails: referDetails,
  };
};
export type AdminRole =
  | "admin"
  | "superAgent"
  | "agent"
  | "superAffiliate"
  | "affiliate";

export interface AdminFilters {
  role?: AdminRole | AdminRole[]; // Accepts single role or array of roles
  roleList?: AdminRole[];
  page?: number;
  pageSize?: number;
  searchKeyword?: string;
  status?: "active" | "inactive";
}

export const getAdminsWithFilters = async (filters: AdminFilters) => {
  const {
    role,
    roleList,
    page = 1,
    pageSize = 10,
    searchKeyword,
    status,
  } = filters;
  const whereClauses = [];
  if (role)
    whereClauses.push(
      Array.isArray(role)
        ? role.length > 0 && inArray(adminUsers.role, role)
        : eq(adminUsers.role, role)
    );

  if (roleList && roleList?.length > 0) {
    whereClauses.push(inArray(adminUsers.role, [...roleList]));
  }

  console.log(searchKeyword);
  if (searchKeyword) {
    const kw = `%${searchKeyword}%`;
    whereClauses.push(
      or(
        like(adminUsers.username, kw),
        like(adminUsers.fullname, kw),
        like(adminUsers.email, kw),
        like(adminUsers.phone, kw)
      )
    );
  }
  if (status) {
    whereClauses.push(eq(adminUsers.status, status));
  }
  // Filter out any falsey (e.g., false) values from whereClauses to avoid boolean in and()
  const filteredWhereClauses = whereClauses.filter(
    (clause): clause is Exclude<typeof clause, boolean | undefined> =>
      Boolean(clause)
  );
  const where = filteredWhereClauses.length
    ? and(...filteredWhereClauses)
    : undefined;
  // Get total count
  const total = await db
    .select({ count: sql`COUNT(*)` })
    .from(adminUsers)
    .where(where)
    .then((rows) => Number(rows[0]?.count || 0));
  // Get paginated data
  const data = await db
    .select()
    .from(adminUsers)
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

export const getAdminsDetailsByReferCode = async (refererCode: string) => {
  try {
    const [data] = await db
      .select()
      .from(adminUsers)
      .where(eq(adminUsers.refCode, refererCode));

    return data;
  } catch (error) {
    console.error("Error fetching admin details by refer code:", error);
    throw new Error("Failed to fetch admin details");
  }
};

export const updateAdmin = async (
  id: number,
  data: Partial<{
    username: string;
    fullname: string;
    phone: string;
    email: string;
    password: string;
    role: "admin" | "superAgent" | "agent" | "superAffiliate" | "affiliate";
    country?: string;
    city?: string;
    street?: string;
    minTrx?: string;
    maxTrx?: string;
    currency?: number;
    isLoggedIn?: boolean;
    refCode?: string;
    status?: "active" | "inactive";
  }>
) => {
  await db.update(adminUsers).set(data).where(eq(adminUsers.id, id));
  return getAdminById(id);
};

export const deleteAdmin = async (id: number) => {
  const result = await db.delete(adminUsers).where(eq(adminUsers.id, id));
  return result;
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
    .where(eq(dropdownOptions.dropdown_id, id));

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
          isMenu: opt.isMenu,
        }))
      : undefined,
  };
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
        .where(eq(dropdownOptions.dropdown_id, dropdown.id));

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
              isMenu: opt.isMenu,
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
// Get single dropdown option details
export const getSingleDropdownOptionById = async (id: number) => {
  const [option] = await db
    .select()
    .from(dropdownOptions)
    .where(
      and(eq(dropdownOptions.id, id), eq(dropdownOptions.status, "active"))
    );
  return option || null;
};

// Get paginated dropdown options
export const getPaginatedDropdownOptions = async (
  page: number,
  pageSize: number
) => {
  const offset = (page - 1) * pageSize;

  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)`.as("count") })
    .from(dropdownOptions);

  const total = countResult?.count ?? 0;

  const options = await db
    .select()
    .from(dropdownOptions)
    .limit(pageSize)
    .offset(offset);

  return {
    data: options,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export async function createPromotion(promotionData: PromotionDataType) {
  const [existing] = await db
    .select()
    .from(promotions)
    .where(eq(promotions.promotionName, promotionData.promotionName));

  if (existing) {
    throw new Error("DUPLICATE_PROMOTION");
  }

  const typeIds = Array.isArray(promotionData.promotionTypeId)
    ? promotionData.promotionTypeId
    : [promotionData.promotionTypeId];

  const validOptions = await db
    .select()
    .from(dropdownOptions)
    .where(
      and(
        inArray(dropdownOptions.id, typeIds),
        eq(dropdownOptions.status, "active")
      )
    );

  if (validOptions.length !== typeIds.length) {
    throw new Error("INVALID_PROMOTION_TYPE");
  }

  await db.insert(promotions).values({
    ...promotionData,
    promotionTypeId: typeIds, // save as array (JSON)
    status: promotionData.status || "inactive",
    minimumDepositAmount: promotionData.minimumDepositAmount.toFixed(2),
    maximumDepositAmount: promotionData.maximumDepositAmount.toFixed(2),
  });

  return true;
}

export async function updatePromotion(
  id: number,
  promotionData: PromotionDataType
) {
  const [existing] = await db
    .select()
    .from(promotions)
    .where(
      and(
        eq(promotions.promotionName, promotionData.promotionName),
        ne(promotions.id, id)
      )
    );

  if (existing) {
    throw new Error("DUPLICATE_PROMOTION");
  }

  const typeIds = Array.isArray(promotionData.promotionTypeId)
    ? promotionData.promotionTypeId
    : [promotionData.promotionTypeId];

  const validOptions = await db
    .select()
    .from(dropdownOptions)
    .where(
      and(
        inArray(dropdownOptions.id, typeIds),
        eq(dropdownOptions.status, "active")
      )
    );

  if (validOptions.length !== typeIds.length) {
    throw new Error("INVALID_PROMOTION_TYPE");
  }

  await db
    .update(promotions)
    .set({
      ...promotionData,
      promotionTypeId: typeIds, // store array
      status: promotionData.status || "inactive",
      minimumDepositAmount: promotionData.minimumDepositAmount.toFixed(2),
      maximumDepositAmount: promotionData.maximumDepositAmount.toFixed(2),
    })
    .where(eq(promotions.id, id));

  return true;
}

export const getPromotionById = async (id: number) => {
  const [promotion] = await db
    .select()
    .from(promotions)
    .where(eq(promotions.id, id));

  if (!promotion) return null;

  const typeIds = Array.isArray(promotion.promotionTypeId)
    ? promotion.promotionTypeId
    : [];

  const fullTypeData = await db
    .select()
    .from(dropdownOptions)
    .where(inArray(dropdownOptions.id, typeIds as number[]));

  return {
    ...promotion,
    promotionType: {
      id: typeIds,
      data: fullTypeData,
    },
  };
};

export const getPaginatedPromotions = async (
  page: number,
  pageSize: number
) => {
  const offset = (page - 1) * pageSize;

  // Step 1: Get paginated promotions
  const rows = await db
    .select()
    .from(promotions)
    .limit(pageSize)
    .offset(offset);

  // Step 2: Get total count
  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(promotions);
  const total = Number(countResult[0].count);

  // Step 3: Extract all typeIds (flattened)
  const allTypeIds: number[] = Array.from(
    new Set(
      rows.flatMap((row) =>
        Array.isArray(row.promotionTypeId) ? row.promotionTypeId : []
      )
    )
  );

  // Step 4: Get full dropdownOption data for all involved typeIds
  const dropdownOptionMap: Record<number, typeof dropdownOptions.$inferSelect> =
    {};

  if (allTypeIds.length > 0) {
    const optionRows = await db
      .select()
      .from(dropdownOptions)
      .where(inArray(dropdownOptions.id, allTypeIds as number[]));

    for (const opt of optionRows) {
      dropdownOptionMap[opt.id] = opt;
    }
  }

  // Step 5: Map result to match frontend expectations
  const data = rows.map((promotion) => {
    const typeIds: number[] = Array.isArray(promotion.promotionTypeId)
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

export const getPaginatedAnnouncements = async (
  page: number,
  pageSize: number
) => {
  const offset = (page - 1) * pageSize;

  const rows = await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.createdAt))
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(promotions);

  const total = Number(countResult[0].count);

  return {
    rows,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

export const findAdminByRefCode = async (refCode: string) => {
  const [admin] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.refCode, refCode));
  return admin;
};

// shared delete logic
export const deleteById = async (
  table: any,
  id: number
): Promise<{ success: boolean; message: string }> => {
  // Check if record exists
  const record = await db.select().from(table).where(eq(table.id, id));

  if (record.length === 0) {
    return {
      success: false,
      message: "Record not found.",
    };
  }

  // Proceed with deletion
  await db.delete(table).where(eq(table.id, id));

  return {
    success: true,
    message: "Record deleted successfully.",
  };
};

export const getTotalCount = async (table: AnyMySqlTable) => {
  const result = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(table);

  return Number(result[0].count);
};

export async function createGameProvider(data: any) {
  const [existing] = await db
    .select()
    .from(game_providers)
    .where(eq(game_providers.name, data.name));

  if (existing) {
    throw new Error("DUPLICATE_NAME");
  }

  await db.insert(game_providers).values(data);
}
export async function updateGameProvider(id: number, data: any) {
  const [existing] = await db
    .select()
    .from(game_providers)
    .where(and(eq(game_providers.name, data.name), ne(game_providers.id, id)));

  if (existing) {
    throw new Error("DUPLICATE_NAME");
  }

  await db.update(game_providers).set(data).where(eq(game_providers.id, id));
}
export async function getGameProviderById(id: number) {
  const [provider] = await db
    .select()
    .from(game_providers)
    .where(eq(game_providers.id, id));

  return provider || null;
}
export async function getPaginatedGameProviders(
  page: number,
  pageSize: number,
  parentId: any
) {
  const offset = (page - 1) * pageSize;
  const whereClause = parentId
    ? eq(game_providers.parentId, parentId)
    : undefined;
  const rows = await db
    .select()
    .from(game_providers)
    .where(whereClause)
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(game_providers);

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

export const getGameSubProviderByGameProviderId = async (parentId: number) => {
  const whereClause = parentId
    ? eq(game_providers.parentId, parentId)
    : undefined;
  const providers = await db.select().from(game_providers).where(whereClause);

  return providers;
};

export const getAllGameProviders = async (isParent?: boolean) => {
  const providers =
    isParent === true
      ? await db
          .select()
          .from(game_providers)
          .where(isNull(game_providers.parentId))
      : await db.select().from(game_providers);

  return providers;
};

// game
export async function createGame(data: any) {
  const [existing] = await db
    .select()
    .from(games)
    .where(eq(games.name, data.name));

  if (existing) {
    throw new Error("DUPLICATE_NAME");
  }

  await db.insert(games).values(data);
}

export async function updateGame(id: number, data: any) {
  const [existing] = await db
    .select()
    .from(games)
    .where(eq(games.name, data.name));

  if (existing && existing.id !== id) {
    throw new Error("DUPLICATE_NAME");
  }

  await db.update(games).set(data).where(eq(games.id, id));
}
export async function getPaginatedGameList(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  const rows = await db
    .select({
      // Flatten game fields
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

      // Join info
      categoryInfo: dropdownOptions,
      providerInfo: game_providers,
    })
    .from(games)
    .leftJoin(dropdownOptions, eq(games.categoryId, dropdownOptions.id))
    .leftJoin(game_providers, eq(games.providerId, game_providers.id))
    .limit(pageSize)
    .offset(offset);

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
export async function getGameDetailsById(gameId: number) {
  const result = await db
    .select({
      // Flatten game fields
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

      // Join info
      categoryInfo: dropdownOptions,
      providerInfo: game_providers,
    })
    .from(games)
    .leftJoin(dropdownOptions, eq(games.categoryId, dropdownOptions.id))
    .leftJoin(game_providers, eq(games.providerId, game_providers.id))
    .where(eq(games.id, gameId));

  return result[0]; // full info
}

// sports provider
export async function createSportsProvider(data: any) {
  const [existing] = await db
    .select()
    .from(sports_providers)
    .where(eq(sports_providers.name, data.name));

  if (existing) {
    throw new Error("DUPLICATE_NAME");
  }

  await db.insert(sports_providers).values(data);
}
export async function updateSportsProvider(id: number, data: any) {
  const [existing] = await db
    .select()
    .from(sports_providers)
    .where(
      and(eq(sports_providers.name, data.name), ne(sports_providers.id, id))
    );

  if (existing) {
    throw new Error("DUPLICATE_NAME");
  }

  await db
    .update(sports_providers)
    .set(data)
    .where(eq(sports_providers.id, id));
}
export async function getSportsProviderById(id: number) {
  const [provider] = await db
    .select()
    .from(sports_providers)
    .where(eq(sports_providers.id, id));

  return provider || null;
}

export const getSportSubProviderBySportProviderId = async (
  parentId: number
) => {
  const whereClause = parentId
    ? eq(sports_providers.parentId, parentId)
    : undefined;
  const providers = await db.select().from(sports_providers).where(whereClause);

  return providers;
};
export async function getPaginatedSportsProviders(
  page: number,
  pageSize: number,
  parentId: any
) {
  const offset = (page - 1) * pageSize;
  const whereClause = parentId
    ? eq(sports_providers.parentId, parentId)
    : undefined;
  const rows = await db
    .select()
    .from(sports_providers)
    .where(whereClause)
    .limit(pageSize)
    .offset(offset);

  const countResult = await db
    .select({ count: sql`COUNT(*)`.as("count") })
    .from(sports_providers);

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
export const getAllSportsProviders = async (isParent?: boolean) => {
  const providers =
    isParent === true
      ? await db
          .select()
          .from(sports_providers)
          .where(isNull(sports_providers.parentId))
      : await db.select().from(sports_providers);

  return providers;
};

// sport
export async function createSport(data: any) {
  const [existing] = await db
    .select()
    .from(sports)
    .where(eq(sports.name, data.name));

  if (existing) {
    throw new Error("DUPLICATE_NAME");
  }

  console.log(data);

  await db.insert(sports).values(data);
}

export async function updateSport(id: number, data: any) {
  const [existing] = await db
    .select()
    .from(sports)
    .where(eq(sports.name, data.name));

  if (existing && existing.id !== id) {
    throw new Error("DUPLICATE_NAME");
  }

  await db.update(sports).set(data).where(eq(sports.id, id));
}
export async function getPaginatedSportList(
  page: number,
  pageSize: number,
  searchKeyword?: string,
  status?: "active" | "inactive",
  publicList?: boolean
) {
  const offset = (page - 1) * pageSize;

  const whereClauses: any[] = [];
  if (searchKeyword) {
    const kw = `%${searchKeyword}%`;
    whereClauses.push(or(like(sports.name, kw)));
  }
  if (status) {
    whereClauses.push(eq(sports.status, status));
  }

  const filteredWhereClauses = whereClauses.filter(
    (clause): clause is Exclude<typeof clause, boolean | undefined> =>
      Boolean(clause)
  );
  const where = filteredWhereClauses.length
    ? and(...filteredWhereClauses)
    : undefined;

  // Base query
  const query = db
    .select({
      id: sports.id,
      name: sports.name,
      parentId: sports.parentId,
      status: sports.status,
      isFavorite: sports.isFavorite,
      isExclusive: sports.isExclusive,
      apiKey: sports.apiKey,
      licenseKey: sports.licenseKey,
      sportLogo: sports.sportLogo,
      secretPin: sports.secretPin,
      sportUrl: sports.sportUrl,
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
    .where(where);

  // Execute query with or without pagination
  const rows = publicList
    ? await query
    : await query.limit(pageSize).offset(offset);

  // Count total rows (skip if publicList is true)
  const total = publicList
    ? rows.length
    : Number(
        (
          await db
            .select({ count: sql`COUNT(*)`.as("count") })
            .from(sports)
            .where(where)
        )[0].count
      );

  // Flatten rows
  const data = rows.map((row) => ({
    ...row,
    categoryInfo: row.categoryInfo || null,
    providerInfo: row.providerInfo || null,
  }));

  return {
    data,
    pagination: publicList
      ? undefined
      : {
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
      // Flatten sports fields
      id: sports.id,
      name: sports.name,
      parentId: sports.parentId,
      status: sports.status,
      isFavorite: sports.isFavorite,
      isExclusive: sports.isExclusive,
      apiKey: sports.apiKey,
      licenseKey: sports.licenseKey,
      sportLogo: sports.sportLogo,
      secretPin: sports.secretPin,
      sportUrl: sports.sportUrl,
      ggrPercent: sports.ggrPercent,
      categoryId: sports.categoryId,
      providerId: sports.providerId,
      createdBy: sports.createdBy,
      createdAt: sports.createdAt,

      // Join info
      categoryInfo: dropdownOptions,
      providerInfo: game_providers,
    })
    .from(sports)
    .leftJoin(dropdownOptions, eq(sports.categoryId, dropdownOptions.id))
    .leftJoin(game_providers, eq(sports.providerId, game_providers.id))
    .where(eq(sports.id, id));

  if (!sport) return null;

  return {
    ...sport,
    categoryInfo: sport.categoryInfo || null,
    providerInfo: sport.providerInfo || null,
  };
}
export const getAllMenuProviders = async () => {
  // --- Game Providers with active games and isMenu = true ---
  const game_providers_list = await db
    .select()
    .from(game_providers)
    .where(and(eq(game_providers.isMenu, true)))
    .orderBy(game_providers.menuPriority);

  // --- Sports Providers with active sports and isMenu = true ---
  const sports_providers_list = await db
    .select()
    .from(sports_providers)
    .where(and(eq(sports_providers.isMenu, true)))
    .orderBy(sports_providers.menuPriority);
  const category_menu_list = await db
    .select()
    .from(dropdownOptions)
    .where(and(eq(dropdownOptions.isMenu, true)))
    .orderBy(dropdownOptions.menuPriority);

  return {
    game_providers: game_providers_list,
    sports_providers: sports_providers_list,
    category_menu: category_menu_list,
  };
};
