"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoReplyModel = void 0;
const connection_1 = require("../db/connection");
const autoReplies_1 = require("../db/schema/autoReplies");
const drizzle_orm_1 = require("drizzle-orm");
class AutoReplyModel {
    static async createAutoReply(newAutoReply) {
        const [autoReply] = await connection_1.db.insert(autoReplies_1.autoReplies).values(newAutoReply);
        return autoReply;
    }
    static async getAllAutoReplies() {
        return await connection_1.db.query.autoReplies.findMany();
    }
    static async getAutoReplyById(id) {
        return await connection_1.db.query.autoReplies.findFirst({
            where: (0, drizzle_orm_1.eq)(autoReplies_1.autoReplies.id, id),
        });
    }
    static async getAutoReplyByKeyword(keyword) {
        return await connection_1.db.query.autoReplies.findFirst({
            where: (0, drizzle_orm_1.eq)(autoReplies_1.autoReplies.keyword, keyword),
        });
    }
    static async updateAutoReply(id, updatedFields) {
        const [updatedAutoReply] = await connection_1.db
            .update(autoReplies_1.autoReplies)
            .set({ ...updatedFields, updatedAt: new Date() })
            .where((0, drizzle_orm_1.eq)(autoReplies_1.autoReplies.id, id));
        return updatedAutoReply;
    }
    static async deleteAutoReply(id) {
        const [deletedAutoReply] = await connection_1.db.delete(autoReplies_1.autoReplies).where((0, drizzle_orm_1.eq)(autoReplies_1.autoReplies.id, id));
        return deletedAutoReply;
    }
}
exports.AutoReplyModel = AutoReplyModel;
