"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsModel = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const connection_1 = require("../db/connection");
const settings_1 = require("../db/schema/settings");
exports.SettingsModel = {
    async getAll() {
        return connection_1.db.select().from(settings_1.settings);
    },
    async getById(id) {
        return connection_1.db.select().from(settings_1.settings).where((0, drizzle_orm_1.eq)(settings_1.settings.id, id));
    },
    async getFirst() {
        const result = await connection_1.db.select().from(settings_1.settings).limit(1);
        return result[0] || null;
    },
    async create(data) {
        return connection_1.db.insert(settings_1.settings).values(data);
    },
    async update(id, data) {
        return connection_1.db.update(settings_1.settings).set(data).where((0, drizzle_orm_1.eq)(settings_1.settings.id, id));
    },
    async updateFirst(data) {
        const firstSetting = await this.getFirst();
        if (!firstSetting) {
            return this.create(data);
        }
        return this.update(firstSetting.id, data);
    },
    async delete(id) {
        return connection_1.db.delete(settings_1.settings).where((0, drizzle_orm_1.eq)(settings_1.settings.id, id));
    },
    async getDefaultTurnover() {
        const setting = await this.getFirst();
        return setting?.defaultTurnover || 0;
    },
    async setDefaultTurnover(value) {
        return this.updateFirst({ defaultTurnover: value });
    },
};
