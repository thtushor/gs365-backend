import { countries } from "../db/schema/country";
import { currencies } from "../db/schema/currency";
import { languages } from "../db/schema/language";
import { countryLanguages } from "../db/schema/country_languages";
import { MySql2Database } from "drizzle-orm/mysql2";
import { and, eq, like, or } from "drizzle-orm";

// You can add helper functions or types here for country operations if needed.

// Helper to get all currencies with optional status and searchKey
type Status = "active" | "inactive";
export const getAllCurrencies = async (
  db: any,
  status?: Status,
  searchKey?: string
) => {
  const whereConditions = [];

  if (status) {
    whereConditions.push(eq(currencies.status, status));
  }

  if (searchKey) {
    const key = `%${searchKey}%`;
    whereConditions.push(
      or(like(currencies.code, key), like(currencies.name, key))
    );
  }

  let query = await db
    .select()
    .from(currencies)
    .where(and(...whereConditions));

  return query;
};

// Helper to get all languages with optional status and searchKey
export const getAllLanguages = async (
  db: any,
  status?: Status,
  searchKey?: string
) => {
  const whereConditions = [];

  if (status) {
    whereConditions.push(eq(languages.status, status));
  }
  if (searchKey) {
    const key = `%${searchKey}%`;
    whereConditions.push(
      or(like(languages.code, key), like(languages.name, key))
    );
  }
  let query = await db
    .select()
    .from(languages)
    .where(and(...whereConditions));

  return query;
};

export { countries, currencies, languages, countryLanguages };
