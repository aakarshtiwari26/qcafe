"use client";

import { useState } from "react";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-mounted";
import type { MenuItemDTO } from "@/lib/serializers/menu-item";
import { toast } from "sonner";

export function ItemDetailActions({ item }: { item: MenuItemDTO }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const mounted = useMounted();
  const [qty, setQty] = useState(1);

  const cartItem = items.find((i) => i.menuItemId === item.id);
  const disabled = !item.isAvailable || !item.inStock;

  if (!mounted) return <div className="h-11" />;

  if (disabled) {
    return (
      <Button size="lg" disabled variant="secondary" className="w-full rounded-full sm:w-auto">
        Currently sold out
      </Button>
    );
  }

  if (cartItem) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-border">
          <Button size="icon" variant="ghost" className="rounded-full" onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}>
            <Minus className="size-4" />
          </Button>
          <span className="min-w-6 text-center font-semibold tabular-nums">{cartItem.quantity}</span>
          <Button size="icon" variant="ghost" className="rounded-full" onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}>
            <Plus className="size-4" />
          </Button>
        </div>
        <span className="text-sm text-muted-foreground">in your cart</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 rounded-full border border-border">
        <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setQty((q) => Math.max(1, q - 1))}>
          <Minus className="size-4" />
        </Button>
        <span className="min-w-6 text-center font-semibold tabular-nums">{qty}</span>
        <Button size="icon" variant="ghost" className="rounded-full" onClick={() => setQty((q) => q + 1)}>
          <Plus className="size-4" />
        </Button>
      </div>
      <Button
        size="lg"
        className="flex-1 rounded-full bg-brand text-brand-foreground hover:bg-brand/90 sm:flex-none"
        onClick={() => {
          addItem(
            {
              menuItemId: item.id,
              name: item.name,
              slug: item.slug,
              image: item.image,
              price: item.price,
              discountPrice: item.discountPrice,
              foodType: item.foodType,
            },
            qty
          );
          toast.success(`Added ${qty} × ${item.name} to cart`);
        }}
      >
        <ShoppingBag className="size-4" /> Add to cart
      </Button>
    </div>
  );
}
