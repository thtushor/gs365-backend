"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedCurrency = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../connection");
const schema_1 = require("../schema");
// @ts-ignore
const countries_json_1 = __importDefault(require("../../assets/countries.json"));
// @ts-ignore
const Common_Currency_json_1 = __importDefault(require("../../assets/Common-Currency.json"));
// @ts-ignore
const ISO_639_1_language_json_1 = __importDefault(require("../../assets/ISO-639-1-language.json"));
const countryData = countries_json_1.default;
const currencyDetailsData = Common_Currency_json_1.default;
const languageData = ISO_639_1_language_json_1.default;
const seedCurrencyData = async () => {
    const currencyMap = new Map();
    for (const { currency } of countryData) {
        const code = currency.code?.toUpperCase();
        // console.log({ code });
        if (!code || currencyMap.has(code))
            continue;
        const currencyCodeDetails = currencyDetailsData?.[code];
        if (!currencyCodeDetails?.code)
            continue;
        const InsertableData = {
            code: currencyCodeDetails.code,
            symbol: currencyCodeDetails.symbol,
            symbol_native: currencyCodeDetails.symbol_native,
            name: currencyCodeDetails.name,
            status: "active",
        };
        currencyMap.set(currencyCodeDetails.code, InsertableData);
    }
    const currencyData = Array.from(currencyMap.values());
    const result = await connection_1.db
        .insert(schema_1.currencies)
        .values(currencyData.map((c) => ({
        ...c,
        symbol_native: c.symbol_native,
        symbol: c.symbol,
        status: "active",
    })))
        .onDuplicateKeyUpdate({
        set: {
            code: (0, drizzle_orm_1.sql) `values(${schema_1.currencies.code})`,
            name: (0, drizzle_orm_1.sql) `values(${schema_1.currencies.name})`,
        },
    })
        .$returningId();
    console.log("✅ Currency seed data inserted successfully!");
    return result;
};
const seedCountryData = async () => {
    const CountryMap = new Map();
    for (const country of countryData) {
        const { name, currency, isoAlpha2 } = country;
        console.log({ isoAlpha2 });
        const [currencyData] = await connection_1.db
            .select()
            .from(schema_1.currencies)
            .where((0, drizzle_orm_1.eq)(schema_1.currencies.code, currency.code));
        if (name && !CountryMap.has(name)) {
            CountryMap.set(name, {
                name: name,
                flagUrl: country?.flag || "",
                currencyId: Number(currencyData?.id),
                code: isoAlpha2,
                status: "inactive",
            });
        }
    }
    const insertAbleCountryData = Array.from(CountryMap.values());
    const result = await connection_1.db
        .insert(schema_1.countries)
        .values(insertAbleCountryData.map((c) => ({
        name: String(c.name),
        flagUrl: String(c.flagUrl || ""),
        currencyId: Number(c.currencyId) || null,
        code: c.code,
        status: "inactive",
    })))
        .onDuplicateKeyUpdate({
        set: {
            name: (0, drizzle_orm_1.sql) `values(${schema_1.countries.name})`,
            code: (0, drizzle_orm_1.sql) `values(${schema_1.countries.code})`,
        },
    });
    console.log("✅ Country seed data inserted successfully!");
    return result;
};
const seedLanguageData = async () => {
    const result = await connection_1.db
        .insert(schema_1.languages)
        .values(languageData.map((item) => ({
        code: item.code,
        name: item?.name,
        status: "active",
    })))
        .onDuplicateKeyUpdate({
        set: {
            code: (0, drizzle_orm_1.sql) `values(${schema_1.languages.code})`,
            name: (0, drizzle_orm_1.sql) `values(${schema_1.languages.name})`,
        },
    });
    console.log("✅ Language seed data inserted successfully!");
    return result;
};
const seedCurrency = async () => {
    try {
        // insert country data
        await seedCurrencyData();
        await seedCountryData();
        await seedLanguageData();
        // console.log("✅ Currency seed data inserted successfully!");
    }
    catch (error) {
        console.error("❌ Failed to insert Currency seed data:", error);
    }
};
exports.seedCurrency = seedCurrency;
