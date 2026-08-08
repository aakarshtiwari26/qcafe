import { connectDB } from "@/lib/db/connect";
import { RestaurantSettings, type IRestaurantSettings } from "@/models";
import { getSiteConfig } from "@/config/site";
import { cleanupReplacedImage } from "@/lib/imagekit/cleanup";
import type { RestaurantSettingsInput } from "@/lib/validators/user";

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
  const existing = await RestaurantSettings.findOne({ key: "main" });

  const settings = await RestaurantSettings.findOneAndUpdate(
    { key: "main" },
    { $set: input },
    { upsert: true, returnDocument: "after" }
  );

  if (existing) {
    if (input.logo !== undefined) await cleanupReplacedImage(existing.logo?.fileId, input.logo?.fileId);
    if (input.banner !== undefined) await cleanupReplacedImage(existing.banner?.fileId, input.banner?.fileId);
  }

  return settings!;
}
