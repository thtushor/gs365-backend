"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllMenuProviders = exports.getAllSportsProviders = exports.getSportSubProviderBySportProviderId = exports.getAllGameProviders = exports.getGameSubProviderByGameProviderId = exports.getTotalCount = exports.deleteById = exports.findAdminByRefCode = exports.getPaginatedAnnouncements = exports.getPaginatedPromotions = exports.getPromotionById = exports.getPaginatedDropdownOptions = exports.getSingleDropdownOptionById = exports.getPaginatedDropdowns = exports.getDropdownById = exports.deleteAdmin = exports.updateAdmin = exports.getAdminsDetailsByReferCode = exports.getAdminsWithFilters = exports.getAdminById = exports.createAdmin = exports.findAdminByUsernameOrEmail = void 0;
exports.createPromotion = createPromotion;
exports.updatePromotion = updatePromotion;
exports.createGameProvider = createGameProvider;
exports.updateGameProvider = updateGameProvider;
exports.getGameProviderById = getGameProviderById;
exports.getPaginatedGameProviders = getPaginatedGameProviders;
exports.createGame = createGame;
exports.updateGame = updateGame;
exports.getPaginatedGameList = getPaginatedGameList;
exports.getGameDetailsById = getGameDetailsById;
exports.createSportsProvider = createSportsProvider;
exports.updateSportsProvider = updateSportsProvider;
exports.getSportsProviderById = getSportsProviderById;
exports.getPaginatedSportsProviders = getPaginatedSportsProviders;
exports.createSport = createSport;
exports.updateSport = updateSport;
exports.getPaginatedSportList = getPaginatedSportList;
exports.getSportDetailsById = getSportDetailsById;
const drizzle_orm_1 = require("drizzle-orm");
const drizzle_orm_2 = require("drizzle-orm");
const schema_1 = require("../db/schema");
const connection_1 = require("../db/connection");
const mysql_core_1 = require("drizzle-orm/mysql-core");
const sports_1 = require("../db/schema/sports");
const findAdminByUsernameOrEmail = async (usernameOrEmail) => {
    const referredAdmin = (0, mysql_core_1.alias)(schema_1.adminUsers, "referred");
    // Fetch the admin with joined tables
    const [admin] = await connection_1.db
        .select({
        admin: schema_1.adminUsers,
        country: schema_1.countries,
        currency: schema_1.currencies,
        referred: referredAdmin, // self-join to get the referred admin
        designation: schema_1.designation,
    })
        .from(schema_1.adminUsers)
        .leftJoin(schema_1.countries, (0, drizzle_orm_1.eq)(schema_1.adminUsers.country, schema_1.countries.id))
        .leftJoin(schema_1.designation, (0, drizzle_orm_1.eq)(schema_1.adminUsers.designation, schema_1.designation.id))
        .leftJoin(schema_1.currencies, (0, drizzle_orm_1.eq)(schema_1.adminUsers.currency, schema_1.currencies.id))
        .leftJoin(referredAdmin, (0, drizzle_orm_1.eq)(schema_1.adminUsers.referred_by, referredAdmin.id))
        .where((0, drizzle_orm_1.or)((0, drizzle_orm_1.eq)(schema_1.adminUsers.username, usernameOrEmail), (0, drizzle_orm_1.eq)(schema_1.adminUsers.email, usernameOrEmail), (0, drizzle_orm_1.eq)(schema_1.adminUsers.phone, usernameOrEmail)));
    if (!admin) {
        return null; // Return null if no admin found
    }
    return {
        ...admin?.admin, // spread main admin fields
        currencyInfo: admin?.currency ?? null,
        referDetails: admin?.referred ?? null,
        countryDetails: admin?.country ?? null,
        designation: admin?.designation ?? null,
    };
};
exports.findAdminByUsernameOrEmail = findAdminByUsernameOrEmail;
const createAdmin = async (data) => {
    const { maxTrx, minTrx, commission_percent, ...rest } = data;
    console.log("from this", {
        ...rest,
        commission_percent: Number(commission_percent) || 0,
        minTrx: minTrx,
        maxTrx: maxTrx,
    });
    const [admin] = await connection_1.db.insert(schema_1.adminUsers).values({
        ...rest,
        commission_percent: Number(commission_percent) || 0,
        minTrx: minTrx,
        maxTrx: maxTrx,
    });
    return admin;
};
exports.createAdmin = createAdmin;
const getAdminById = async (id) => {
    const referredAdmin = (0, mysql_core_1.alias)(schema_1.adminUsers, "referred");
    // Fetch the admin with joined tables
    const [admin] = await connection_1.db
        .select({
        admin: schema_1.adminUsers,
        country: schema_1.countries,
        currency: schema_1.currencies,
        referred: referredAdmin, // self-join to get the referred admin
        designation: schema_1.designation,
    })
        .from(schema_1.adminUsers)
        .leftJoin(schema_1.countries, (0, drizzle_orm_1.eq)(schema_1.adminUsers.country, schema_1.countries.id))
        .leftJoin(schema_1.designation, (0, drizzle_orm_1.eq)(schema_1.adminUsers.designation, schema_1.designation.id))
        .leftJoin(schema_1.currencies, (0, drizzle_orm_1.eq)(schema_1.adminUsers.currency, schema_1.currencies.id))
        .leftJoin(referredAdmin, (0, drizzle_orm_1.eq)(schema_1.adminUsers.referred_by, referredAdmin.id))
        .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, id));
    if (!admin)
        return null;
    // Map nested objects
    const currencyInfo = admin.currency ?? null;
    const referDetails = admin.referred ?? null;
    const countryDetails = admin.country ?? null;
    return {
        ...admin.admin, // spread main admin fields
        currencyInfo,
        referDetails,
        countryDetails,
        designation: admin?.designation ?? null,
    };
};
exports.getAdminById = getAdminById;
const getAdminsWithFilters = async (filters) => {
    const { role, roleList, page = 1, pageSize = 10, searchKeyword, status, designation: designationData, } = filters;
    const whereClauses = [];
    if (role)
        whereClauses.push(Array.isArray(role)
            ? role.length > 0 && (0, drizzle_orm_1.inArray)(schema_1.adminUsers.role, role)
            : (0, drizzle_orm_1.eq)(schema_1.adminUsers.role, role));
    if (roleList && roleList?.length > 0) {
        whereClauses.push((0, drizzle_orm_1.inArray)(schema_1.adminUsers.role, [...roleList]));
    }
    console.log(searchKeyword);
    if (searchKeyword) {
        const kw = `%${searchKeyword}%`;
        whereClauses.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.adminUsers.username, kw), (0, drizzle_orm_1.like)(schema_1.adminUsers.fullname, kw), (0, drizzle_orm_1.like)(schema_1.adminUsers.email, kw), (0, drizzle_orm_1.like)(schema_1.adminUsers.phone, kw)));
    }
    if (status) {
        whereClauses.push((0, drizzle_orm_1.eq)(schema_1.adminUsers.status, status));
    }
    if (designationData) {
        whereClauses.push((0, drizzle_orm_1.eq)(schema_1.adminUsers.designation, Number(designationData)));
    }
    // Filter out any falsey (e.g., false) values from whereClauses to avoid boolean in and()
    const filteredWhereClauses = whereClauses.filter((clause) => Boolean(clause));
    const where = filteredWhereClauses.length
        ? (0, drizzle_orm_1.and)(...filteredWhereClauses)
        : undefined;
    // Get total count
    const total = await connection_1.db
        .select({ count: (0, drizzle_orm_2.sql) `COUNT(*)` })
        .from(schema_1.adminUsers)
        .leftJoin(schema_1.countries, (0, drizzle_orm_1.eq)(schema_1.adminUsers.country, schema_1.countries.id))
        .leftJoin(schema_1.designation, (0, drizzle_orm_1.eq)(schema_1.adminUsers.designation, schema_1.designation.id))
        .leftJoin(schema_1.currencies, (0, drizzle_orm_1.eq)(schema_1.adminUsers.currency, schema_1.currencies.id))
        .where(where)
        .then((rows) => Number(rows[0]?.count || 0));
    // Get paginated data
    const data = await connection_1.db
        .select({
        admin: schema_1.adminUsers,
        country: schema_1.countries,
        designation: schema_1.designation,
        currency: schema_1.currencies,
    })
        .from(schema_1.adminUsers)
        .leftJoin(schema_1.countries, (0, drizzle_orm_1.eq)(schema_1.adminUsers.country, schema_1.countries.id))
        .leftJoin(schema_1.currencies, (0, drizzle_orm_1.eq)(schema_1.adminUsers.currency, schema_1.currencies.id))
        .leftJoin(schema_1.designation, (0, drizzle_orm_1.eq)(schema_1.adminUsers.designation, schema_1.designation.id))
        .where(where)
        .limit(pageSize)
        .offset((page - 1) * pageSize)
        .orderBy((0, drizzle_orm_1.desc)(schema_1.adminUsers.id));
    const totalPages = Math.ceil(total / pageSize);
    return {
        total,
        data: data.map((item) => ({
            ...item.admin,
            countryInfo: item.country ?? null,
            designationInfo: item.designation ?? null,
            currencyInfo: item.currency ?? null,
        })),
        pagination: {
            page,
            pageSize,
            totalPages,
            total,
        },
    };
};
exports.getAdminsWithFilters = getAdminsWithFilters;
const getAdminsDetailsByReferCode = async (refererCode) => {
    try {
        const [data] = await connection_1.db
            .select()
            .from(schema_1.adminUsers)
            .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.refCode, refererCode));
        return data;
    }
    catch (error) {
        console.error("Error fetching admin details by refer code:", error);
        throw new Error("Failed to fetch admin details");
    }
};
exports.getAdminsDetailsByReferCode = getAdminsDetailsByReferCode;
const updateAdmin = async (id, data) => {
    const { commission_percent, ...rest } = data;
    const dataToUpdate = { ...rest };
    if (commission_percent !== undefined) {
        dataToUpdate.commission_percent = Number(commission_percent);
    }
    console.log("Updated data is", dataToUpdate);
    await connection_1.db.update(schema_1.adminUsers).set(dataToUpdate).where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, id));
    return (0, exports.getAdminById)(id);
};
exports.updateAdmin = updateAdmin;
const deleteAdmin = async (id) => {
    const result = await connection_1.db.delete(schema_1.adminUsers).where((0, drizzle_orm_1.eq)(schema_1.adminUsers.id, id));
    return result;
};
exports.deleteAdmin = deleteAdmin;
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
        .where((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.dropdown_id, id));
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
exports.getDropdownById = getDropdownById;
const getPaginatedDropdowns = async (page, pageSize) => {
    const offset = (page - 1) * pageSize;
    const dropdownsList = await connection_1.db
        .select()
        .from(schema_1.dropdowns)
        .limit(pageSize)
        .offset(offset);
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_2.sql) `COUNT(*)`.as("count") })
        .from(schema_1.dropdowns);
    const total = Number(countResult[0].count);
    const dataWithOptions = await Promise.all(dropdownsList.map(async (dropdown) => {
        const options = await connection_1.db
            .select()
            .from(schema_1.dropdownOptions)
            .where((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.dropdown_id, dropdown.id));
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
// Get single dropdown option details
const getSingleDropdownOptionById = async (id) => {
    const [option] = await connection_1.db
        .select()
        .from(schema_1.dropdownOptions)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.id, id), (0, drizzle_orm_1.eq)(schema_1.dropdownOptions.status, "active")));
    return option || null;
};
exports.getSingleDropdownOptionById = getSingleDropdownOptionById;
// Get paginated dropdown options
const getPaginatedDropdownOptions = async (page, pageSize) => {
    const offset = (page - 1) * pageSize;
    const [countResult] = await connection_1.db
        .select({ count: (0, drizzle_orm_2.sql) `COUNT(*)`.as("count") })
        .from(schema_1.dropdownOptions);
    const total = countResult?.count ?? 0;
    const options = await connection_1.db
        .select()
        .from(schema_1.dropdownOptions)
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
exports.getPaginatedDropdownOptions = getPaginatedDropdownOptions;
async function createPromotion(promotionData) {
    const [existing] = await connection_1.db
        .select()
        .from(schema_1.promotions)
        .where((0, drizzle_orm_1.eq)(schema_1.promotions.promotionName, promotionData.promotionName));
    if (existing) {
        throw new Error("DUPLICATE_PROMOTION");
    }
    const typeIds = Array.isArray(promotionData.promotionTypeId)
        ? promotionData.promotionTypeId
        : [promotionData.promotionTypeId];
    const validOptions = await connection_1.db
        .select()
        .from(schema_1.dropdownOptions)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.dropdownOptions.id, typeIds), (0, drizzle_orm_1.eq)(schema_1.dropdownOptions.status, "active")));
    if (validOptions.length !== typeIds.length) {
        throw new Error("INVALID_PROMOTION_TYPE");
    }
    await connection_1.db.insert(schema_1.promotions).values({
        ...promotionData,
        promotionTypeId: typeIds, // save as array (JSON)
        status: promotionData.status || "inactive",
        minimumDepositAmount: promotionData.minimumDepositAmount.toFixed(2),
        maximumDepositAmount: promotionData.maximumDepositAmount.toFixed(2),
    });
    return true;
}
async function updatePromotion(id, promotionData) {
    const [existing] = await connection_1.db
        .select()
        .from(schema_1.promotions)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.promotions.promotionName, promotionData.promotionName), (0, drizzle_orm_1.ne)(schema_1.promotions.id, id)));
    if (existing) {
        throw new Error("DUPLICATE_PROMOTION");
    }
    const typeIds = Array.isArray(promotionData.promotionTypeId)
        ? promotionData.promotionTypeId
        : [promotionData.promotionTypeId];
    const validOptions = await connection_1.db
        .select()
        .from(schema_1.dropdownOptions)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.inArray)(schema_1.dropdownOptions.id, typeIds), (0, drizzle_orm_1.eq)(schema_1.dropdownOptions.status, "active")));
    if (validOptions.length !== typeIds.length) {
        throw new Error("INVALID_PROMOTION_TYPE");
    }
    await connection_1.db
        .update(schema_1.promotions)
        .set({
        ...promotionData,
        promotionTypeId: typeIds, // store array
        status: promotionData.status || "inactive",
        minimumDepositAmount: promotionData.minimumDepositAmount.toFixed(2),
        maximumDepositAmount: promotionData.maximumDepositAmount.toFixed(2),
    })
        .where((0, drizzle_orm_1.eq)(schema_1.promotions.id, id));
    return true;
}
const getPromotionById = async (id) => {
    const [promotion] = await connection_1.db
        .select()
        .from(schema_1.promotions)
        .where((0, drizzle_orm_1.eq)(schema_1.promotions.id, id));
    if (!promotion)
        return null;
    const typeIds = Array.isArray(promotion.promotionTypeId)
        ? promotion.promotionTypeId
        : [];
    const fullTypeData = await connection_1.db
        .select()
        .from(schema_1.dropdownOptions)
        .where((0, drizzle_orm_1.inArray)(schema_1.dropdownOptions.id, typeIds));
    return {
        ...promotion,
        promotionType: {
            id: typeIds,
            data: fullTypeData,
        },
    };
};
exports.getPromotionById = getPromotionById;
const getPaginatedPromotions = async (page, pageSize, name, statusFilter) => {
    const offset = (page - 1) * pageSize;
    const whereClauses = [];
    if (name) {
        const kw = `%${name}%`;
        whereClauses.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.promotions.promotionName, kw)));
    }
    if (statusFilter) {
        whereClauses.push((0, drizzle_orm_1.eq)(schema_1.promotions.status, statusFilter));
    }
    const filteredWhereClauses = whereClauses.filter((clause) => Boolean(clause));
    const where = filteredWhereClauses.length
        ? (0, drizzle_orm_1.and)(...filteredWhereClauses)
        : undefined;
    // Step 1: Get paginated promotions
    const rows = await connection_1.db
        .select()
        .from(schema_1.promotions)
        .limit(pageSize)
        .where(where)
        .offset(offset);
    // Step 2: Get total count
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_2.sql) `COUNT(*)`.as("count") })
        .from(schema_1.promotions);
    const total = Number(countResult[0].count);
    // Step 3: Extract all typeIds (flattened)
    const allTypeIds = Array.from(new Set(rows.flatMap((row) => Array.isArray(row.promotionTypeId) ? row.promotionTypeId : [])));
    // Step 4: Get full dropdownOption data for all involved typeIds
    const dropdownOptionMap = {};
    if (allTypeIds.length > 0) {
        const optionRows = await connection_1.db
            .select()
            .from(schema_1.dropdownOptions)
            .where((0, drizzle_orm_1.inArray)(schema_1.dropdownOptions.id, allTypeIds));
        for (const opt of optionRows) {
            dropdownOptionMap[opt.id] = opt;
        }
    }
    // Step 5: Map result to match frontend expectations
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
exports.getPaginatedPromotions = getPaginatedPromotions;
const getPaginatedAnnouncements = async (page, pageSize) => {
    const offset = (page - 1) * pageSize;
    const rows = await connection_1.db
        .select()
        .from(schema_1.announcements)
        .orderBy((0, drizzle_orm_1.desc)(schema_1.announcements.createdAt))
        .limit(pageSize)
        .offset(offset);
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_2.sql) `COUNT(*)`.as("count") })
        .from(schema_1.promotions);
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
exports.getPaginatedAnnouncements = getPaginatedAnnouncements;
const findAdminByRefCode = async (refCode) => {
    const [admin] = await connection_1.db
        .select()
        .from(schema_1.adminUsers)
        .where((0, drizzle_orm_1.eq)(schema_1.adminUsers.refCode, refCode));
    return admin;
};
exports.findAdminByRefCode = findAdminByRefCode;
// shared delete logic
const deleteById = async (table, id) => {
    // Check if record exists
    const record = await connection_1.db.select().from(table).where((0, drizzle_orm_1.eq)(table.id, id));
    if (record.length === 0) {
        return {
            success: false,
            message: "Record not found.",
        };
    }
    // Proceed with deletion
    await connection_1.db.delete(table).where((0, drizzle_orm_1.eq)(table.id, id));
    return {
        success: true,
        message: "Record deleted successfully.",
    };
};
exports.deleteById = deleteById;
const getTotalCount = async (table) => {
    const result = await connection_1.db
        .select({ count: (0, drizzle_orm_2.sql) `COUNT(*)`.as("count") })
        .from(table);
    return Number(result[0].count);
};
exports.getTotalCount = getTotalCount;
async function createGameProvider(data) {
    const [existing] = await connection_1.db
        .select()
        .from(schema_1.game_providers)
        .where((0, drizzle_orm_1.eq)(schema_1.game_providers.name, data.name));
    if (existing) {
        throw new Error("DUPLICATE_NAME");
    }
    await connection_1.db.insert(schema_1.game_providers).values(data);
}
async function updateGameProvider(id, data) {
    const [existing] = await connection_1.db
        .select()
        .from(schema_1.game_providers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.game_providers.name, data.name), (0, drizzle_orm_1.ne)(schema_1.game_providers.id, id)));
    if (existing) {
        throw new Error("DUPLICATE_NAME");
    }
    await connection_1.db.update(schema_1.game_providers).set(data).where((0, drizzle_orm_1.eq)(schema_1.game_providers.id, id));
}
async function getGameProviderById(id) {
    const [provider] = await connection_1.db
        .select()
        .from(schema_1.game_providers)
        .where((0, drizzle_orm_1.eq)(schema_1.game_providers.id, id));
    return provider || null;
}
async function getPaginatedGameProviders(page, pageSize, parentId, name, statusFilter) {
    const offset = (page - 1) * pageSize;
    const whereClauses = [];
    if (name) {
        const kw = `%${name}%`;
        whereClauses.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.game_providers.name, kw)));
    }
    if (statusFilter) {
        whereClauses.push((0, drizzle_orm_1.eq)(schema_1.game_providers.status, statusFilter));
    }
    if (parentId) {
        whereClauses.push((0, drizzle_orm_1.eq)(schema_1.game_providers.parentId, parentId));
    }
    const filteredWhereClauses = whereClauses.filter((clause) => Boolean(clause));
    const where = filteredWhereClauses.length
        ? (0, drizzle_orm_1.and)(...filteredWhereClauses)
        : undefined;
    const rows = await connection_1.db
        .select()
        .from(schema_1.game_providers)
        .where(where)
        .limit(pageSize)
        .offset(offset);
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_2.sql) `COUNT(*)`.as("count") })
        .from(schema_1.game_providers);
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
const getGameSubProviderByGameProviderId = async (parentId) => {
    const whereClause = parentId
        ? (0, drizzle_orm_1.eq)(schema_1.game_providers.parentId, parentId)
        : undefined;
    const providers = await connection_1.db.select().from(schema_1.game_providers).where(whereClause);
    return providers;
};
exports.getGameSubProviderByGameProviderId = getGameSubProviderByGameProviderId;
const getAllGameProviders = async (isParent) => {
    const providers = isParent === true
        ? await connection_1.db
            .select()
            .from(schema_1.game_providers)
            .where((0, drizzle_orm_1.isNull)(schema_1.game_providers.parentId))
        : await connection_1.db.select().from(schema_1.game_providers);
    return providers;
};
exports.getAllGameProviders = getAllGameProviders;
// game
async function createGame(data) {
    const [existing] = await connection_1.db
        .select()
        .from(schema_1.games)
        .where((0, drizzle_orm_1.eq)(schema_1.games.name, data.name));
    if (existing) {
        throw new Error("DUPLICATE_NAME");
    }
    await connection_1.db.insert(schema_1.games).values(data);
}
async function updateGame(id, data) {
    const [existing] = await connection_1.db
        .select()
        .from(schema_1.games)
        .where((0, drizzle_orm_1.eq)(schema_1.games.name, data.name));
    if (existing && existing.id !== id) {
        throw new Error("DUPLICATE_NAME");
    }
    await connection_1.db.update(schema_1.games).set(data).where((0, drizzle_orm_1.eq)(schema_1.games.id, id));
}
async function getPaginatedGameList(page, pageSize, name, statusFilter) {
    const offset = (page - 1) * pageSize;
    const whereClauses = [];
    if (name) {
        const kw = `%${name}%`;
        whereClauses.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.games.name, kw)));
    }
    if (statusFilter) {
        whereClauses.push((0, drizzle_orm_1.eq)(schema_1.games.status, statusFilter));
    }
    const filteredWhereClauses = whereClauses.filter((clause) => Boolean(clause));
    const where = filteredWhereClauses.length
        ? (0, drizzle_orm_1.and)(...filteredWhereClauses)
        : undefined;
    const rows = await connection_1.db
        .select({
        // Flatten game fields
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
        // Join info
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.game_providers,
    })
        .from(schema_1.games)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.games.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.game_providers, (0, drizzle_orm_1.eq)(schema_1.games.providerId, schema_1.game_providers.id))
        .where(where)
        .limit(pageSize)
        .offset(offset);
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_2.sql) `COUNT(*)`.as("count") })
        .from(schema_1.games);
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
async function getGameDetailsById(gameId) {
    const result = await connection_1.db
        .select({
        // Flatten game fields
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
        // Join info
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.game_providers,
    })
        .from(schema_1.games)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.games.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.game_providers, (0, drizzle_orm_1.eq)(schema_1.games.providerId, schema_1.game_providers.id))
        .where((0, drizzle_orm_1.eq)(schema_1.games.id, gameId));
    return result[0]; // full info
}
// sports provider
async function createSportsProvider(data) {
    const [existing] = await connection_1.db
        .select()
        .from(schema_1.sports_providers)
        .where((0, drizzle_orm_1.eq)(schema_1.sports_providers.name, data.name));
    if (existing) {
        throw new Error("DUPLICATE_NAME");
    }
    await connection_1.db.insert(schema_1.sports_providers).values(data);
}
async function updateSportsProvider(id, data) {
    const [existing] = await connection_1.db
        .select()
        .from(schema_1.sports_providers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports_providers.name, data.name), (0, drizzle_orm_1.ne)(schema_1.sports_providers.id, id)));
    if (existing) {
        throw new Error("DUPLICATE_NAME");
    }
    await connection_1.db
        .update(schema_1.sports_providers)
        .set(data)
        .where((0, drizzle_orm_1.eq)(schema_1.sports_providers.id, id));
}
async function getSportsProviderById(id) {
    const [provider] = await connection_1.db
        .select()
        .from(schema_1.sports_providers)
        .where((0, drizzle_orm_1.eq)(schema_1.sports_providers.id, id));
    return provider || null;
}
const getSportSubProviderBySportProviderId = async (parentId) => {
    const whereClause = parentId
        ? (0, drizzle_orm_1.eq)(schema_1.sports_providers.parentId, parentId)
        : undefined;
    const providers = await connection_1.db.select().from(schema_1.sports_providers).where(whereClause);
    return providers;
};
exports.getSportSubProviderBySportProviderId = getSportSubProviderBySportProviderId;
async function getPaginatedSportsProviders(page, pageSize, parentId, name, statusFilter) {
    const offset = (page - 1) * pageSize;
    const whereClauses = [];
    if (name) {
        const kw = `%${name}%`;
        whereClauses.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(schema_1.sports_providers.name, kw)));
    }
    if (statusFilter) {
        whereClauses.push((0, drizzle_orm_1.eq)(schema_1.sports_providers.status, statusFilter));
    }
    if (parentId) {
        whereClauses.push((0, drizzle_orm_1.eq)(schema_1.sports_providers.parentId, parentId));
    }
    const filteredWhereClauses = whereClauses.filter((clause) => Boolean(clause));
    const where = filteredWhereClauses.length
        ? (0, drizzle_orm_1.and)(...filteredWhereClauses)
        : undefined;
    const rows = await connection_1.db
        .select()
        .from(schema_1.sports_providers)
        .where(where)
        .limit(pageSize)
        .offset(offset);
    const countResult = await connection_1.db
        .select({ count: (0, drizzle_orm_2.sql) `COUNT(*)`.as("count") })
        .from(schema_1.sports_providers);
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
const getAllSportsProviders = async (isParent) => {
    const providers = isParent === true
        ? await connection_1.db
            .select()
            .from(schema_1.sports_providers)
            .where((0, drizzle_orm_1.isNull)(schema_1.sports_providers.parentId))
        : await connection_1.db.select().from(schema_1.sports_providers);
    return providers;
};
exports.getAllSportsProviders = getAllSportsProviders;
// sport
async function createSport(data) {
    const [existing] = await connection_1.db
        .select()
        .from(sports_1.sports)
        .where((0, drizzle_orm_1.eq)(sports_1.sports.name, data.name));
    if (existing) {
        throw new Error("DUPLICATE_NAME");
    }
    console.log(data);
    await connection_1.db.insert(sports_1.sports).values(data);
}
async function updateSport(id, data) {
    const [existing] = await connection_1.db
        .select()
        .from(sports_1.sports)
        .where((0, drizzle_orm_1.eq)(sports_1.sports.name, data.name));
    if (existing && existing.id !== id) {
        throw new Error("DUPLICATE_NAME");
    }
    await connection_1.db.update(sports_1.sports).set(data).where((0, drizzle_orm_1.eq)(sports_1.sports.id, id));
}
async function getPaginatedSportList(page, pageSize, publicList, name, statusFilter) {
    const offset = (page - 1) * pageSize;
    const whereClauses = [];
    if (name) {
        const kw = `%${name}%`;
        whereClauses.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(sports_1.sports.name, kw)));
    }
    if (statusFilter) {
        whereClauses.push((0, drizzle_orm_1.eq)(sports_1.sports.status, statusFilter));
    }
    const filteredWhereClauses = whereClauses.filter((clause) => Boolean(clause));
    const where = filteredWhereClauses.length
        ? (0, drizzle_orm_1.and)(...filteredWhereClauses)
        : undefined;
    // Base query
    const query = connection_1.db
        .select({
        id: sports_1.sports.id,
        name: sports_1.sports.name,
        parentId: sports_1.sports.parentId,
        status: sports_1.sports.status,
        isFavorite: sports_1.sports.isFavorite,
        isExclusive: sports_1.sports.isExclusive,
        apiKey: sports_1.sports.apiKey,
        licenseKey: sports_1.sports.licenseKey,
        sportLogo: sports_1.sports.sportLogo,
        secretPin: sports_1.sports.secretPin,
        sportUrl: sports_1.sports.sportUrl,
        ggrPercent: sports_1.sports.ggrPercent,
        categoryId: sports_1.sports.categoryId,
        providerId: sports_1.sports.providerId,
        createdBy: sports_1.sports.createdBy,
        createdAt: sports_1.sports.createdAt,
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.sports_providers,
    })
        .from(sports_1.sports)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(sports_1.sports.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.sports_providers, (0, drizzle_orm_1.eq)(sports_1.sports.providerId, schema_1.sports_providers.id))
        .where(where);
    // Execute query with or without pagination
    const rows = publicList
        ? await query
        : await query.limit(pageSize).offset(offset);
    // Count total rows (skip if publicList is true)
    const total = publicList
        ? rows.length
        : Number((await connection_1.db
            .select({ count: (0, drizzle_orm_2.sql) `COUNT(*)`.as("count") })
            .from(sports_1.sports)
            .where(where))[0].count);
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
async function getSportDetailsById(id) {
    const [sport] = await connection_1.db
        .select({
        // Flatten sports fields
        id: sports_1.sports.id,
        name: sports_1.sports.name,
        parentId: sports_1.sports.parentId,
        status: sports_1.sports.status,
        isFavorite: sports_1.sports.isFavorite,
        isExclusive: sports_1.sports.isExclusive,
        apiKey: sports_1.sports.apiKey,
        licenseKey: sports_1.sports.licenseKey,
        sportLogo: sports_1.sports.sportLogo,
        secretPin: sports_1.sports.secretPin,
        sportUrl: sports_1.sports.sportUrl,
        ggrPercent: sports_1.sports.ggrPercent,
        categoryId: sports_1.sports.categoryId,
        providerId: sports_1.sports.providerId,
        createdBy: sports_1.sports.createdBy,
        createdAt: sports_1.sports.createdAt,
        // Join info
        categoryInfo: schema_1.dropdownOptions,
        providerInfo: schema_1.game_providers,
    })
        .from(sports_1.sports)
        .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(sports_1.sports.categoryId, schema_1.dropdownOptions.id))
        .leftJoin(schema_1.game_providers, (0, drizzle_orm_1.eq)(sports_1.sports.providerId, schema_1.game_providers.id))
        .where((0, drizzle_orm_1.eq)(sports_1.sports.id, id));
    if (!sport)
        return null;
    return {
        ...sport,
        categoryInfo: sport.categoryInfo || null,
        providerInfo: sport.providerInfo || null,
    };
}
const getAllMenuProviders = async () => {
    // --- Game Providers with active games and isMenu = true ---
    const game_providers_list = await connection_1.db
        .select()
        .from(schema_1.game_providers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.game_providers.isMenu, true)))
        .orderBy(schema_1.game_providers.menuPriority);
    // --- Sports Providers with active sports and isMenu = true ---
    const sports_providers_list = await connection_1.db
        .select()
        .from(schema_1.sports_providers)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.sports_providers.isMenu, true)))
        .orderBy(schema_1.sports_providers.menuPriority);
    const category_menu_list = await connection_1.db
        .select()
        .from(schema_1.dropdownOptions)
        .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.dropdownOptions.isMenu, true)))
        .orderBy(schema_1.dropdownOptions.menuPriority);
    return {
        game_providers: game_providers_list,
        sports_providers: sports_providers_list,
        category_menu: category_menu_list,
    };
};
exports.getAllMenuProviders = getAllMenuProviders;
