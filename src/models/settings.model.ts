import { eq } from "drizzle-orm";
import { db } from "../db/connection";
import { settings } from "../db/schema/settings";
import type { NewSettings } from "../db/schema/settings";

export const SettingsModel = {
  async getAll() {
    return db.select().from(settings);
  },

  async getById(id: number) {
    return db.select().from(settings).where(eq(settings.id, id));
  },

  async getFirst() {
    const result = await db.select().from(settings).limit(1);
    return result[0] || null;
  },

  async create(data: NewSettings) {
    return db.insert(settings).values(data);
  },

  async update(id: number, data: Partial<NewSettings>) {
    return db.update(settings).set(data).where(eq(settings.id, id));
  },

  async updateFirst(data: Partial<NewSettings>) {
    const firstSetting = await this.getFirst();
    if (!firstSetting) {
      return this.create(data as NewSettings);
    }
    return this.update(firstSetting.id, data);
  },

  async delete(id: number) {
    return db.delete(settings).where(eq(settings.id, id));
  },

  async getDefaultTurnover() {
    const setting = await this.getFirst();
    return setting?.defaultTurnover || 0;
  },

  async setDefaultTurnover(value: number) {
    return this.updateFirst({ defaultTurnover: value });
  },
};
