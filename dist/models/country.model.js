"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryLanguages = exports.languages = exports.currencies = exports.countries = exports.getAllLanguages = exports.getAllCurrencies = void 0;
const country_1 = require("../db/schema/country");
Object.defineProperty(exports, "countries", { enumerable: true, get: function () { return country_1.countries; } });
const currency_1 = require("../db/schema/currency");
Object.defineProperty(exports, "currencies", { enumerable: true, get: function () { return currency_1.currencies; } });
const language_1 = require("../db/schema/language");
Object.defineProperty(exports, "languages", { enumerable: true, get: function () { return language_1.languages; } });
const country_languages_1 = require("../db/schema/country_languages");
Object.defineProperty(exports, "countryLanguages", { enumerable: true, get: function () { return country_languages_1.countryLanguages; } });
const drizzle_orm_1 = require("drizzle-orm");
const getAllCurrencies = async (db, status, searchKey) => {
    const whereConditions = [];
    if (status) {
        whereConditions.push((0, drizzle_orm_1.eq)(currency_1.currencies.status, status));
    }
    if (searchKey) {
        const key = `%${searchKey}%`;
        whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(currency_1.currencies.code, key), (0, drizzle_orm_1.like)(currency_1.currencies.name, key)));
    }
    let query = await db
        .select()
        .from(currency_1.currencies)
        .where((0, drizzle_orm_1.and)(...whereConditions));
    return query;
};
exports.getAllCurrencies = getAllCurrencies;
// Helper to get all languages with optional status and searchKey
const getAllLanguages = async (db, status, searchKey) => {
    const whereConditions = [];
    if (status) {
        whereConditions.push((0, drizzle_orm_1.eq)(language_1.languages.status, status));
    }
    if (searchKey) {
        const key = `%${searchKey}%`;
        whereConditions.push((0, drizzle_orm_1.or)((0, drizzle_orm_1.like)(language_1.languages.code, key), (0, drizzle_orm_1.like)(language_1.languages.name, key)));
    }
    let query = await db
        .select()
        .from(language_1.languages)
        .where((0, drizzle_orm_1.and)(...whereConditions));
    return query;
};
exports.getAllLanguages = getAllLanguages;
