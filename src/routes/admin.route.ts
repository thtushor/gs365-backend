import { Router } from "express";
import { verifyToken } from "../middlewares/verifyToken";
import { asyncHandler } from "../utils/asyncHandler";

import {
  adminLogin,
  adminRegistration,
  adminProfile,
  adminLogout,
  getPlayers,
  getUserProfile,
  getAdmins,
  updateAdminProfile,
  deleteAdmin,
  getAgents,
  getAffiliates,
  addOrUpdateDropdownOption,
  getDropdownsList,
  updateDropdownOptionStatus,
  getPromotionsList,
  getDropdownOptionsList,
  addOrUpdatePromotion,
  createUpdateBanners,
  getAllBanners,
  createOrUpdateAnnouncement,
  getAllAnnouncements,
  createOrUpdateWebsitePopup,
  getAllWebsitePopups,
  deletePopup,
  deleteAnnouncement,
  createOrUpdateVideoAdvertisement,
  getAllVideoAdvertisement,
  deleteAdvertisement,
  createOrUpdateSponsor,
  getAllSponsors,
  deleteSponsor,
  createOrUpdateAmbassador,
  getAllAmbassador,
  deleteAmbassador,
  createOrUpdateGamingLicenses,
  getAllGamingLicenses,
  deleteGamingLicenses,
  createOrUpdateResponsibleGaming,
  getAllResponsibleGaming,
  deleteResponsibleGaming,
  getSubAffiliatesListByAffiliateId,
  getPlayersListByAffiliateId,
  addOrUpdateGameProvider,
  getGameProvidersList,
  addOrUpdateGame,
  getGameList,
  getSportsProvidersList,
  addOrUpdateSportsProvider,
  addOrUpdateSport,
  getSportList,
  createUpdateEvent,
  getAllEvents,
  deleteDropdownOption,
  getMenuProviders,
  updateMenuPriority,
} from "../controllers/admin.controller";

const router = Router();

// withtout verification token
router.post("/login", asyncHandler(adminLogin));
router.post("/registration", asyncHandler(adminRegistration));
// with token
router.post("/create-agent", verifyToken, asyncHandler(adminRegistration));
router.post("/create-admin", verifyToken, asyncHandler(adminRegistration));
router.post("/logout", verifyToken, asyncHandler(adminLogout));
router.get("/profile", verifyToken, asyncHandler(adminProfile));
router.get("/players", verifyToken, asyncHandler(getPlayers));
router.get("/players/:id/profile", verifyToken, asyncHandler(getUserProfile));
router.get("/admins", verifyToken, asyncHandler(getAdmins));
router.get("/agents", verifyToken, asyncHandler(getAgents));

router.get("/affiliates", verifyToken, asyncHandler(getAffiliates));
router.get(
  "/affiliates/:id/sub-affiliates-list",
  verifyToken,
  asyncHandler(getSubAffiliatesListByAffiliateId)
);
router.get(
  "/affiliates/:id/players-list",
  verifyToken,
  asyncHandler(getPlayersListByAffiliateId)
);

// configuration
router.post(
  "/create-dropdowns",
  verifyToken,
  asyncHandler(addOrUpdateDropdownOption)
);
router.post("/dropdown/:id", verifyToken, asyncHandler(deleteDropdownOption));

router.post(
  "/update-dropdown-option-status/:id",
  verifyToken,
  asyncHandler(updateDropdownOptionStatus)
);

router.get("/get-dropdowns", verifyToken, asyncHandler(getDropdownsList));

router.get(
  "/dropdown-options",
  verifyToken,
  asyncHandler(getDropdownOptionsList)
);

// promotions
router.post("/promotion", verifyToken, asyncHandler(addOrUpdatePromotion));
router.get("/promotions", verifyToken, asyncHandler(getPromotionsList));

// Update admin by id
router.post("/update/:id", verifyToken, asyncHandler(updateAdminProfile));

