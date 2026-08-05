import type { Metadata } from "next";
import { getRestaurantSettings } from "@/services/settings.service";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  const settings = await getRestaurantSettings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight sm:text-[28px]">Your Cart</h1>
      <CartView
        deliveryFee={settings.deliveryCharges}
        taxPercent={settings.taxPercent}
        minOrderValue={settings.minOrderValue}
      />
    </div>
  );
}
