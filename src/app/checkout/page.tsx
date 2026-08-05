import type { Metadata } from "next";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { listHostels } from "@/services/hostel.service";
import { getRestaurantSettings } from "@/services/settings.service";
import { toHostelDTO } from "@/lib/serializers/hostel";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await getSession();
  await connectDB();

  const [user, hostels, settings] = await Promise.all([
    session ? User.findById(session.sub) : null,
    listHostels(),
    getRestaurantSettings(),
  ]);

  const defaultAddress = user?.addresses.find((a) => a.isDefault) ?? user?.addresses[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-[28px]">Checkout</h1>
      <CheckoutForm
        hostels={hostels.map(toHostelDTO)}
        defaultHostelId={defaultAddress ? String(defaultAddress.hostel) : user?.hostel ? String(user.hostel) : undefined}
        defaultPhone={user?.phone}
        deliveryFee={settings.deliveryCharges}
        taxPercent={settings.taxPercent}
      />
    </div>
  );
}
