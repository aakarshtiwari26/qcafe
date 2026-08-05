import type { Metadata } from "next";
import { getRestaurantSettings } from "@/services/settings.service";
import { RestaurantSettingsForm } from "@/components/admin/restaurant-settings-form";

export const metadata: Metadata = { title: "Restaurant Settings" };

export default async function AdminSettingsPage() {
  const settings = await getRestaurantSettings();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="mb-5 text-sm font-semibold">Restaurant Settings</h2>
      <RestaurantSettingsForm
        defaultValues={{
          name: settings.name,
          tagline: settings.tagline,
          description: settings.description,
          openingTime: settings.openingTime,
          closingTime: settings.closingTime,
          contactNumber: settings.contactNumber,
          whatsappNumber: settings.whatsappNumber,
          email: settings.email,
          address: settings.address,
          avgResponseTimeMinutes: settings.avgResponseTimeMinutes,
          avgDeliveryTimeMinutes: settings.avgDeliveryTimeMinutes,
          deliveryCharges: settings.deliveryCharges,
          minOrderValue: settings.minOrderValue,
          taxPercent: settings.taxPercent,
          isOpen: settings.isOpen,
          logo: settings.logo?.url ? { url: settings.logo.url, fileId: settings.logo.fileId } : undefined,
          banner: settings.banner?.url ? { url: settings.banner.url, fileId: settings.banner.fileId } : undefined,
        }}
      />
    </div>
  );
}
