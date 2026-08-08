import { ORDER_ID_PREFIX } from "@/constants";
import { Counter } from "@/models";

export async function generateUniqueOrderId(): Promise<string> {
  const counter = await Counter.findOneAndUpdate(
    { key: "order" },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return `${ORDER_ID_PREFIX}-${String(counter.seq).padStart(2, "0")}`;
}
