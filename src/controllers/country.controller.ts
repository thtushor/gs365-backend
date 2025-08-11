import { Request, Response } from "express";
import { db } from "../db/connection";
import {
  countries,
  currencies,
  languages,
  countryLanguages,
} from "../models/country.model";
import { eq, and, sql, not, like } from "drizzle-orm";
import { getAllCurrencies, getAllLanguages } from "../models/country.model";

export const getAllCountries = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as "active" | "inactive" | undefined;
    const searchKey = req?.query?.searchKey as string;
    const pageSize = parseInt((req.query.pageSize as string) || "200", 10);
    const page = parseInt((req.query.page as string) || "1", 10);

    const whereCondition = [];

    // Only allow valid status values
    const validStatus =
      status === "active" || status === "inactive" ? status : undefined;

    if (validStatus) {
      whereCondition.push(eq(countries.status, validStatus));
    }

    if (searchKey) {
      whereCondition.push(like(countries.name, `%${searchKey}%`));
    }

    // Count total countries for pagination
    const totalCountResult =
      whereCondition?.length > 0
        ? await db
            .select({ count: sql`count(*)`.mapWith(Number) })
            .from(countries)
            .where(and(...whereCondition))
        : await db
            .select({ count: sql`count(*)`.mapWith(Number) })
            .from(countries);
    const totalCount = totalCountResult[0]?.count || 0;

    // Fetch paginated countries with optional status filter
    const offset = (page - 1) * pageSize;
    const countryRows =
      whereCondition?.length > 0
        ? await db
            .select()
            .from(countries)
            .where(and(...whereCondition))
            .limit(pageSize)
            .offset(offset)
        : await db.select().from(countries).limit(pageSize).offset(offset);

    const result = await Promise.all(
      countryRows.map(async (country) => {
        let currency = null;
        if (country.currencyId !== null) {
          const currencyResult = await db
            .select()
            .from(currencies)
            .where(eq(currencies.id, country.currencyId));
          currency = currencyResult[0] || null;
        }

        const langLinks = await db
          .select()
          .from(countryLanguages)
          .where(eq(countryLanguages.countryId, country.id));

        const langs = await Promise.all(
          langLinks.map(async (cl) => {
            const lang = await db
              .select()
              .from(languages)
              .where(eq(languages.id, cl.languageId));
            return lang[0];
          })
        );

        return {
          ...country,
          currency,
          languages: langs,
        };
      })
    );

    res.json({
      data: result,
      pagination: {
        total: totalCount,
        page,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch countries", errors: err });
  }
};

export const getCountryById = async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const countryRows = await db
      .select()
      .from(countries)
      .where(eq(countries.id, id));

    if (!countryRows.length)
      return res.status(404).json({ error: "Country not found" });

    const country = countryRows[0];

    let currency = null;
    if (country.currencyId !== null) {
      const currencyResult = await db
        .select()
        .from(currencies)
        .where(eq(currencies.id, country.currencyId));
      currency = currencyResult[0] || null;
    }

    const langLinks = await db
      .select()
      .from(countryLanguages)
      .where(eq(countryLanguages.countryId, country.id));

    const langs = await Promise.all(
      langLinks.map(async (cl) => {
        const lang = await db
          .select()
          .from(languages)
          .where(eq(languages.id, cl.languageId));
        return lang[0];
      })
    );

    res.status(200).json({
      data: {
        ...country,
        currency,
        languages: langs,
      },
      status: true,
      message: "Country fetched",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch country" });
  }
};

export const createCountry = async (req: Request, res: Response) => {
  try {
    const { name, flagUrl, currencyId, languageIds, status } = req.body;
    if (
      !name ||
      !currencyId ||
      !Array.isArray(languageIds) ||
      languageIds.length === 0
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    // Insert country
    const [insertedId] = await db
      .insert(countries)
      .values({ name, flagUrl, currencyId, status })
      .$returningId();

    const [country] = await db
      .select()
      .from(countries)
      .where(eq(countries.id, Number(insertedId)))
      .limit(1);
    // Insert country_languages
    await Promise.all(
      languageIds.map((languageId: number) =>
        db
          .insert(countryLanguages)
          .values({ countryId: country.id, languageId, status: "active" })
      )
    );
    res.status(201).json({ ...country, languageIds });
  } catch (err) {
    res.status(500).json({ error: "Failed to create country" });
  }
};

export const updateCountry = async (req: Request, res: Response) => {
  // TODO: Implement update with currency and languages
  res.json({});
};

export const deleteCountry = async (req: Request, res: Response) => {
  // TODO: Implement delete
  res.status(204).send();
};

export const getAllCurrenciesHandler = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as "active" | "inactive" | undefined;
    const searchKey = req.query.searchKey as string | undefined;
    const currencies = await getAllCurrencies(db, status, searchKey);
    res.json({
      status: true,
      data: currencies,
      message: "Currency data fetched!",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch currencies", errors: err });
  }
};

export const getAllLanguagesHandler = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as "active" | "inactive" | undefined;
    const searchKey = req.query.searchKey as string | undefined;
    const languages = await getAllLanguages(db, status, searchKey);
    res.json({
      status: true,
      data: languages,
      message: "Languages data fetched",
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch languages", errors: err });
  }
};

export const assignCountryLanguage = async (req: Request, res: Response) => {
  try {
    const { countryId, languageId, status } = req.body;
    if (!countryId || !languageId || !status) {
      return res
        .status(400)
        .json({ error: "countryId, languageId, and status are required" });
    }
    // Upsert: check if exists, update if so, else insert
    const existing = await db
      .select()
      .from(countryLanguages)
      .where(
        and(
          eq(countryLanguages.countryId, countryId),
          eq(countryLanguages.languageId, languageId)
        )
      );
    if (existing.length > 0) {
      await db
        .update(countryLanguages)
        .set({ status })
        .where(
          and(
            eq(countryLanguages.countryId, countryId),
            eq(countryLanguages.languageId, languageId)
          )
        );
    } else {
      await db
        .insert(countryLanguages)
        .values({ countryId, languageId, status });
    }
    res
      .status(201)
      .json({ message: "Language assigned to country successfully." });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign language to country" });
  }
};

// Update country status
export const updateCountryStatus = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "id and status are required" });
    }
    await db.update(countries).set({ status }).where(eq(countries.id, id));
    const updated = await db
      .select()
      .from(countries)
      .where(eq(countries.id, id));
    res.json({
      status: true,
      data: updated[0],
      message: "Country status updated",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update country status", errors: err });
  }
};

