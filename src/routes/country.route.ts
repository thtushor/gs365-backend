import { Router } from "express";
import {
  getAllCountries,
  getCountryById,
  createCountry,
  updateCountry,
  deleteCountry,
  getAllCurrenciesHandler,
  getAllLanguagesHandler,
  assignCountryLanguage,
  updateCountryStatus,
  updateLanguageStatus,
  updateCurrencyStatus,
  updateCountryLanguageStatus,
} from "../controllers/country.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.get("/", getAllCountries);
// router.get("/:id", asyncHandler(getCountryById));
router.post("/create", asyncHandler(createCountry));
router.post("/update/:id", updateCountry);
router.post("/delete/:id", deleteCountry);
router.post("/update-country-status", asyncHandler(updateCountryStatus));
router.post("/update-language-status", asyncHandler(updateLanguageStatus));
router.post("/update-currency-status", asyncHandler(updateCurrencyStatus));
router.post(
  "/update-country-language",
  asyncHandler(updateCountryLanguageStatus)
);

router.get("/currencies", asyncHandler(getAllCurrenciesHandler));
router.get("/languages", asyncHandler(getAllLanguagesHandler));
router.post("/assign-country-languages", asyncHandler(assignCountryLanguage));

export default router;
