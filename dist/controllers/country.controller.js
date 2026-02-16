"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCountryLanguageStatus = exports.updateCurrencyStatus = exports.updateLanguageStatus = exports.updateCountryStatus = exports.assignCountryLanguage = exports.getAllLanguagesHandler = exports.getAllCurrenciesHandler = exports.deleteCountry = exports.updateCountry = exports.createCountry = exports.getCountryById = exports.getAllCountries = void 0;
const connection_1 = require("../db/connection");
const country_model_1 = require("../models/country.model");
const drizzle_orm_1 = require("drizzle-orm");
const country_model_2 = require("../models/country.model");
const getAllCountries = async (req, res) => {
    try {
        const status = req.query.status;
        const searchKey = req?.query?.searchKey;
        const pageSize = parseInt(req.query.pageSize || "250", 10);
        const page = parseInt(req.query.page || "1", 10);
        const whereCondition = [];
        // Only allow valid status values
        const validStatus = status === "active" || status === "inactive" ? status : undefined;
        if (validStatus) {
            whereCondition.push((0, drizzle_orm_1.eq)(country_model_1.countries.status, validStatus));
        }
        if (searchKey) {
            whereCondition.push((0, drizzle_orm_1.like)(country_model_1.countries.name, `%${searchKey}%`));
        }
        // Count total countries for pagination
        const totalCountResult = whereCondition?.length > 0
            ? await connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)`.mapWith(Number) })
                .from(country_model_1.countries)
                .where((0, drizzle_orm_1.and)(...whereCondition))
            : await connection_1.db
                .select({ count: (0, drizzle_orm_1.sql) `count(*)`.mapWith(Number) })
                .from(country_model_1.countries);
        const totalCount = totalCountResult[0]?.count || 0;
        // Fetch paginated countries with optional status filter
        const offset = (page - 1) * pageSize;
        const countryRows = whereCondition?.length > 0
            ? await connection_1.db
                .select()
                .from(country_model_1.countries)
                .where((0, drizzle_orm_1.and)(...whereCondition))
                .limit(pageSize)
                .offset(offset)
            : await connection_1.db.select().from(country_model_1.countries).limit(pageSize).offset(offset);
        const result = await Promise.all(countryRows.map(async (country) => {
            let currency = null;
            if (country.currencyId !== null) {
                const currencyResult = await connection_1.db
                    .select()
                    .from(country_model_1.currencies)
                    .where((0, drizzle_orm_1.eq)(country_model_1.currencies.id, country.currencyId));
                currency = currencyResult[0] || null;
            }
            const langLinks = await connection_1.db
                .select()
                .from(country_model_1.countryLanguages)
                .where((0, drizzle_orm_1.eq)(country_model_1.countryLanguages.countryId, country.id));
            const langs = await Promise.all(langLinks.map(async (cl) => {
                const lang = await connection_1.db
                    .select()
                    .from(country_model_1.languages)
                    .where((0, drizzle_orm_1.eq)(country_model_1.languages.id, cl.languageId));
                return lang[0];
            }));
            return {
                ...country,
                currency,
                languages: langs,
            };
        }));
        res.json({
            data: result,
            pagination: {
                total: totalCount,
                page,
                pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch countries", errors: err });
    }
};
exports.getAllCountries = getAllCountries;
const getCountryById = async (req, res) => {
    try {
        const id = parseInt(req.params.id, 10);
        const countryRows = await connection_1.db
            .select()
            .from(country_model_1.countries)
            .where((0, drizzle_orm_1.eq)(country_model_1.countries.id, id));
        if (!countryRows.length)
            return res.status(404).json({ error: "Country not found" });
        const country = countryRows[0];
        let currency = null;
        if (country.currencyId !== null) {
            const currencyResult = await connection_1.db
                .select()
                .from(country_model_1.currencies)
                .where((0, drizzle_orm_1.eq)(country_model_1.currencies.id, country.currencyId));
            currency = currencyResult[0] || null;
        }
        const langLinks = await connection_1.db
            .select()
            .from(country_model_1.countryLanguages)
            .where((0, drizzle_orm_1.eq)(country_model_1.countryLanguages.countryId, country.id));
        const langs = await Promise.all(langLinks.map(async (cl) => {
            const lang = await connection_1.db
                .select()
                .from(country_model_1.languages)
                .where((0, drizzle_orm_1.eq)(country_model_1.languages.id, cl.languageId));
            return lang[0];
        }));
        res.status(200).json({
            data: {
                ...country,
                currency,
                languages: langs,
            },
            status: true,
            message: "Country fetched",
        });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch country" });
    }
};
exports.getCountryById = getCountryById;
const createCountry = async (req, res) => {
    try {
        const { name, flagUrl, currencyId, languageIds, status } = req.body;
        if (!name ||
            !currencyId ||
            !Array.isArray(languageIds) ||
            languageIds.length === 0) {
            return res.status(400).json({ error: "Missing required fields" });
        }
        // Insert country
        const [insertedId] = await connection_1.db
            .insert(country_model_1.countries)
            .values({ name, flagUrl, currencyId, status })
            .$returningId();
        const [country] = await connection_1.db
            .select()
            .from(country_model_1.countries)
            .where((0, drizzle_orm_1.eq)(country_model_1.countries.id, Number(insertedId)))
            .limit(1);
        // Insert country_languages
        await Promise.all(languageIds.map((languageId) => connection_1.db
            .insert(country_model_1.countryLanguages)
            .values({ countryId: country.id, languageId, status: "active" })));
        res.status(201).json({ ...country, languageIds });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create country" });
    }
};
exports.createCountry = createCountry;
const updateCountry = async (req, res) => {
    // TODO: Implement update with currency and languages
    res.json({});
};
exports.updateCountry = updateCountry;
const deleteCountry = async (req, res) => {
    // TODO: Implement delete
    res.status(204).send();
};
exports.deleteCountry = deleteCountry;
const getAllCurrenciesHandler = async (req, res) => {
    try {
        const status = req.query.status;
        const searchKey = req.query.searchKey;
        const currencies = await (0, country_model_2.getAllCurrencies)(connection_1.db, status, searchKey);
        res.json({
            status: true,
            data: currencies,
            message: "Currency data fetched!",
        });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch currencies", errors: err });
    }
};
exports.getAllCurrenciesHandler = getAllCurrenciesHandler;
const getAllLanguagesHandler = async (req, res) => {
    try {
        const status = req.query.status;
        const searchKey = req.query.searchKey;
        const languages = await (0, country_model_2.getAllLanguages)(connection_1.db, status, searchKey);
        res.json({
            status: true,
            data: languages,
            message: "Languages data fetched",
        });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch languages", errors: err });
    }
};
exports.getAllLanguagesHandler = getAllLanguagesHandler;
const assignCountryLanguage = async (req, res) => {
    try {
        const { countryId, languageIds, status } = req.body;
        if (!countryId ||
            !Array.isArray(languageIds) ||
            languageIds.length === 0 ||
            !status) {
            return res.status(400).json({
                error: "countryId, languageIds (array), and status are required",
            });
        }
        for (const languageId of languageIds) {
            const existing = await connection_1.db
                .select()
                .from(country_model_1.countryLanguages)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(country_model_1.countryLanguages.countryId, countryId), (0, drizzle_orm_1.eq)(country_model_1.countryLanguages.languageId, languageId)));
            if (existing.length > 0) {
                // update status if exists
                await connection_1.db
                    .update(country_model_1.countryLanguages)
                    .set({ status })
                    .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(country_model_1.countryLanguages.countryId, countryId), (0, drizzle_orm_1.eq)(country_model_1.countryLanguages.languageId, languageId)));
            }
            else {
                // insert new mapping
                await connection_1.db
                    .insert(country_model_1.countryLanguages)
                    .values({ countryId, languageId, status });
            }
        }
        res
            .status(201)
            .json({ message: "Languages assigned to country successfully." });
    }
    catch (err) {
        console.error("Error assigning country languages:", err);
        res.status(500).json({ error: "Failed to assign languages to country" });
    }
};
exports.assignCountryLanguage = assignCountryLanguage;
// Update country status
const updateCountryStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ error: "id and status are required" });
        }
        await connection_1.db.update(country_model_1.countries).set({ status }).where((0, drizzle_orm_1.eq)(country_model_1.countries.id, id));
        const updated = await connection_1.db
            .select()
            .from(country_model_1.countries)
            .where((0, drizzle_orm_1.eq)(country_model_1.countries.id, id));
        res.json({
            status: true,
            data: updated[0],
            message: "Country status updated",
        });
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to update country status", errors: err });
    }
};
exports.updateCountryStatus = updateCountryStatus;
// Update language status
const updateLanguageStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ error: "id and status are required" });
        }
        await connection_1.db.update(country_model_1.languages).set({ status }).where((0, drizzle_orm_1.eq)(country_model_1.languages.id, id));
        const updated = await connection_1.db
            .select()
            .from(country_model_1.languages)
            .where((0, drizzle_orm_1.eq)(country_model_1.languages.id, id));
        res.json({
            status: true,
            data: updated[0],
            message: "Language status updated",
        });
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to update language status", errors: err });
    }
};
exports.updateLanguageStatus = updateLanguageStatus;
// Update currency status
const updateCurrencyStatus = async (req, res) => {
    try {
        const { id, status } = req.body;
        if (!id || !status) {
            return res.status(400).json({ error: "id and status are required" });
        }
        await connection_1.db.update(country_model_1.currencies).set({ status }).where((0, drizzle_orm_1.eq)(country_model_1.currencies.id, id));
        const updated = await connection_1.db
            .select()
            .from(country_model_1.currencies)
            .where((0, drizzle_orm_1.eq)(country_model_1.currencies.id, id));
        res.json({
            status: true,
            data: updated[0],
            message: "Currency status updated",
        });
    }
    catch (err) {
        res
            .status(500)
            .json({ error: "Failed to update currency status", errors: err });
    }
};
exports.updateCurrencyStatus = updateCurrencyStatus;
// Update country_language status
const updateCountryLanguageStatus = async (req, res) => {
    try {
        const { id, countryId, languageIds, status } = req.body;
        if (!id ||
            !countryId ||
            !Array.isArray(languageIds) ||
            languageIds.length === 0 ||
            !status) {
            return res.status(400).json({
                error: "id, countryId, languageIds (array), and status are required",
            });
        }
        // Remove old records for this id/countryId
        await connection_1.db
            .delete(country_model_1.countryLanguages)
            .where((0, drizzle_orm_1.eq)(country_model_1.countryLanguages.countryId, countryId));
        // Check for duplicates (optional since we are replacing)
        const existing = await connection_1.db
            .select()
            .from(country_model_1.countryLanguages)
            .where((0, drizzle_orm_1.eq)(country_model_1.countryLanguages.countryId, countryId));
        const existingLanguageIds = new Set(existing.map((row) => row.languageId));
        const newLanguages = languageIds.filter((langId) => !existingLanguageIds.has(langId));
        // Insert new country-language combinations
        if (newLanguages.length > 0) {
            await connection_1.db.insert(country_model_1.countryLanguages).values(newLanguages.map((langId) => ({
                countryId,
                languageId: langId,
                status,
            })));
        }
        // Fetch updated list
        const updated = await connection_1.db
            .select()
            .from(country_model_1.countryLanguages)
            .where((0, drizzle_orm_1.eq)(country_model_1.countryLanguages.countryId, countryId));
        res.json({
            status: true,
            data: updated,
            message: "Country-language status updated with multiple languages",
        });
    }
    catch (err) {
        res.status(500).json({
            error: "Failed to update country-language status",
            errors: err,
        });
    }
};
exports.updateCountryLanguageStatus = updateCountryLanguageStatus;