// Delete admin by id
router.post("/delete/:id", verifyToken, asyncHandler(deleteAdmin));

// cms
router.post("/banner", verifyToken, asyncHandler(createUpdateBanners));
// banner
router.get("/get-banner", verifyToken, asyncHandler(getAllBanners));

router.post(
  "/announcement",
  verifyToken,
  asyncHandler(createOrUpdateAnnouncement)
);

router.get(
  "/get-announcements",
  verifyToken,
  asyncHandler(getAllAnnouncements)
);
router.post(
  "/delete-announcement/:id",
  verifyToken,
  asyncHandler(deleteAnnouncement)
);
router.post("/event", verifyToken, asyncHandler(createUpdateEvent));
router.get("/events", verifyToken, asyncHandler(getAllEvents));
router.post(
  "/website-popup",
  verifyToken,
  asyncHandler(createOrUpdateWebsitePopup)
);
router.get(
  "/get-website-popups",
  verifyToken,
  asyncHandler(getAllWebsitePopups)
);
router.post("/delete-popup/:id", verifyToken, asyncHandler(deletePopup));

router.post(
  "/create-update-advertisement",
  verifyToken,
  asyncHandler(createOrUpdateVideoAdvertisement)
);
router.get(
  "/get-advertisement",
  verifyToken,
  asyncHandler(getAllVideoAdvertisement)
);
router.post(
  "/delete-advertisement/:id",
  verifyToken,
  asyncHandler(deleteAdvertisement)
);
router.post(
  "/create-update-sponsor",
  verifyToken,
  asyncHandler(createOrUpdateSponsor)
);
router.get("/get-sponsors", verifyToken, asyncHandler(getAllSponsors));
router.post("/delete-sponsor/:id", verifyToken, asyncHandler(deleteSponsor));
router.post(
  "/create-update-ambassador",
  verifyToken,
  asyncHandler(createOrUpdateAmbassador)
);
router.get("/get-ambassadors", verifyToken, asyncHandler(getAllAmbassador));
router.post(
  "/delete-ambassador/:id",
  verifyToken,
  asyncHandler(deleteAmbassador)
);
router.post(
  "/create-update-gaming-license",
  verifyToken,
  asyncHandler(createOrUpdateGamingLicenses)
);
router.get(
  "/get-gaming-licenses",
  verifyToken,
  asyncHandler(getAllGamingLicenses)
);
router.post(
  "/delete-gaming-license/:id",
  verifyToken,
  asyncHandler(deleteGamingLicenses)
);
router.post(
  "/create-update-responsible-gaming",
  verifyToken,
  asyncHandler(createOrUpdateResponsibleGaming)
);
router.get(
  "/get-responsible-gamings",
  verifyToken,
  asyncHandler(getAllResponsibleGaming)
);
router.post(
  "/delete-responsible-gaming/:id",
  verifyToken,
  asyncHandler(deleteResponsibleGaming)
);

// game
router.get("/game-providers", verifyToken, asyncHandler(getGameProvidersList));
router.post(
  "/game-provider",
  verifyToken,
  asyncHandler(addOrUpdateGameProvider)
);
router.post("/add-update-game", verifyToken, asyncHandler(addOrUpdateGame));
router.get("/games", verifyToken, asyncHandler(getGameList));

// sport
router.get(
  "/sport-providers",
  verifyToken,
  asyncHandler(getSportsProvidersList)
);
router.post(
  "/sport-provider",
  verifyToken,
  asyncHandler(addOrUpdateSportsProvider)
);
router.post("/add-update-sport", verifyToken, asyncHandler(addOrUpdateSport));
router.get("/sports", verifyToken, asyncHandler(getSportList));

router.get("/menu-list", verifyToken, asyncHandler(getMenuProviders));
router.post(
  "/update-menu-priority",
  verifyToken,
  asyncHandler(updateMenuPriority)
);
export default router;
