import { accounts } from "../schema/accounts";

export const accountsSeed = [
  {
    user_id: 1,
    currency_id: 1,
    account_type_id: 1, // wallet
    name: "Main Wallet",
    account_number: "WALLET-12345",
    holder_name: "John Doe",
    provider: "PayPal",
    is_primary: true,
    is_verified: true,
    status: "active",
  },
  {
    user_id: 1,
    currency_id: 1,
    account_type_id: 2, // bank
    name: "Bank Account",
    account_number: "BANK-98765",
    holder_name: "John Doe",
    provider: "Chase",
    swift_code: "CHASUS33XXX",
    iban: "US12345678901234567890",
    is_primary: false,
    is_verified: false,
    status: "active",
  },
  {
    user_id: 2,
    currency_id: 2,
    account_type_id: 3, // crypto
    name: "Crypto Wallet",
    wallet_address: "0x1234567890abcdef",
    network: "Ethereum",
    is_primary: true,
    is_verified: false,
    status: "inactive",
  },
];

export async function seedAccounts(db: any) {
  for (const acc of accountsSeed) {
    await db.insert(accounts).values(acc).onDuplicateKeyUpdate({
      set: acc,
    });
  }
}
