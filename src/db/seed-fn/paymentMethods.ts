import { PaymentMethods, paymentMethods } from "../schema/paymentMethods";
import { db } from "../connection";
import { sql } from "drizzle-orm";
import { PaymentMethodTypes, paymentMethodTypes } from "../schema";

export async function seedPaymentMethods() {
  const types = [
    { id: 1, name: "Local bank", status: "active" },
    { id: 2, name: "E wallet", status: "active" },
    { id: 3, name: "Crypto", status: "active" },
    { id: 4, name: "International", status: "active" },
  ];

  try {
    await db
      .insert(paymentMethods)
      .values(types as (typeof PaymentMethods)[])
      .onDuplicateKeyUpdate({
        set: {
          id: sql`values(${paymentMethods.id})`,
          name: sql`values(${paymentMethods.name})`,
          status: sql`values(${paymentMethods.status})`,
        },
      });
    console.log("✅ Payment methods seeded successfully!");
  } catch (e) {
    // Ignore duplicate entry errors
  }
}

export async function seedPaymentMethodTypes() {
  const types = [
    { id: 1, name: "Agent", paymentMethodId: 2, status: "active" },
    { id: 2, name: "Personal", paymentMethodId: 2, status: "active" },
    { id: 3, name: "USDT", paymentMethodId: 3, status: "active" },
    { id: 4, name: "Credit Card", paymentMethodId: 4, status: "active" },
    { id: 5, name: "Debit Card", paymentMethodId: 4, status: "active" },
  ];

  try {
    await db
      .insert(paymentMethodTypes)
      .values(types as (typeof PaymentMethodTypes)[])
      .onDuplicateKeyUpdate({
        set: {
          id: sql`values(${paymentMethodTypes.id})`,
          name: sql`values(${paymentMethodTypes.name})`,
          status: sql`values(${paymentMethodTypes.status})`,
        },
      });
    console.log("✅ Payment method type seeded successfully!");
  } catch (e) {
    // Ignore duplicate entry errors
  }
}
