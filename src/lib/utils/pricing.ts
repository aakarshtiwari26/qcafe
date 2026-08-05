import type { CartItem } from "@/store/cart-store";
import { cartSubtotal } from "@/store/cart-store";

export function computeOrderPreview(items: CartItem[], deliveryFee: number, taxPercent: number) {
  const subtotal = cartSubtotal(items);
  const taxAmount = subtotal > 0 ? Math.round((subtotal * taxPercent) / 100) : 0;
  const effectiveDeliveryFee = subtotal > 0 ? deliveryFee : 0;
  const total = subtotal + taxAmount + effectiveDeliveryFee;
  return { subtotal, taxAmount, deliveryFee: effectiveDeliveryFee, total };
}
