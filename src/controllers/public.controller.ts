import { Request, Response } from "express";
import {
  getPublicPaginatedPromotions,
  getPublicPromotionById,
} from "../models/public.model";
import { db } from "../db/connection";
import {
  ambassadors,
  announcements,
  banners,
  gamingLicenses,
  responsibleGaming,
  sponsors,
  video_advertisement,
  website_popups,
} from "../db/schema";
import { desc, eq } from "drizzle-orm";

export const getPublicPromotionList = async (req: Request, res: Response) => {
  try {
    const { id, page = 1, pageSize = 10 } = req.query;

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
