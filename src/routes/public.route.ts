import { Router } from "express";
import {
  getActiveAmbassador,
  getActiveAnnouncement,
  getActiveCategories,
  getActiveGamingLicenses,
  getActivePopup,
  getActiveResponsibleGaming,
  getActiveSponsor,
  getActiveUtils,
  getActiveVideoAdvertisement,
  getAllActiveProviderList,
  getAllExclusiveGamesSportsList,
  getAllGamesByCategoryID,
  getAllPublicEvents,
  getGameList,
  getMenuProviders,
  getProviderAndCategory,
  getProvidersByCategory,
  getPublicActiveBannerImages,
  getPublicPromotionList,
  getSportList,
  getSportsAndGames,
} from "../controllers/public.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/promotions", asyncHandler(getPublicPromotionList));
router.get("/banners-list", asyncHandler(getPublicActiveBannerImages));
router.get("/announcement", asyncHandler(getActiveAnnouncement));
router.get("/popup", asyncHandler(getActivePopup));
router.get("/advertisement", asyncHandler(getActiveVideoAdvertisement));
router.get("/sponsors", asyncHandler(getActiveSponsor));
router.get("/ambassador", asyncHandler(getActiveAmbassador));
router.get("/gaming-licenses", asyncHandler(getActiveGamingLicenses));
router.get("/responsible-gamings", asyncHandler(getActiveResponsibleGaming));
router.get("/active-utils", asyncHandler(getActiveUtils));
router.get("/categories", asyncHandler(getActiveCategories));
router.get(
  "/category-wise-provider/:categoryId",
  asyncHandler(getProvidersByCategory)
);
router.get("/category-wise-games", asyncHandler(getGameList));
router.get("/category-wise-sports", asyncHandler(getSportList));
router.get("/category-provider", asyncHandler(getSportsAndGames));
router.get("/providers", asyncHandler(getAllActiveProviderList));
router.get("/menu-providers", asyncHandler(getMenuProviders));
router.get("/category-games", asyncHandler(getAllGamesByCategoryID));
router.get("/public-events", asyncHandler(getAllPublicEvents));
router.get(
  "/exclusive-games-sports",
  asyncHandler(getAllExclusiveGamesSportsList)
);

export default router;
