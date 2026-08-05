import crypto from "crypto";
import { ORDER_ID_PREFIX } from "@/constants";
import { Order } from "@/models";

// Excludes visually ambiguous characters (0/O, 1/I/L) — order IDs get read
// aloud at pickup counters and typed into a "track my order" box.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function randomSegment(length: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += ALPHABET[crypto.randomInt(0, ALPHABET.length)];
  }
  return out;
}

/** Generates a short, human-friendly, guaranteed-unique order ID like QC-8K4P7. */
export async function generateUniqueOrderId(): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const candidate = `${ORDER_ID_PREFIX}-${randomSegment(5)}`;
    const exists = await Order.exists({ orderId: candidate });
    if (!exists) return candidate;
  }
  throw new Error("Failed to generate a unique order ID after 10 attempts");
}
