"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../middlewares/verifyToken");
const asyncHandler_1 = require("../utils/asyncHandler");
const admin_controller_1 = require("../controllers/admin.controller");
const user_controller_1 = require("../controllers/user.controller");
const adminAuth_controller_1 = require("../controllers/adminAuth.controller");
const router = (0, express_1.Router)();
// withtout verification token
router.post("/login", (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminLogin));
router.post("/registration", (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminRegistration));
// Auth flows
router.post("/verify-otp", (0, asyncHandler_1.asyncHandler)(adminAuth_controller_1.verifyAdminOtp));
router.post("/resend-otp", (0, asyncHandler_1.asyncHandler)(adminAuth_controller_1.resendAdminOtp));
router.post("/forgot-password", (0, asyncHandler_1.asyncHandler)(adminAuth_controller_1.forgotAdminPassword));
router.post("/reset-password", (0, asyncHandler_1.asyncHandler)(adminAuth_controller_1.resetAdminPassword));
// with token
router.post("/create-agent", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminRegistration));
router.post("/create-admin", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminRegistration));
router.post("/logout", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminLogout));
router.get("/profile", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.adminProfile));
router.get("/players", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getPlayers));
router.get("/players/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(user_controller_1.getUserDetailsController));
router.get("/players/:id/profile", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getUserProfile));
router.get("/admins", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAdmins));
router.get("/details-by-referer/:refererCode", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getDetailsByReferer));
router.get("/agents", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAgents));
router.get("/affiliates", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAffiliates));
router.get("/affiliates/:id/sub-affiliates-list", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getSubAffiliatesListByAffiliateId));
router.get("/affiliates/:id/players-list", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getPlayersListByAffiliateId));
// configuration
router.post("/create-dropdowns", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.addOrUpdateDropdownOption));
router.post("/dropdown/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.deleteDropdownOption));
router.post("/update-dropdown-option-status/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.updateDropdownOptionStatus));
router.get("/get-dropdowns", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getDropdownsList));
router.get("/dropdown-options", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getDropdownOptionsList));
// promotions
router.post("/promotion", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.addOrUpdatePromotion));
router.get("/promotions", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getPromotionsList));
// Update admin by id
router.post("/update/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.updateAdminProfile));
// Delete admin by id
router.post("/delete/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.deleteAdmin));
// cms
router.post("/banner", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createUpdateBanners));
// banner
router.get("/get-banner", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAllBanners));
router.post("/announcement", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createOrUpdateAnnouncement));
router.get("/get-announcements", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAllAnnouncements));
router.post("/delete-announcement/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.deleteAnnouncement));
router.post("/event", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createUpdateEvent));
router.get("/events", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAllEvents));
router.post("/social-media", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createUpdateSocial));
router.get("/social-media", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAllSocial));
router.post("/featured-games", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createUpdateFeaturedGame));
router.get("/featured-games", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getFeaturedGame));
router.post("/website-popup", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createOrUpdateWebsitePopup));
router.get("/get-website-popups", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAllWebsitePopups));
router.post("/delete-popup/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.deletePopup));
router.post("/create-update-faq", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createOrUpdateWebsiteFaq));
router.get("/get-faqs", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAllWebsiteFaq));
router.post("/delete-faq/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.deleteFaq));
router.post("/create-update-advertisement", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createOrUpdateVideoAdvertisement));
router.get("/get-advertisement", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAllVideoAdvertisement));
router.post("/delete-advertisement/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.deleteAdvertisement));
router.post("/create-update-sponsor", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createOrUpdateSponsor));
router.get("/get-sponsors", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAllSponsors));
router.post("/delete-sponsor/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.deleteSponsor));
router.post("/create-update-ambassador", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createOrUpdateAmbassador));
router.get("/get-ambassadors", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAllAmbassador));
router.post("/delete-ambassador/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.deleteAmbassador));
router.post("/create-update-gaming-license", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createOrUpdateGamingLicenses));
router.get("/get-gaming-licenses", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAllGamingLicenses));
router.post("/delete-gaming-license/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.deleteGamingLicenses));
router.post("/create-update-responsible-gaming", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createOrUpdateResponsibleGaming));
router.get("/get-responsible-gamings", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getAllResponsibleGaming));
router.post("/delete-responsible-gaming/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.deleteResponsibleGaming));
// game
router.get("/game-providers", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getGameProvidersList));
router.post("/game-provider", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.addOrUpdateGameProvider));
router.post("/add-update-game", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.addOrUpdateGame));
router.get("/games", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getGameList));
// sport
router.get("/sport-providers", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getSportsProvidersList));
router.post("/sport-provider", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.addOrUpdateSportsProvider));
router.post("/add-update-sport", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.addOrUpdateSport));
router.get("/sports", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getSportList));
router.get("/menu-list", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getMenuProviders));
router.post("/update-menu-priority", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.updateMenuPriority));
router.get("/kyc", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getKycList));
router.post("/create-update-kyc", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createUpdateKyc));
router.post("/update-kyc-status", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.updateKycStatus));
router.post("/send-kyc-verification-request", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.sendKycVerificationRequest));
router.post("/currency-rate", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createOrUpdateConversion));
router.get("/currency-rate", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getConversionList));
exports.default = router;
router.post("/delete-currency/:id", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.deleteConversionById));
router.post("/notifications", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.createCustomNotification));
router.get("/notifications", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.getCustomNotifications));
router.post("/:notifyId/status", verifyToken_1.verifyToken, (0, asyncHandler_1.asyncHandler)(admin_controller_1.updateCustomNotification));
