import { db } from "../db/connection";
import { autoReplies, NewAutoReply } from "../db/schema/autoReplies";
import { eq } from "drizzle-orm";

export class AutoReplyModel {
  static async createAutoReply(newAutoReply: NewAutoReply) {
    const [autoReply] = await db.insert(autoReplies).values(newAutoReply);
    return autoReply;
  }

  static async getAllAutoReplies() {
    return await db.query.autoReplies.findMany();
  }

  static async getAutoReplyById(id: number) {
    return await db.query.autoReplies.findFirst({
      where: eq(autoReplies.id, id),
    });
  }

  static async getAutoReplyByKeyword(keyword: string) {
    return await db.query.autoReplies.findFirst({
      where: eq(autoReplies.keyword, keyword),
    });
  }

  static async updateAutoReply(id: number, updatedFields: Partial<NewAutoReply>) {
    const [updatedAutoReply] = await db
      .update(autoReplies)
      .set({ ...updatedFields, updatedAt: new Date() })
      .where(eq(autoReplies.id, id));
    return updatedAutoReply;
  }

  static async deleteAutoReply(id: number) {
    const [deletedAutoReply] = await db.delete(autoReplies).where(eq(autoReplies.id, id));
    return deletedAutoReply;
  }
}