// Update language status
export const updateLanguageStatus = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "id and status are required" });
    }
    await db.update(languages).set({ status }).where(eq(languages.id, id));
    const updated = await db
      .select()
      .from(languages)
      .where(eq(languages.id, id));
    res.json({
      status: true,
      data: updated[0],
      message: "Language status updated",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update language status", errors: err });
  }
};

// Update currency status
export const updateCurrencyStatus = async (req: Request, res: Response) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) {
      return res.status(400).json({ error: "id and status are required" });
    }
    await db.update(currencies).set({ status }).where(eq(currencies.id, id));
    const updated = await db
      .select()
      .from(currencies)
      .where(eq(currencies.id, id));
    res.json({
      status: true,
      data: updated[0],
      message: "Currency status updated",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update currency status", errors: err });
  }
};

// Update country_language status
export const updateCountryLanguageStatus = async (
  req: Request,
  res: Response
) => {
  try {
    const { id, countryId, languageId, status } = req.body;
    if (!id || !countryId || !languageId || !status) {
      return res
        .status(400)
        .json({ error: "id, countryId, languageId, and status are required" });
    }
    // Check for duplicate combination (excluding current record)
    const duplicate = await db
      .select()
      .from(countryLanguages)
      .where(
        and(
          eq(countryLanguages.countryId, countryId),
          eq(countryLanguages.languageId, languageId),
          not(eq(countryLanguages.id, id))
        )
      );
    if (duplicate.length > 0) {
      return res
        .status(409)
        .json({ error: "This country-language combination already exists." });
    }
    // Update the record by id
    await db
      .update(countryLanguages)
      .set({ countryId, languageId, status })
      .where(eq(countryLanguages.id, id));
    const updated = await db
      .select()
      .from(countryLanguages)
      .where(eq(countryLanguages.id, id));
    res.json({
      status: true,
      data: updated[0],
      message: "Country-language status updated",
    });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to update country-language status", errors: err });
  }
};
