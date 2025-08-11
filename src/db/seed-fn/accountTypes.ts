import { accountTypes } from "../schema/accounts";

export const accountTypesSeed = [
  {
    name: "wallet",
    description: "E-wallet account",
    status: "active",
  },
  {
    name: "bank",
    description: "Bank account",
    status: "active",
  },
  {
    name: "crypto",
    description: "Cryptocurrency account",
    status: "active",
  },
];

export async function seedAccountTypes(db: any) {
  for (const type of accountTypesSeed) {
    await db.insert(accountTypes).values(type).onDuplicateKeyUpdate({
      set: type,
    });
  }
}
