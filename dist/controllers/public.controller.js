"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPublicSocial = exports.getFeaturedGame = exports.getAllPublicEvents = exports.getAllExclusiveGamesSportsList = exports.getAllGamesByCategoryID = exports.getMenuProviders = exports.getAllActiveProviderList = exports.getSportsAndGames = exports.getProviderAndCategory = exports.getSportList = exports.getGameList = exports.getProvidersByCategory = exports.getActiveCategories = exports.getActiveUtils = exports.getActiveResponsibleGaming = exports.getActiveGamingLicenses = exports.getActiveAmbassador = exports.getActiveSponsor = exports.getActiveVideoAdvertisement = exports.getAllWebsiteFaqCollections = exports.getActivePopup = exports.getActiveAnnouncement = exports.getPublicActiveBannerImages = exports.getPublicPromotionList = void 0;
const public_model_1 = require("../models/public.model");
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const getPublicPromotionList = async (req, res) => {
    try {
        const { id, page = 1, pageSize = 500 } = req.query;
        const promotionId = id ? Number(id) : undefined;
        if (promotionId) {
            const promotion = await (0, public_model_1.getPublicPromotionById)(promotionId);
            if (!promotion) {
                return res.status(404).json({
                    status: false,
                    message: "Promotion not found.",
                });
            }
            return res.status(200).json({
                status: true,
                message: "Promotion fetched successfully.",
                data: promotion,
            });
        }
        const result = await (0, public_model_1.getPublicPaginatedPromotions)(Number(page), Number(pageSize));
        return res.status(200).json({
            status: true,
            message: "Promotion fetched successfully.",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching promotion:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getPublicPromotionList = getPublicPromotionList;
// her banner public api
const getPublicActiveBannerImages = async (req, res) => {
    try {
        const result = await connection_1.db
            .select()
            .from(schema_1.banners)
            .where((0, drizzle_orm_1.eq)(schema_1.banners.status, "active"))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.banners.id));
        const allImages = result.flatMap((banner) => {
            try {
                const images = JSON.parse(banner.images);
                return Array.isArray(images) ? images : [];
            }
            catch {
                return [];
            }
        });
        return res.status(200).json({
            status: true,
            data: allImages, // just the images
            message: "Active banner images fetched successfully.",
        });
    }
    catch (error) {
        console.error("getActiveBannerImages error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getPublicActiveBannerImages = getPublicActiveBannerImages;
const getActiveAnnouncement = async (req, res) => {
    try {
        const activeAnnouncement = await connection_1.db
            .select()
            .from(schema_1.announcements)
            .where((0, drizzle_orm_1.eq)(schema_1.announcements.status, "active"))
            .limit(1);
        if (activeAnnouncement.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No active announcement found.",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Active announcement fetched successfully.",
            data: activeAnnouncement[0],
        });
    }
    catch (error) {
        console.error("Error fetching active announcement:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getActiveAnnouncement = getActiveAnnouncement;
const getActivePopup = async (req, res) => {
    try {
        const activePopup = await connection_1.db
            .select()
            .from(schema_1.website_popups)
            .where((0, drizzle_orm_1.eq)(schema_1.website_popups.status, "active"))
            .limit(1);
        if (activePopup.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No active popup found.",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Active popup fetched successfully.",
            data: activePopup[0],
        });
    }
    catch (error) {
        console.error("Error fetching active popup:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getActivePopup = getActivePopup;
const getAllWebsiteFaqCollections = async (req, res) => {
    function getRandomColor() {
        const colors = ["#FF5733", "#33FF57", "#3357FF", "#FFC300", "#8E44AD"];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    try {
        // Fetch only active FAQs with their category info
        const rows = await connection_1.db
            .select({
            id: schema_1.faqs.id,
            category: schema_1.dropdownOptions.title,
            dropdownOptionsId: schema_1.faqs.dropdownOptionsId,
            title: schema_1.faqs.title,
            createdAt: schema_1.faqs.createdAt,
            status: schema_1.faqs.status,
            message: schema_1.faqs.message,
        })
            .from(schema_1.faqs)
            .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.dropdownOptions.id, schema_1.faqs.dropdownOptionsId))
            .where((0, drizzle_orm_1.eq)(schema_1.faqs.status, "active"))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.faqs.id));
        // Group by category
        const collectionsMap = {};
        for (const row of rows) {
            if (!row.category || !row.dropdownOptionsId)
                continue;
            if (!collectionsMap[row.dropdownOptionsId]) {
                collectionsMap[row.dropdownOptionsId] = {
                    id: row.dropdownOptionsId,
                    title: row.category,
                    articles: 0,
                    icon: "❓", // ✅ fixed question mark
                    color: getRandomColor(),
                    questions: [],
                };
            }
            collectionsMap[row.dropdownOptionsId].articles += 1;
            collectionsMap[row.dropdownOptionsId].questions.push({
                id: row.id, // ✅ faq id as question id
                question: row.title,
                answer: row.message,
            });
        }
        const collections = Object.values(collectionsMap);
        return res.status(200).json({
            status: true,
            message: "Active FAQ collections fetched successfully.",
            data: collections,
        });
    }
    catch (error) {
        console.error("Error fetching faq collections:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllWebsiteFaqCollections = getAllWebsiteFaqCollections;
const getActiveVideoAdvertisement = async (req, res) => {
    try {
        const activeAdvertisement = await connection_1.db
            .select()
            .from(schema_1.video_advertisement)
            .where((0, drizzle_orm_1.eq)(schema_1.video_advertisement.status, "active"))
            .limit(1);
        if (activeAdvertisement.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No active advertisement found.",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Advertisements fetched successfully.",
            data: activeAdvertisement[0],
        });
    }
    catch (error) {
        console.error("Error fetching active advertisement:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getActiveVideoAdvertisement = getActiveVideoAdvertisement;
const getActiveSponsor = async (req, res) => {
    try {
        const activeSponsor = await connection_1.db
            .select()
            .from(schema_1.sponsors)
            .where((0, drizzle_orm_1.eq)(schema_1.sponsors.status, "active"));
        if (activeSponsor.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No active sponsors found.",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Sponsors fetched successfully.",
            data: activeSponsor,
        });
    }
    catch (error) {
        console.error("Error fetching active sponsors:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getActiveSponsor = getActiveSponsor;
const getActiveAmbassador = async (req, res) => {
    try {
        const activeAmbassador = await connection_1.db
            .select()
            .from(schema_1.ambassadors)
            .where((0, drizzle_orm_1.eq)(schema_1.ambassadors.status, "active"));
        if (activeAmbassador.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No active ambassador found.",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Ambassadors fetched successfully.",
            data: activeAmbassador,
        });
    }
    catch (error) {
        console.error("Error fetching active ambassadors:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getActiveAmbassador = getActiveAmbassador;
const getActiveGamingLicenses = async (req, res) => {
    try {
        const activeGamingLicense = await connection_1.db
            .select()
            .from(schema_1.gamingLicenses)
            .where((0, drizzle_orm_1.eq)(schema_1.gamingLicenses.status, "active"));
        if (activeGamingLicense.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No active gaming license found.",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Gaming license fetched successfully.",
            data: activeGamingLicense,
        });
    }
    catch (error) {
        console.error("Error fetching active gaming license:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getActiveGamingLicenses = getActiveGamingLicenses;
const getActiveResponsibleGaming = async (req, res) => {
    try {
        const activeResponsibleGaming = await connection_1.db
            .select()
            .from(schema_1.responsibleGaming)
            .where((0, drizzle_orm_1.eq)(schema_1.responsibleGaming.status, "active"));
        if (activeResponsibleGaming.length === 0) {
            return res.status(404).json({
                status: false,
                message: "No active responsible gaming found.",
            });
        }
        return res.status(200).json({
            status: true,
            message: "Responsible gaming license fetched successfully.",
            data: activeResponsibleGaming,
        });
    }
    catch (error) {
        console.error("Error fetching active responsible gaming:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getActiveResponsibleGaming = getActiveResponsibleGaming;
const getActiveUtils = async (req, res) => {
    try {
        const [popup, responsible_gamings, bannersData, announcementData, advertisement, sponsorsData, ambassadorData, gamingLicensesData,] = await Promise.all([
            connection_1.db
                .select()
                .from(schema_1.website_popups)
                .where((0, drizzle_orm_1.eq)(schema_1.website_popups.status, "active"))
                .limit(1),
            connection_1.db
                .select()
                .from(schema_1.responsibleGaming)
                .where((0, drizzle_orm_1.eq)(schema_1.responsibleGaming.status, "active")),
            connection_1.db
                .select()
                .from(schema_1.banners)
                .where((0, drizzle_orm_1.eq)(schema_1.banners.status, "active"))
                .orderBy((0, drizzle_orm_1.desc)(schema_1.banners.id)),
            connection_1.db
                .select()
                .from(schema_1.announcements)
                .where((0, drizzle_orm_1.eq)(schema_1.announcements.status, "active"))
                .limit(1),
            connection_1.db
                .select()
                .from(schema_1.video_advertisement)
                .where((0, drizzle_orm_1.eq)(schema_1.video_advertisement.status, "active"))
                .limit(1),
            connection_1.db.select().from(schema_1.sponsors).where((0, drizzle_orm_1.eq)(schema_1.sponsors.status, "active")),
            connection_1.db.select().from(schema_1.ambassadors).where((0, drizzle_orm_1.eq)(schema_1.ambassadors.status, "active")),
            connection_1.db
                .select()
                .from(schema_1.gamingLicenses)
                .where((0, drizzle_orm_1.eq)(schema_1.gamingLicenses.status, "active")),
        ]);
        // parse images in banners
        const banner_images = bannersData.flatMap((banner) => {
            try {
                const images = JSON.parse(banner.images);
                return Array.isArray(images) ? images : [];
            }
            catch {
                return [];
            }
        });
        return res.status(200).json({
            status: true,
            message: "All active utils fetched successfully.",
            data: {
                popup: popup[0] || null,
                responsible_gamings,
                banners: banner_images,
                announcement: announcementData[0] || null,
                advertisement: advertisement[0] || null,
                sponsors: sponsorsData,
                ambassador: ambassadorData,
                gaming_licenses: gamingLicensesData,
            },
        });
    }
    catch (error) {
        console.error("Error fetching active utils:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getActiveUtils = getActiveUtils;
const getActiveCategories = async (req, res) => {
    try {
        const { id, page = 1, pageSize = 10, isPaginate = false } = req.query;
        const dropdownId = id ? Number(id) : undefined;
        if (dropdownId) {
            const dropdown = await (0, public_model_1.getDropdownById)(dropdownId);
            if (!dropdown) {
                return res.status(404).json({
                    status: false,
                    message: "Dropdown not found.",
                });
            }
            return res.status(200).json({
                status: true,
                message: "Dropdown fetched successfully.",
                data: dropdown,
            });
        }
        if (!isPaginate) {
            const data = await (0, public_model_1.getAllDropdowns)();
            return res.status(200).json({
                status: true,
                message: "Dropdowns fetched successfully.",
                data,
            });
        }
        const result = await (0, public_model_1.getPaginatedDropdowns)(Number(page), Number(pageSize));
        return res.status(200).json({
            status: true,
            message: "Dropdowns fetched successfully.",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching dropdowns:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getActiveCategories = getActiveCategories;
const getProvidersByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params; // <-- use params
        // console.log("category id", categoryId);
        if (!categoryId) {
            return res.status(400).json({
                status: false,
                message: "categoryId is required",
            });
        }
        if (categoryId === "exclusive") {
            const exclusiveGames = await (0, public_model_1.getAllProvidersByCategoryId)(categoryId);
            return res.status(200).json({
                status: true,
                message: "Exclusive games fetched successfully.",
                data: exclusiveGames,
            });
        }
        const providers = await (0, public_model_1.getAllProvidersByCategoryId)(Number(categoryId));
        return res.status(200).json({
            status: true,
            message: "Providers fetched successfully.",
            data: providers,
        });
    }
    catch (error) {
        console.error("Error fetching providers by category:", error);
        return res.status(500).json({
            status: false,
            message: "Internal server error",
        });
    }
};
exports.getProvidersByCategory = getProvidersByCategory;
const getGameList = async (req, res) => {
    try {
        const { id, page = 1, pageSize = 10, categoryId } = req.query;
        const gameId = id ? Number(id) : undefined;
        if (gameId) {
            const gameDetails = await (0, public_model_1.getGameDetailsById)(gameId);
            if (!gameDetails) {
                return res.status(404).json({
                    status: false,
                    message: "Game not found.",
                });
            }
            return res.status(200).json({
                status: true,
                message: "Game details fetched successfully.",
                data: gameDetails,
            });
        }
        if (categoryId) {
            const result = await (0, public_model_1.getPaginatedCategoryWiseGameList)(Number(page), Number(pageSize), Number(categoryId));
            return res.status(200).json({
                status: true,
                message: "Category wise game list fetched successfully.",
                data: result.data,
                pagination: result.pagination,
            });
        }
        const result = await (0, public_model_1.getPaginatedGameList)(Number(page), Number(pageSize));
        return res.status(200).json({
            status: true,
            message: "All game list fetched successfully.",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching game list:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getGameList = getGameList;
const getSportList = async (req, res) => {
    try {
        const { id, page = 1, pageSize = 10, categoryId } = req.query;
        const gameId = id ? Number(id) : undefined;
        if (gameId) {
            const gameDetails = await (0, public_model_1.getSportDetailsById)(gameId);
            if (!gameDetails) {
                return res.status(404).json({
                    status: false,
                    message: "Game not found.",
                });
            }
            return res.status(200).json({
                status: true,
                message: "Game details fetched successfully.",
                data: gameDetails,
            });
        }
        if (categoryId) {
            const result = await (0, public_model_1.getPaginatedCategoryWiseSportList)(Number(page), Number(pageSize), Number(categoryId));
            return res.status(200).json({
                status: true,
                message: "Category wise game list fetched successfully.",
                data: result.data,
                pagination: result.pagination,
            });
        }
        const result = await (0, public_model_1.getPaginatedSportList)(Number(page), Number(pageSize));
        return res.status(200).json({
            status: true,
            message: "All game list fetched successfully.",
            data: result.data,
            pagination: result.pagination,
        });
    }
    catch (error) {
        console.error("Error fetching game list:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getSportList = getSportList;
const getProviderAndCategory = async (req, res) => {
    try {
        const { categoryId, providerId, type } = req.query;
        // validate type
        if (type !== "games" && type !== "sports") {
            return res.status(400).json({
                status: false,
                message: "Invalid type. Must be 'games' or 'sports'.",
            });
        }
        if (!providerId) {
            return res.status(400).json({
                status: false,
                message: "Invalid category or provider id.",
            });
        }
        const result = await (0, public_model_1.getGameOrSportListBasedOnCategoryAndProvider)(type, Number(providerId), categoryId ? Number(categoryId) : undefined);
        return res.status(200).json({
            status: true,
            message: "Category wise game list fetched successfully.",
            data: result.data,
        });
    }
    catch (error) {
        console.error("Error fetching game list:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getProviderAndCategory = getProviderAndCategory;
const getSportsAndGames = async (req, res) => {
    try {
        const { categoryId, providerId, type } = req.query;
        const providerIdNum = Number(providerId);
        const categoryIdNum = categoryId ? Number(categoryId) : undefined;
        const typeValidate = type === "games" || type === "sports" ? type : undefined;
        if (!providerIdNum) {
            return res.status(400).json({
                status: false,
                message: "Invalid category or provider id.",
            });
        }
        if (!categoryIdNum && providerIdNum) {
            console.log("fetch this man");
            if (typeValidate) {
                const result = await (0, public_model_1.getAllGamesOrSportsByProviderId)(Number(providerId), typeValidate);
                return res.status(200).json({
                    status: true,
                    message: "games and sports list fetched successfully.",
                    data: result,
                });
            }
            return res.status(400).json({
                status: false,
                message: "Invalid provider type.",
            });
        }
        const result = await (0, public_model_1.getAllGamesOrSports)(Number(providerId), Number(categoryId));
        return res.status(200).json({
            status: true,
            message: "games and sports list fetched successfully.",
            data: result,
        });
    }
    catch (error) {
        console.error("Error fetching game and sports list:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getSportsAndGames = getSportsAndGames;
const getAllActiveProviderList = async (req, res) => {
    try {
        const result = await (0, public_model_1.getAllActiveProviders)();
        return res.status(200).json({
            status: true,
            message: "games and sports provider list fetched successfully.",
            data: result,
        });
    }
    catch (error) {
        console.error("Error fetching game and sports provider list:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getAllActiveProviderList = getAllActiveProviderList;
const getMenuProviders = async (req, res) => {
    try {
        const result = await (0, public_model_1.getAllMenuProviders)();
        return res.status(200).json({
            status: true,
            message: "Menu providers fetched successfully.",
            data: result,
        });
    }
    catch (error) {
        console.error("Error fetching menu providers:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getMenuProviders = getMenuProviders;
const getAllGamesByCategoryID = async (req, res) => {
    try {
        const { categoryId } = req.query;
        if (!categoryId) {
            return res.status(400).json({
                status: false,
                message: "Invalid category ID.",
            });
        }
        const result = await (0, public_model_1.getAllGamesOrSportsByCategoryID)(Number(categoryId));
        return res.status(200).json({
            status: true,
            message: "Games & Sports fetched successfully.",
            data: result,
        });
    }
    catch (error) {
        console.error("Error fetching games & sports:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getAllGamesByCategoryID = getAllGamesByCategoryID;
const getAllExclusiveGamesSportsList = async (req, res) => {
    try {
        const result = await (0, public_model_1.getExclusiveGamesSports)();
        return res.status(200).json({
            status: true,
            message: "exclusive games and sports list fetched successfully.",
            data: result,
        });
    }
    catch (error) {
        console.error("Error fetching exclusive game and sports list:", error);
        return res.status(500).json({
            status: false,
            message: "Server error",
        });
    }
};
exports.getAllExclusiveGamesSportsList = getAllExclusiveGamesSportsList;
const getAllPublicEvents = async (req, res) => {
    try {
        const result = await connection_1.db
            .select({
            id: schema_1.events.id,
            title: schema_1.events.title,
            sportId: schema_1.events.sportId,
            images: schema_1.events.images,
            createdAt: schema_1.events.createdAt,
            status: schema_1.events.status,
            sport: schema_1.sports,
            categoryInfo: schema_1.dropdownOptions,
            providerInfo: schema_1.sports_providers,
        })
            .from(schema_1.events)
            .leftJoin(schema_1.sports, (0, drizzle_orm_1.eq)(schema_1.events.sportId, schema_1.sports.id))
            .leftJoin(schema_1.dropdownOptions, (0, drizzle_orm_1.eq)(schema_1.sports.categoryId, schema_1.dropdownOptions.id))
            .leftJoin(schema_1.sports_providers, (0, drizzle_orm_1.eq)(schema_1.sports.providerId, schema_1.sports_providers.id))
            .where((0, drizzle_orm_1.eq)(schema_1.events.status, "active"))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.events.createdAt));
        // Safely parse images
        const parsed = result.map((event) => ({
            ...event,
            images: event.images ? JSON.parse(event.images) : [],
        }));
        return res.status(200).json({
            status: true,
            data: parsed,
            message: "Active events with full sports data fetched successfully.",
        });
    }
    catch (error) {
        console.error("getAllPublicEvents error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllPublicEvents = getAllPublicEvents;
const getFeaturedGame = async (req, res) => {
    try {
        const result = await connection_1.db
            .select({
            id: schema_1.featuredGames.id,
            title: schema_1.featuredGames.title,
            gameId: schema_1.featuredGames.gameId,
            images: schema_1.featuredGames.images,
            createdAt: schema_1.featuredGames.createdAt,
            gameName: schema_1.games.name,
            status: schema_1.featuredGames.status,
        })
            .from(schema_1.featuredGames)
            .leftJoin(schema_1.games, (0, drizzle_orm_1.eq)(schema_1.featuredGames.gameId, schema_1.games.id))
            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.featuredGames.id, 1), (0, drizzle_orm_1.eq)(schema_1.featuredGames.status, "active"))) // always fetch id = 1
            .limit(1); // optional but safe
        if (result.length === 0) {
            return res.status(400).json({
                status: false,
                message: "Featured game not found.",
            });
        }
        const featuredGame = {
            ...result[0],
            images: result[0].images ? JSON.parse(result[0].images) : [],
        };
        return res.status(200).json({
            status: true,
            data: featuredGame,
            message: "Featured game fetched successfully.",
        });
    }
    catch (error) {
        console.error("getFeaturedGame error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getFeaturedGame = getFeaturedGame;
const getAllPublicSocial = async (req, res) => {
    try {
        const result = await connection_1.db
            .select()
            .from(schema_1.socials)
            .where((0, drizzle_orm_1.eq)(schema_1.socials.status, "active"))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.socials.createdAt));
        // Safely parse images
        const parsed = result.map((social) => ({
            ...social,
            images: social.images ? JSON.parse(social.images) : [],
        }));
        return res.status(200).json({
            status: true,
            data: parsed,
            message: "Social data fetched successfully.",
        });
    }
    catch (error) {
        console.error("social get error:", error);
        return res.status(500).json({
            status: false,
            message: "Server error.",
        });
    }
};
exports.getAllPublicSocial = getAllPublicSocial;
