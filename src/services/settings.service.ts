import { connectDB } from "@/lib/db/connect";
import { RestaurantSettings, type IRestaurantSettings } from "@/models";
import { getSiteConfig } from "@/config/site";
import type { RestaurantSettingsInput } from "@/lib/validators/user";

/** Seeds the singleton settings document from env defaults on first read. */
export async function getRestaurantSettings(): Promise<IRestaurantSettings> {
  await connectDB();
  const site = getSiteConfig();

  const settings = await RestaurantSettings.findOneAndUpdate(
    { key: "main" },
    {
      $setOnInsert: {
        key: "main",
        name: site.name,
        tagline: site.tagline,
        description: site.description,
        email: site.supportEmail,
        deliveryCharges: site.deliveryFee,
        minOrderValue: site.minOrderValue,
        taxPercent: site.taxPercent,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  return settings;
}

export async function updateRestaurantSettings(input: Partial<RestaurantSettingsInput>) {
  await connectDB();
  const settings = await RestaurantSettings.findOneAndUpdate(
    { key: "main" },
    { $set: input },
    { upsert: true, returnDocument: "after" }
  );
  return settings!;
}
