import { Request, Response } from "express";
import {
  getAllDropdowns,
  getDropdownById,
  getGameDetailsById,
  getPaginatedCategoryWiseGameList,
  getPaginatedCategoryWiseSportList,
  getPaginatedDropdowns,
  getPaginatedGameList,
  getPaginatedSportList,
  getAllProvidersByCategoryId,
  getPublicPaginatedPromotions,
  getPublicPromotionById,
  getSportDetailsById,
  getGameOrSportListBasedOnCategoryAndProvider,
  getAllGamesOrSports,
  getAllActiveProviders,
  getAllGamesOrSportsByProviderId,
  getExclusiveGamesSports,
  getAllMenuProviders,
  getAllGamesOrSportsByCategoryID,
} from "../models/public.model";
import { db } from "../db/connection";
import {
  ambassadors,
  announcements,
  banners,
  dropdownOptions,
  events,
  faqs,
  featuredGames,
  games,
  gamingLicenses,
  responsibleGaming,
  socials,
  sponsors,
  sports,
  sports_providers,
  video_advertisement,
  website_popups,
} from "../db/schema";
import { and, desc, eq } from "drizzle-orm";

export const getPublicPromotionList = async (req: Request, res: Response) => {
  try {
    const { id, page = 1, pageSize = 500 } = req.query;

    const promotionId = id ? Number(id) : undefined;

    if (promotionId) {
      const promotion = await getPublicPromotionById(promotionId);
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

    const result = await getPublicPaginatedPromotions(
      Number(page),
      Number(pageSize)
    );

    return res.status(200).json({
      status: true,
      message: "Promotion fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching promotion:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

// her banner public api
export const getPublicActiveBannerImages = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await db
      .select()
      .from(banners)
      .where(eq(banners.status, "active"))
      .orderBy(desc(banners.id));

    const allImages = result.flatMap((banner) => {
      try {
        const images = JSON.parse(banner.images);
        return Array.isArray(images) ? images : [];
      } catch {
        return [];
      }
    });

    return res.status(200).json({
      status: true,
      data: allImages, // just the images
      message: "Active banner images fetched successfully.",
    });
  } catch (error) {
    console.error("getActiveBannerImages error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getActiveAnnouncement = async (req: Request, res: Response) => {
  try {
    const activeAnnouncement = await db
      .select()
      .from(announcements)
      .where(eq(announcements.status, "active"))
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
  } catch (error) {
    console.error("Error fetching active announcement:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getActivePopup = async (req: Request, res: Response) => {
  try {
    const activePopup = await db
      .select()
      .from(website_popups)
      .where(eq(website_popups.status, "active"))
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
  } catch (error) {
    console.error("Error fetching active popup:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const getAllWebsiteFaqCollections = async (
  req: Request,
  res: Response
) => {
  function getRandomColor() {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FFC300", "#8E44AD"];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  try {
    // Fetch only active FAQs with their category info
    const rows = await db
      .select({
        id: faqs.id,
        category: dropdownOptions.title,
        dropdownOptionsId: faqs.dropdownOptionsId,
        title: faqs.title,
        createdAt: faqs.createdAt,
        status: faqs.status,
        message: faqs.message,
      })
      .from(faqs)
      .leftJoin(dropdownOptions, eq(dropdownOptions.id, faqs.dropdownOptionsId))
      .where(eq(faqs.status, "active"))
      .orderBy(desc(faqs.id));

    // Group by category
    const collectionsMap: Record<
      number,
      {
        id: number;
        title: string;
        articles: number;
        icon: string;
        color: string;
        questions: { id: number; question: string; answer: string }[];
      }
    > = {};

    for (const row of rows) {
      if (!row.category || !row.dropdownOptionsId) continue;

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
  } catch (error) {
    console.error("Error fetching faq collections:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const getActiveVideoAdvertisement = async (
  req: Request,
  res: Response
) => {
  try {
    const activeAdvertisement = await db
      .select()
      .from(video_advertisement)
      .where(eq(video_advertisement.status, "active"))
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
  } catch (error) {
    console.error("Error fetching active advertisement:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getActiveSponsor = async (req: Request, res: Response) => {
  try {
    const activeSponsor = await db
      .select()
      .from(sponsors)
      .where(eq(sponsors.status, "active"));

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
  } catch (error) {
    console.error("Error fetching active sponsors:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getActiveAmbassador = async (req: Request, res: Response) => {
  try {
    const activeAmbassador = await db
      .select()
      .from(ambassadors)
      .where(eq(ambassadors.status, "active"));

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
  } catch (error) {
    console.error("Error fetching active ambassadors:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getActiveGamingLicenses = async (req: Request, res: Response) => {
  try {
    const activeGamingLicense = await db
      .select()
      .from(gamingLicenses)
      .where(eq(gamingLicenses.status, "active"));

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
  } catch (error) {
    console.error("Error fetching active gaming license:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getActiveResponsibleGaming = async (
  req: Request,
  res: Response
) => {
  try {
    const activeResponsibleGaming = await db
      .select()
      .from(responsibleGaming)
      .where(eq(responsibleGaming.status, "active"));

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
  } catch (error) {
    console.error("Error fetching active responsible gaming:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const getActiveUtils = async (req: Request, res: Response) => {
  try {
    const [
      popup,
      responsible_gamings,
      bannersData,
      announcementData,
      advertisement,
      sponsorsData,
      ambassadorData,
      gamingLicensesData,
    ] = await Promise.all([
      db
        .select()
        .from(website_popups)
        .where(eq(website_popups.status, "active"))
        .limit(1),
      db
        .select()
        .from(responsibleGaming)
        .where(eq(responsibleGaming.status, "active")),
      db
        .select()
        .from(banners)
        .where(eq(banners.status, "active"))
        .orderBy(desc(banners.id)),
      db
        .select()
        .from(announcements)
        .where(eq(announcements.status, "active"))
        .limit(1),
      db
        .select()
        .from(video_advertisement)
        .where(eq(video_advertisement.status, "active"))
        .limit(1),
      db.select().from(sponsors).where(eq(sponsors.status, "active")),
      db.select().from(ambassadors).where(eq(ambassadors.status, "active")),
      db
        .select()
        .from(gamingLicenses)
        .where(eq(gamingLicenses.status, "active")),
    ]);

    // parse images in banners
    const banner_images = bannersData.flatMap((banner) => {
      try {
        const images = JSON.parse(banner.images);
        return Array.isArray(images) ? images : [];
      } catch {
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
  } catch (error) {
    console.error("Error fetching active utils:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getActiveCategories = async (req: Request, res: Response) => {
  try {
    const { id, page = 1, pageSize = 10, isPaginate = false } = req.query;

    const dropdownId = id ? Number(id) : undefined;

    if (dropdownId) {
      const dropdown = await getDropdownById(dropdownId);
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
      const data = await getAllDropdowns();

      return res.status(200).json({
        status: true,
        message: "Dropdowns fetched successfully.",
        data,
      });
    }
    const result = await getPaginatedDropdowns(Number(page), Number(pageSize));

    return res.status(200).json({
      status: true,
      message: "Dropdowns fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching dropdowns:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};

export const getProvidersByCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params; // <-- use params
    console.log("category id", categoryId);

    if (!categoryId) {
      return res.status(400).json({
        status: false,
        message: "categoryId is required",
      });
    }

    if (categoryId === "exclusive") {
      const exclusiveGames = await getAllProvidersByCategoryId(categoryId);

      return res.status(200).json({
        status: true,
        message: "Exclusive games fetched successfully.",
        data: exclusiveGames,
      });
    }

    const providers = await getAllProvidersByCategoryId(Number(categoryId));

    return res.status(200).json({
      status: true,
      message: "Providers fetched successfully.",
      data: providers,
    });
  } catch (error) {
    console.error("Error fetching providers by category:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

export const getGameList = async (req: Request, res: Response) => {
  try {
    const { id, page = 1, pageSize = 10, categoryId } = req.query;

    const gameId = id ? Number(id) : undefined;
    if (gameId) {
      const gameDetails = await getGameDetailsById(gameId);
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
      const result = await getPaginatedCategoryWiseGameList(
        Number(page),
        Number(pageSize),
        Number(categoryId)
      );

      return res.status(200).json({
        status: true,
        message: "Category wise game list fetched successfully.",
        data: result.data,
        pagination: result.pagination,
      });
    }

    const result = await getPaginatedGameList(Number(page), Number(pageSize));

    return res.status(200).json({
      status: true,
      message: "All game list fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching game list:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
export const getSportList = async (req: Request, res: Response) => {
  try {
    const { id, page = 1, pageSize = 10, categoryId } = req.query;

    const gameId = id ? Number(id) : undefined;
    if (gameId) {
      const gameDetails = await getSportDetailsById(gameId);
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
      const result = await getPaginatedCategoryWiseSportList(
        Number(page),
        Number(pageSize),
        Number(categoryId)
      );

      return res.status(200).json({
        status: true,
        message: "Category wise game list fetched successfully.",
        data: result.data,
        pagination: result.pagination,
      });
    }

    const result = await getPaginatedSportList(Number(page), Number(pageSize));

    return res.status(200).json({
      status: true,
      message: "All game list fetched successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching game list:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
export const getProviderAndCategory = async (req: Request, res: Response) => {
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

    const result = await getGameOrSportListBasedOnCategoryAndProvider(
      type,
      Number(providerId),
      categoryId ? Number(categoryId) : undefined
    );

    return res.status(200).json({
      status: true,
      message: "Category wise game list fetched successfully.",
      data: result.data,
    });
  } catch (error) {
    console.error("Error fetching game list:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
export const getSportsAndGames = async (req: Request, res: Response) => {
  try {
    const { categoryId, providerId, type } = req.query;
    const providerIdNum = Number(providerId);
    const categoryIdNum = categoryId ? Number(categoryId) : undefined;
    const typeValidate =
      type === "games" || type === "sports" ? type : undefined;

    if (!providerIdNum) {
      return res.status(400).json({
        status: false,
        message: "Invalid category or provider id.",
      });
    }

    if (!categoryIdNum && providerIdNum) {
      console.log("fetch this man");
      if (typeValidate) {
        const result = await getAllGamesOrSportsByProviderId(
          Number(providerId),
          typeValidate
        );
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

    const result = await getAllGamesOrSports(
      Number(providerId),
      Number(categoryId)
    );

    return res.status(200).json({
      status: true,
      message: "games and sports list fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching game and sports list:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getAllActiveProviderList = async (req: Request, res: Response) => {
  try {
    const result = await getAllActiveProviders();

    return res.status(200).json({
      status: true,
      message: "games and sports provider list fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching game and sports provider list:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getMenuProviders = async (req: Request, res: Response) => {
  try {
    const result = await getAllMenuProviders();
    return res.status(200).json({
      status: true,
      message: "Menu providers fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching menu providers:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getAllGamesByCategoryID = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.query;
    if (!categoryId) {
      return res.status(400).json({
        status: false,
        message: "Invalid category ID.",
      });
    }
    const result = await getAllGamesOrSportsByCategoryID(Number(categoryId));
    return res.status(200).json({
      status: true,
      message: "Games & Sports fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching games & sports:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};

export const getAllExclusiveGamesSportsList = async (
  req: Request,
  res: Response
) => {
  try {
    const result = await getExclusiveGamesSports();

    return res.status(200).json({
      status: true,
      message: "exclusive games and sports list fetched successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching exclusive game and sports list:", error);
    return res.status(500).json({
      status: false,
      message: "Server error",
    });
  }
};
export const getAllPublicEvents = async (req: Request, res: Response) => {
  try {
    const result = await db
      .select({
        id: events.id,
        title: events.title,
        sportId: events.sportId,
        images: events.images,
        createdAt: events.createdAt,
        status: events.status,
        sport: sports,
        categoryInfo: dropdownOptions,
        providerInfo: sports_providers,
      })
      .from(events)
      .leftJoin(sports, eq(events.sportId, sports.id))
      .leftJoin(dropdownOptions, eq(sports.categoryId, dropdownOptions.id))
      .leftJoin(sports_providers, eq(sports.providerId, sports_providers.id))
      .where(eq(events.status, "active"))
      .orderBy(desc(events.createdAt));

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
  } catch (error) {
    console.error("getAllPublicEvents error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getFeaturedGame = async (req: Request, res: Response) => {
  try {
    const result = await db
      .select({
        id: featuredGames.id,
        title: featuredGames.title,
        gameId: featuredGames.gameId,
        images: featuredGames.images,
        createdAt: featuredGames.createdAt,
        gameName: games.name,
        status: featuredGames.status,
      })
      .from(featuredGames)
      .leftJoin(games, eq(featuredGames.gameId, games.id))
      .where(and(eq(featuredGames.id, 1), eq(featuredGames.status, "active"))) // always fetch id = 1
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
  } catch (error) {
    console.error("getFeaturedGame error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
export const getAllPublicSocial = async (req: Request, res: Response) => {
  try {
    const result = await db
      .select()
      .from(socials)
      .where(eq(socials.status, "active"))
      .orderBy(desc(socials.createdAt));

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
  } catch (error) {
    console.error("social get error:", error);
    return res.status(500).json({
      status: false,
      message: "Server error.",
    });
  }
};
