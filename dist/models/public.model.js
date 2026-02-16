"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExclusiveGamesSports = exports.getAllMenuProviders = exports.getAllActiveProviders = exports.getAllGamesOrSportsByProviderId = exports.getAllGamesOrSportsByCategoryID = exports.getAllGamesOrSports = exports.getAllProvidersByCategoryId = exports.getPaginatedDropdowns = exports.getAllDropdowns = exports.getDropdownById = exports.getPublicPaginatedPromotions = exports.getPublicPromotionById = void 0;
exports.getGameDetailsById = getGameDetailsById;
exports.getPaginatedGameList = getPaginatedGameList;
exports.getPaginatedCategoryWiseGameList = getPaginatedCategoryWiseGameList;
exports.getSportDetailsById = getSportDetailsById;
exports.getPaginatedSportList = getPaginatedSportList;
exports.getPaginatedCategoryWiseSportList = getPaginatedCategoryWiseSportList;
exports.getGameOrSportListBasedOnCategoryAndProvider = getGameOrSportListBasedOnCategoryAndProvider;
const drizzle_orm_1 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const connection_1 = require("../db/connection");
const getPublicPromotionById = async (id) => {
    const [promotion] = await connection_1.db
        .select()
        .from(schema_1.promotions)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.promotions.id, id), (0, drizzle_orm_1.eq)(schema_1.promotions.status, "active")));
    if (!promotion)
        return null;
    const typeIds = Array.isArray(promotion.promotionTypeId)
        ? promotion.promotionTypeId
        : [];
    const typeOptions = typeIds.length > 0
        ? await connection_1.db
            .select()
            .from(schema_1.dropdownOptions)
            .where((0, drizzle_orm_1.inArray)(schema_1.dropdownOptions.id, typeIds))
        : [];
    return {
        ...promotion,
        promotionType: {
            id: typeIds,
            data: typeOptions,
        },
    };
};
exports.getPublicPromotionById = getPublicPromotionById;
const getPublicPaginatedPromotions = async (page, pageSize) => {
    const offset = (page - 1) * pageSize;
    const rows = await connection_1.db
        .select()
        .from(schema_1.promotions)
        .where((0, drizzle_orm_1.eq)(schema_1.promotions.status, "active"))
        .limit(pageSize)
        .offset(offset);
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)`.as("count") })
        .from(schema_1.promotions)
        .where((0, drizzle_orm_1.eq)(schema_1.promotions.status, "active"));
    const total = Number(countResult[0].count);
    // Collect all unique type IDs from all rows
    const allTypeIds = Array.from(new Set(rows.flatMap((row) => Array.isArray(row.promotionTypeId) ? row.promotionTypeId : [])));
    // Fetch dropdown options
    const dropdownOptionMap = {};
    if (allTypeIds.length > 0) {
        const options = await connection_1.db
            .select()
            .from(schema_1.dropdownOptions)
            .where((0, drizzle_orm_1.inArray)(schema_1.dropdownOptions.id, allTypeIds));
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
exports.getPublicPaginatedPromotions = getPublicPaginatedPromotions;
const getDropdownById = async (id) => {
    const [dropdown] = await connection_1.db
        .select()
        .from(schema_1.dropdowns)
        .where((0, drizzle_orm_1.eq)(schema_1.dropdowns.id, id));
    if (!dropdown)
        return null;
    const options = await connection_1.db
        .select()
        .from(schema_1.dropdownOptions)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.dropdown_id, id), (0, drizzle_orm_1.eq)(schema_1.dropdownOptions.status, "active")));
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
exports.getDropdownById = getDropdownById;
const getAllDropdowns = async () => {
    const dropdownsList = await connection_1.db.select().from(schema_1.dropdowns);
    const dataWithOptions = await Promise.all(dropdownsList.map(async (dropdown) => {
        const options = await connection_1.db
            .select()
            .from(schema_1.dropdownOptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.dropdown_id, dropdown.id), (0, drizzle_orm_1.eq)(schema_1.dropdownOptions.status, "active")));
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
    }));
    return dataWithOptions;
};
exports.getAllDropdowns = getAllDropdowns;
const getPaginatedDropdowns = async (page, pageSize) => {
    const offset = (page - 1) * pageSize;
    const dropdownsList = await connection_1.db
        .select()
        .from(schema_1.dropdowns)
        .limit(pageSize)
        .offset(offset);
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)`.as("count") })
        .from(schema_1.dropdowns);
    const total = Number(countResult[0].count);
    const dataWithOptions = await Promise.all(dropdownsList.map(async (dropdown) => {
        const options = await connection_1.db
            .select()
            .from(schema_1.dropdownOptions)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.dropdown_id, dropdown.id), (0, drizzle_orm_1.eq)(schema_1.dropdownOptions.status, "active")));
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
    }));
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
exports.getPaginatedDropdowns = getPaginatedDropdowns;
const getAllProvidersByCategoryId = async (categoryId) => {
    // exclusive games
    if (categoryId === "exclusive") {
        // --- EXCLUSIVE GAMES ---
        const exclusiveGames = await connection_1.db
            .select()
            .from(schema_1.games)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.games.isExclusive, true), (0, drizzle_orm_1.eq)(schema_1.games.status, "active")));
        // --- EXCLUSIVE SPORTS ---
        const exclusiveSports = await connection_1.db
            .select()
            .from(schema_1.sports)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports.isExclusive, true), (0, drizzle_orm_1.eq)(schema_1.sports.status, "active")));
        return [...exclusiveGames, ...exclusiveSports];
    }
    // --- GAME PROVIDERS ---
    const matchedGameProviders = await connection_1.db
        .select({ providerId: schema_1.games.providerId })
        .from(schema_1.games)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.games.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.games.status, "active")));
    const gameProviderIds = [
        ...new Set(matchedGameProviders
            .map((g) => g.providerId)
            .filter((id) => typeof id === "number")),
    ];
    const game_providers_list = gameProviderIds.length
        ? await connection_1.db
            .select()
            .from(schema_1.game_providers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.game_providers.id, gameProviderIds), (0, drizzle_orm_1.eq)(schema_1.game_providers.status, "active")))
        : [];
    // --- SPORT PROVIDERS ---
    const matchedSportProviders = await connection_1.db
        .select({ providerId: schema_1.sports.providerId })
        .from(schema_1.sports)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.sports.status, "active")));
    const sportProviderIds = [
        ...new Set(matchedSportProviders
            .map((s) => s.providerId)
            .filter((id) => typeof id === "number")),
    ];
    const sport_providers_list = sportProviderIds.length
        ? await connection_1.db
            .select()
            .from(schema_1.sports_providers)
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.sports_providers.id, sportProviderIds), (0, drizzle_orm_1.eq)(schema_1.sports_providers.status, "active")))
        : [];
    return [...game_providers_list, ...sport_providers_list];
};
exports.getAllProvidersByCategoryId = getAllProvidersByCategoryId;
async function getGameDetailsById(id) {
    const [game] = await connection_1.db
        .select({
        // Game fields
        id: schema_1.games.id,
        name: schema_1.games.name,
        parentId: schema_1.games.parentId,
        status: schema_1.games.status,
        isFavorite: schema_1.games.isFavorite,
        isExclusive: schema_1.games.isExclusive,
        apiKey: schema_1.games.apiKey,
        licenseKey: schema_1.games.licenseKey,
        gameLogo: schema_1.games.gameLogo,
        secretPin: schema_1.games.secretPin,
        gameUrl: schema_1.games.gameUrl,
        ggrPercent: schema_1.games.ggrPercent,
        categoryId: schema_1.games.categoryId,
        providerId: schema_1.games.providerId,
        createdBy: schema_1.games.createdBy,
        createdAt: schema_1.games.createdAt,
        // Joined info
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.game_providers,
    })
        .from(schema_1.games)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.games.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.game_providers, (0, drizzle_orm_1.eq)(schema_1.games.providerId, schema_1.game_providers.id))
        .where((0, drizzle_orm_1.eq)(schema_1.games.id, id));
    if (!game)
        return null;
    return {
        ...game,
        categoryInfo: game.categoryInfo || null,
        providerInfo: game.providerInfo || null,
    };
}
async function getPaginatedGameList(page, pageSize) {
    const offset = (page - 1) * pageSize;
    const rows = await connection_1.db
        .select()
        .from(schema_1.games)
        .where((0, drizzle_orm_1.eq)(schema_1.games.status, "active"))
        .limit(pageSize)
        .offset(offset);
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)`.as("count") })
        .from(schema_1.games)
        .where((0, drizzle_orm_1.eq)(schema_1.games.status, "active"));
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
async function getPaginatedCategoryWiseGameList(page, pageSize, categoryId) {
    const offset = (page - 1) * pageSize;
    const rows = await connection_1.db
        .select({
        id: schema_1.games.id,
        name: schema_1.games.name,
        parentId: schema_1.games.parentId,
        status: schema_1.games.status,
        isFavorite: schema_1.games.isFavorite,
        isExclusive: schema_1.games.isExclusive,
        apiKey: schema_1.games.apiKey,
        licenseKey: schema_1.games.licenseKey,
        logo: schema_1.games.gameLogo,
        secretPin: schema_1.games.secretPin,
        url: schema_1.games.gameUrl,
        ggrPercent: schema_1.games.ggrPercent,
        categoryId: schema_1.games.categoryId,
        providerId: schema_1.games.providerId,
        createdBy: schema_1.games.createdBy,
        createdAt: schema_1.games.createdAt,
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.game_providers,
    })
        .from(schema_1.games)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.games.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.game_providers, (0, drizzle_orm_1.eq)(schema_1.games.providerId, schema_1.game_providers.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.games.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.games.status, "active")))
        .limit(pageSize)
        .offset(offset);
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)`.as("count") })
        .from(schema_1.games)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.games.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.games.status, "active")));
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
async function getSportDetailsById(id) {
    const [sport] = await connection_1.db
        .select({
        // Game fields
        id: schema_1.sports.id,
        name: schema_1.sports.name,
        parentId: schema_1.sports.parentId,
        status: schema_1.sports.status,
        isFavorite: schema_1.sports.isFavorite,
        isExclusive: schema_1.sports.isExclusive,
        apiKey: schema_1.sports.apiKey,
        licenseKey: schema_1.sports.licenseKey,
        gameLogo: schema_1.sports.sportLogo,
        secretPin: schema_1.sports.secretPin,
        gameUrl: schema_1.sports.sportUrl,
        ggrPercent: schema_1.sports.ggrPercent,
        categoryId: schema_1.sports.categoryId,
        providerId: schema_1.sports.providerId,
        createdBy: schema_1.sports.createdBy,
        createdAt: schema_1.sports.createdAt,
        // Joined info
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.sports_providers,
    })
        .from(schema_1.sports)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.sports.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.sports_providers, (0, drizzle_orm_1.eq)(schema_1.sports.providerId, schema_1.sports_providers.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports.id, id), (0, drizzle_orm_1.eq)(schema_1.sports.status, "active")));
    if (!sport)
        return null;
    return {
        ...sport,
        categoryInfo: sport.categoryInfo || null,
        providerInfo: sport.providerInfo || null,
    };
}
async function getPaginatedSportList(page, pageSize) {
    const offset = (page - 1) * pageSize;
    const rows = await connection_1.db
        .select()
        .from(schema_1.sports)
        .where((0, drizzle_orm_1.eq)(schema_1.sports.status, "active"))
        .limit(pageSize)
        .offset(offset);
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)`.as("count") })
        .from(schema_1.sports)
        .where((0, drizzle_orm_1.eq)(schema_1.sports.status, "active"));
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
async function getPaginatedCategoryWiseSportList(page, pageSize, categoryId) {
    const offset = (page - 1) * pageSize;
    const rows = await connection_1.db
        .select({
        id: schema_1.sports.id,
        name: schema_1.sports.name,
        parentId: schema_1.sports.parentId,
        status: schema_1.sports.status,
        isFavorite: schema_1.sports.isFavorite,
        isExclusive: schema_1.sports.isExclusive,
        apiKey: schema_1.sports.apiKey,
        licenseKey: schema_1.sports.licenseKey,
        logo: schema_1.sports.sportLogo,
        secretPin: schema_1.sports.secretPin,
        url: schema_1.sports.sportUrl,
        ggrPercent: schema_1.sports.ggrPercent,
        categoryId: schema_1.sports.categoryId,
        providerId: schema_1.sports.providerId,
        createdBy: schema_1.sports.createdBy,
        createdAt: schema_1.sports.createdAt,
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.sports_providers,
    })
        .from(schema_1.sports)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.sports.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.sports_providers, (0, drizzle_orm_1.eq)(schema_1.sports.providerId, schema_1.sports_providers.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.sports.status, "active")))
        .limit(pageSize)
        .offset(offset);
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_1.sql) `COUNT(*)`.as("count") })
        .from(schema_1.sports)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.sports.status, "active")));
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
async function getGameOrSportListBasedOnCategoryAndProvider(type, providerId, categoryId // ✅ make optional
) {
    if (type === "games") {
        const conditions = [
            (0, drizzle_orm_1.eq)(schema_1.games.providerId, providerId),
            (0, drizzle_orm_1.eq)(schema_1.games.status, "active"),
        ];
        if (categoryId) {
            conditions.push((0, drizzle_orm_1.eq)(schema_1.games.categoryId, categoryId));
        }
        const rows = await connection_1.db
            .select({
            id: schema_1.games.id,
            name: schema_1.games.name,
            parentId: schema_1.games.parentId,
            status: schema_1.games.status,
            isFavorite: schema_1.games.isFavorite,
            isExclusive: schema_1.games.isExclusive,
            apiKey: schema_1.games.apiKey,
            licenseKey: schema_1.games.licenseKey,
            logo: schema_1.games.gameLogo,
            secretPin: schema_1.games.secretPin,
            url: schema_1.games.gameUrl,
            ggrPercent: schema_1.games.ggrPercent,
            categoryId: schema_1.games.categoryId,
            providerId: schema_1.games.providerId,
            createdBy: schema_1.games.createdBy,
            createdAt: schema_1.games.createdAt,
            categoryInfo: schema_1.dropdownOptions,
            providerInfo: schema_1.sports_providers,
        })
            .from(schema_1.games)
            .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.games.categoryId, schema_1.dropdownOptions.id))
            .leftJoin(schema_1.sports_providers, (0, drizzle_orm_1.eq)(schema_1.games.providerId, schema_1.sports_providers.id))
            .where((0, drizzle_orm_1.and)(...conditions));
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
        (0, drizzle_orm_1.eq)(schema_1.sports.providerId, providerId),
        (0, drizzle_orm_1.eq)(schema_1.sports.status, "active"),
    ];
    if (categoryId) {
        conditions.push((0, drizzle_orm_1.eq)(schema_1.sports.categoryId, categoryId));
    }
    const rows = await connection_1.db
        .select({
        id: schema_1.sports.id,
        name: schema_1.sports.name,
        parentId: schema_1.sports.parentId,
        status: schema_1.sports.status,
        isFavorite: schema_1.sports.isFavorite,
        isExclusive: schema_1.sports.isExclusive,
        apiKey: schema_1.sports.apiKey,
        licenseKey: schema_1.sports.licenseKey,
        logo: schema_1.sports.sportLogo,
        secretPin: schema_1.sports.secretPin,
        url: schema_1.sports.sportUrl,
        ggrPercent: schema_1.sports.ggrPercent,
        categoryId: schema_1.sports.categoryId,
        providerId: schema_1.sports.providerId,
        createdBy: schema_1.sports.createdBy,
        createdAt: schema_1.sports.createdAt,
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.sports_providers,
    })
        .from(schema_1.sports)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.sports.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.sports_providers, (0, drizzle_orm_1.eq)(schema_1.sports.providerId, schema_1.sports_providers.id))
        .where((0, drizzle_orm_1.and)(...conditions));
    return {
        data: rows.map((row) => ({
            ...row,
            categoryInfo: row.categoryInfo || null,
            providerInfo: row.providerInfo || null,
        })),
    };
}
const getAllGamesOrSports = async (providerId, categoryId) => {
    // --- EXCLUSIVE GAMES ---
    const gamesList = await connection_1.db
        .select({
        id: schema_1.games.id,
        name: schema_1.games.name,
        parentId: schema_1.games.parentId,
        status: schema_1.games.status,
        isFavorite: schema_1.games.isFavorite,
        isExclusive: schema_1.games.isExclusive,
        apiKey: schema_1.games.apiKey,
        licenseKey: schema_1.games.licenseKey,
        logo: schema_1.games.gameLogo,
        secretPin: schema_1.games.secretPin,
        url: schema_1.games.gameUrl,
        ggrPercent: schema_1.games.ggrPercent,
        categoryId: schema_1.games.categoryId,
        providerId: schema_1.games.providerId,
        createdBy: schema_1.games.createdBy,
        createdAt: schema_1.games.createdAt,
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.game_providers,
    })
        .from(schema_1.games)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.games.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.game_providers, (0, drizzle_orm_1.eq)(schema_1.games.providerId, schema_1.game_providers.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.games.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.games.providerId, providerId), (0, drizzle_orm_1.eq)(schema_1.games.status, "active")));
    // --- EXCLUSIVE SPORTS ---
    const sportsList = await connection_1.db
        .select({
        id: schema_1.sports.id,
        name: schema_1.sports.name,
        parentId: schema_1.sports.parentId,
        status: schema_1.sports.status,
        isFavorite: schema_1.sports.isFavorite,
        isExclusive: schema_1.sports.isExclusive,
        apiKey: schema_1.sports.apiKey,
        licenseKey: schema_1.sports.licenseKey,
        logo: schema_1.sports.sportLogo,
        secretPin: schema_1.sports.secretPin,
        url: schema_1.sports.sportUrl,
        ggrPercent: schema_1.sports.ggrPercent,
        categoryId: schema_1.sports.categoryId,
        providerId: schema_1.sports.providerId,
        createdBy: schema_1.sports.createdBy,
        createdAt: schema_1.sports.createdAt,
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.sports_providers,
    })
        .from(schema_1.sports)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.sports.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.sports_providers, (0, drizzle_orm_1.eq)(schema_1.sports.providerId, schema_1.sports_providers.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.sports.providerId, providerId), (0, drizzle_orm_1.eq)(schema_1.sports.status, "active")));
    return [...gamesList, ...sportsList];
};
exports.getAllGamesOrSports = getAllGamesOrSports;
const getAllGamesOrSportsByCategoryID = async (categoryId) => {
    // --- EXCLUSIVE GAMES ---
    const gamesList = await connection_1.db
        .select({
        id: schema_1.games.id,
        name: schema_1.games.name,
        parentId: schema_1.games.parentId,
        status: schema_1.games.status,
        isFavorite: schema_1.games.isFavorite,
        isExclusive: schema_1.games.isExclusive,
        apiKey: schema_1.games.apiKey,
        licenseKey: schema_1.games.licenseKey,
        logo: schema_1.games.gameLogo,
        secretPin: schema_1.games.secretPin,
        url: schema_1.games.gameUrl,
        ggrPercent: schema_1.games.ggrPercent,
        categoryId: schema_1.games.categoryId,
        providerId: schema_1.games.providerId,
        createdBy: schema_1.games.createdBy,
        createdAt: schema_1.games.createdAt,
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.game_providers,
    })
        .from(schema_1.games)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.games.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.game_providers, (0, drizzle_orm_1.eq)(schema_1.games.providerId, schema_1.game_providers.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.games.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.games.status, "active")));
    // --- EXCLUSIVE SPORTS ---
    const sportsList = await connection_1.db
        .select({
        id: schema_1.sports.id,
        name: schema_1.sports.name,
        parentId: schema_1.sports.parentId,
        status: schema_1.sports.status,
        isFavorite: schema_1.sports.isFavorite,
        isExclusive: schema_1.sports.isExclusive,
        apiKey: schema_1.sports.apiKey,
        licenseKey: schema_1.sports.licenseKey,
        logo: schema_1.sports.sportLogo,
        secretPin: schema_1.sports.secretPin,
        url: schema_1.sports.sportUrl,
        ggrPercent: schema_1.sports.ggrPercent,
        categoryId: schema_1.sports.categoryId,
        providerId: schema_1.sports.providerId,
        createdBy: schema_1.sports.createdBy,
        createdAt: schema_1.sports.createdAt,
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.sports_providers,
    })
        .from(schema_1.sports)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.sports.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.sports_providers, (0, drizzle_orm_1.eq)(schema_1.sports.providerId, schema_1.sports_providers.id))
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports.categoryId, categoryId), (0, drizzle_orm_1.eq)(schema_1.sports.status, "active")));
    return [...gamesList, ...sportsList];
};
exports.getAllGamesOrSportsByCategoryID = getAllGamesOrSportsByCategoryID;
const getAllGamesOrSportsByProviderId = async (providerId, type) => {
    if (type === "games") {
        // Fetch games only
        const gamesList = await connection_1.db
            .select({
            id: schema_1.games.id,
            name: schema_1.games.name,
            parentId: schema_1.games.parentId,
            status: schema_1.games.status,
            isFavorite: schema_1.games.isFavorite,
            isExclusive: schema_1.games.isExclusive,
            apiKey: schema_1.games.apiKey,
            licenseKey: schema_1.games.licenseKey,
            logo: schema_1.games.gameLogo,
            secretPin: schema_1.games.secretPin,
            url: schema_1.games.gameUrl,
            ggrPercent: schema_1.games.ggrPercent,
            categoryId: schema_1.games.categoryId,
            providerId: schema_1.games.providerId,
            createdBy: schema_1.games.createdBy,
            createdAt: schema_1.games.createdAt,
            categoryInfo: schema_1.dropdownOptions,
            providerInfo: schema_1.game_providers,
        })
            .from(schema_1.games)
            .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.games.categoryId, schema_1.dropdownOptions.id))
            .leftJoin(schema_1.game_providers, (0, drizzle_orm_1.eq)(schema_1.games.providerId, schema_1.game_providers.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.games.providerId, providerId), (0, drizzle_orm_1.eq)(schema_1.games.status, "active")));
        return gamesList;
    }
    else if (type === "sports") {
        // Fetch sports only
        const sportsList = await connection_1.db
            .select({
            id: schema_1.sports.id,
            name: schema_1.sports.name,
            parentId: schema_1.sports.parentId,
            status: schema_1.sports.status,
            isFavorite: schema_1.sports.isFavorite,
            isExclusive: schema_1.sports.isExclusive,
            apiKey: schema_1.sports.apiKey,
            licenseKey: schema_1.sports.licenseKey,
            logo: schema_1.sports.sportLogo,
            secretPin: schema_1.sports.secretPin,
            url: schema_1.sports.sportUrl,
            ggrPercent: schema_1.sports.ggrPercent,
            categoryId: schema_1.sports.categoryId,
            providerId: schema_1.sports.providerId,
            createdBy: schema_1.sports.createdBy,
            createdAt: schema_1.sports.createdAt,
            categoryInfo: schema_1.dropdownOptions,
            providerInfo: schema_1.sports_providers,
        })
            .from(schema_1.sports)
            .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.sports.categoryId, schema_1.dropdownOptions.id))
            .leftJoin(schema_1.sports_providers, (0, drizzle_orm_1.eq)(schema_1.sports.providerId, schema_1.sports_providers.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports.providerId, providerId), (0, drizzle_orm_1.eq)(schema_1.sports.status, "active")));
        return sportsList;
    }
    // Return empty array if type is invalid
    return [];
};
exports.getAllGamesOrSportsByProviderId = getAllGamesOrSportsByProviderId;
const getAllActiveProviders = async () => {
    // --- Game Providers with active games ---
    const game_providers_list = await connection_1.db
        .select()
        .from(schema_1.game_providers)
        .where((0, drizzle_orm_1.inArray)(schema_1.game_providers.id, connection_1.db
        .select({ providerId: schema_1.games.providerId })
        .from(schema_1.games)
        .where((0, drizzle_orm_1.eq)(schema_1.games.status, "active"))));
    // --- Sports Providers with active sports ---
    const sports_providers_list = await connection_1.db
        .select()
        .from(schema_1.sports_providers)
        .where((0, drizzle_orm_1.inArray)(schema_1.sports_providers.id, connection_1.db
        .select({ providerId: schema_1.sports.providerId })
        .from(schema_1.sports)
        .where((0, drizzle_orm_1.eq)(schema_1.sports.status, "active"))));
    return {
        game_providers: game_providers_list,
        sports_providers: sports_providers_list,
    };
};
exports.getAllActiveProviders = getAllActiveProviders;
const getAllMenuProviders = async () => {
    // --- Game Providers with active games and isMenu = true ---
    const game_providers_list = await connection_1.db
        .select()
        .from(schema_1.game_providers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.game_providers.isMenu, true), (0, drizzle_orm_1.eq)(schema_1.game_providers.status, "active")))
        .orderBy(schema_1.game_providers.menuPriority);
    // --- Sports Providers with active sports and isMenu = true ---
    const sports_providers_list = await connection_1.db
        .select()
        .from(schema_1.sports_providers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports_providers.isMenu, true), (0, drizzle_orm_1.eq)(schema_1.sports_providers.status, "active")))
        .orderBy(schema_1.sports_providers.menuPriority);
    const category_menu_list = await connection_1.db
        .select()
        .from(schema_1.dropdownOptions)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.isMenu, true), (0, drizzle_orm_1.eq)(schema_1.dropdownOptions.status, "active")))
        .orderBy(schema_1.dropdownOptions.menuPriority);
    return {
        game_providers: game_providers_list,
        sports_providers: sports_providers_list,
        category_menu: category_menu_list,
    };
};
exports.getAllMenuProviders = getAllMenuProviders;
const getExclusiveGamesSports = async () => {
    // --- EXCLUSIVE GAMES ---
    const exclusiveGames = await connection_1.db
        .select()
        .from(schema_1.games)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.games.isExclusive, true), (0, drizzle_orm_1.eq)(schema_1.games.status, "active")));
    // --- EXCLUSIVE SPORTS ---
    const exclusiveSports = await connection_1.db
        .select()
        .from(schema_1.sports)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports.isExclusive, true), (0, drizzle_orm_1.eq)(schema_1.sports.status, "active")));
    return [...exclusiveGames, ...exclusiveSports];
};
exports.getExclusiveGamesSports = getExclusiveGamesSports;
