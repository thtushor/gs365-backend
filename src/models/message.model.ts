import { db } from "../db/connection";
import { messages, NewMessage } from "../db/schema/messages";
import { eq, and, inArray, aliasedTable, ne } from "drizzle-orm";
import { ChatModel } from "./chat.model"; // Import ChatModel
import { adminUsers, chats, users } from "../db/schema";

export class MessageModel {
  static async createMessage(newMessage: NewMessage) {
    const [message] = await db.insert(messages).values(newMessage);
    return message;
  }

  static async getMessagesByChatId(chatId: number) {
    return await db.query.messages.findMany({
      where: eq(messages.chatId, chatId),
      with: {
        senderUser: true,
        senderAdmin: true,
      },
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });
  }

  static async markMessagesAsRead(chatId: number, senderType: "user" | "admin" | "guest" | "system") {
    const [updatedMessages] = await db
      .update(messages)
      .set({ isRead: true, updatedAt: new Date() })
      .where(and(eq(messages.chatId, chatId), eq(messages.senderType, senderType)));
    return updatedMessages;
  }

  static async getMessagesBySenderIdAndType(senderId: number, senderType: "user" | "admin") {
    return await db.query.messages.findMany({
      where: and(eq(messages.senderId, senderId), eq(messages.senderType, senderType)),
      with: {
        senderUser: true,
        senderAdmin: true,
      },
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });
  }

  static async getMessagesByGuestSenderId(guestSenderId: string) {
    const getChatIds = await db.query.chats.findMany({
      where: eq(chats.guestId, guestSenderId)
    }).then((res) => res.map((item) => item?.id))


    return await db.query.messages.findMany({
      where: inArray(messages.chatId, getChatIds.filter((item) => Boolean(item))),
      with: {
        senderAdmin: true,
        senderUser: true,
      },
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });
  }

  static async getMessagesByUserOrAdminId(id: number | string, type: "user" | "admin" | "guest") {
   
    const senderUserTable = aliasedTable(users,"senderUserTable");
    const senderUserAdminTable = aliasedTable(adminUsers,"senderAdminTable");

    const whereCondition = [];
    if (type === "user") {
      // await db.update(chats).set({
      //   status:"open"
      // })
      // .where(and(eq(chats.userId,id as number), ne(chats.status,"open")))

      whereCondition.push(eq(chats.userId,id as number));
    }
    if (type === "admin") {
      whereCondition.push(eq(chats.adminUserId,id as number));
      // await db.update(chats).set({
      //   status:"open"
      // })
      // .where(and(eq(chats.adminUserId,id as number), ne(chats.status,"open")))
    }
    if (type === "guest") {
      whereCondition.push(eq(chats.guestId,id as string));

      // await db.update(chats).set({
      //   status:"open"
      // })
      // .where(and(eq(chats.guestId,id as string), ne(chats.status,"open")))
    }

    const messagesData = await db
    .select({
      id:messages.id,
      chatId:messages.chatId,
      senderId:messages.senderId,
      senderType:messages.senderType,
      content:messages.content,
      attachmentUrl:messages.attachmentUrl,
      guestSenderId:messages.guestSenderId,
      isRead:messages.isRead,
      createdAt:messages.createdAt,
      updatedAt:messages.updatedAt,
      senderUser:senderUserTable,
      senderAdmin:senderUserAdminTable,
      chat:chats,
    })
    .from(messages)
    .leftJoin(chats,eq(chats.id,messages.chatId))
    .leftJoin(users,eq(users.id,chats.userId))
    .leftJoin(adminUsers,eq(adminUsers.id,chats.adminUserId))
    .leftJoin(senderUserAdminTable,and(eq(senderUserAdminTable.id,messages.senderId),eq(messages.senderType,"admin")))
    .leftJoin(senderUserTable,and(eq(senderUserTable.id,messages.senderId),eq(messages.senderType,"user")))
    .where(and(...whereCondition))

    return messagesData;
    
  }
}
