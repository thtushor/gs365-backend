import { eq, sql } from "drizzle-orm";
import { db } from "../connection";
import { countries, currencies, languages } from "../schema";
// @ts-ignore
import countryJson from "../../assets/countries.json";
// @ts-ignore
import commonCurrency from "../../assets/Common-Currency.json";
// @ts-ignore
import languageJson from "../../assets/ISO-639-1-language.json";

type CurrencyDetail = {
  symbol: string;
  name: string;
  symbol_native: string;
  decimal_digits: number;
  rounding: number;
  code: string;
  name_plural: string;
};

type CurrencyMapData = {
  [code: string]: CurrencyDetail;
};

type Currency = {
  code: string;
  name: string;
  symbol: string;
};

export type Country = {
  id: number;
  name: string;
  isoAlpha2: string;
  isoAlpha3: string;
  isoNumeric: number;
  currency: Currency;
  flag?: string; // Optional, since it's incomplete in your example
};

export type LanguageCode = {
  code: string;
  name: string;
};

const countryData = countryJson as Country[];
const currencyDetailsData = commonCurrency as CurrencyMapData;
const languageData = languageJson as LanguageCode[];

const seedCurrencyData = async () => {
  const currencyMap = new Map<
    string,
    {
      code: string;
      symbol: string;
      symbol_native: string;
      name: string;
      status: "active" | "inactive";
    }
  >();

  for (const { currency } of countryData) {
    const code = currency.code?.toUpperCase();
    // console.log({ code });
    if (!code || currencyMap.has(code)) continue;

    const currencyCodeDetails = currencyDetailsData?.[code];

    if (!currencyCodeDetails?.code) continue;

    const InsertableData = {
      code: currencyCodeDetails.code,
      symbol: currencyCodeDetails.symbol,
      symbol_native: currencyCodeDetails.symbol_native,
      name: currencyCodeDetails.name,
      status: "active" as "active",
    };

    currencyMap.set(currencyCodeDetails.code, InsertableData);
  }

  const currencyData = Array.from(currencyMap.values());

  const result = await db
    .insert(currencies)
    .values(
      currencyData.map((c) => ({
        ...c,
        symbol_native: c.symbol_native,
        symbol: c.symbol,
        status: "active" as "active",
      }))
    )
    .onDuplicateKeyUpdate({
      set: {
        code: sql`values(${currencies.code})`,
        name: sql`values(${currencies.name})`,
      },
    })
    .$returningId();

  console.log("✅ Currency seed data inserted successfully!");

  return result;
};

const seedCountryData = async () => {
  const CountryMap = new Map<
    String,
    {
      name: String;
      flagUrl: any;
      currencyId: Number;
      status: String;
      code: string;
    }
  >();

  for (const country of countryData) {
    const { name, currency ,isoAlpha2} = country;

    console.log({isoAlpha2})

    const [currencyData] = await db
      .select()
      .from(currencies)
      .where(eq(currencies.code, currency.code));

    if (name && !CountryMap.has(name)) {
      CountryMap.set(name, {
        name: name,
        flagUrl: country?.flag || "",
        currencyId: Number(currencyData?.id),
        code: isoAlpha2,
        status: "active" as "active",
      });
    }
  }

  const insertAbleCountryData = Array.from(CountryMap.values());

  const result = await db
    .insert(countries)
    .values(
      insertAbleCountryData.map((c) => ({
        name: String(c.name),
        flagUrl: String(c.flagUrl || ""),
        currencyId: Number(c.currencyId) || null,
        code: c.code,
        status: "active" as "active",
      }))
    )
    .onDuplicateKeyUpdate({
      set: {
        name: sql`values(${countries.name})`,
        code: sql`values(${countries.code})`,
      },
    });

  console.log("✅ Country seed data inserted successfully!");

  return result;
};

const seedLanguageData = async () => {
  const result = await db
    .insert(languages)
    .values(
      languageData.map((item) => ({
        code: item.code,
        name: item?.name,
        status: "active" as "active" | "inactive",
      }))
    )
    .onDuplicateKeyUpdate({
      set: {
        code: sql`values(${languages.code})`,
        name: sql`values(${languages.name})`,
      },
    });

  console.log("✅ Language seed data inserted successfully!");

  return result;
};

export const seedCurrency = async () => {
  try {
    // insert country data

    await seedCurrencyData();

    await seedCountryData();

    await seedLanguageData();

    // console.log("✅ Currency seed data inserted successfully!");
  } catch (error) {
    console.error("❌ Failed to insert Currency seed data:", error);
  }
};
