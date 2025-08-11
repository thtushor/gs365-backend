import { Router } from "express";
import {
  getActiveAmbassador,
  getActiveAnnouncement,
  getActiveGamingLicenses,
  getActivePopup,
  getActiveResponsibleGaming,
  getActiveSponsor,
  getActiveUtils,
  getActiveVideoAdvertisement,
  getPublicActiveBannerImages,
  getPublicPromotionList,
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

export default router;
