import crypto from "crypto";
import { ORDER_ID_PREFIX } from "@/constants";
import { Order } from "@/models";

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function randomSegment(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[crypto.randomInt(0, ALPHABET.length)];
  }
  return out;
}

export async function generateUniqueOrderId(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${ORDER_ID_PREFIX}-${randomSegment(5)}`;
    const exists = await Order.exists({ orderId: candidate });
    if (!exists) return candidate;
  }
  throw new Error("Failed to generate a unique order ID after 10 attempts");
}
