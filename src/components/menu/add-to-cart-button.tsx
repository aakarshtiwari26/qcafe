"use client";

import { Plus, Minus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-mounted";
import type { MenuItemDTO } from "@/lib/serializers/menu-item";
import { toast } from "sonner";

export function AddToCartButton({ item, size = "sm" }: { item: MenuItemDTO; size?: "sm" | "default" }) {
  const { items, addItem, updateQuantity } = useCartStore();
  const mounted = useMounted();

  const cartItem = items.find((i) => i.menuItemId === item.id);
  const disabled = !item.isAvailable || !item.inStock;

  if (!mounted) {
    return <Button size={size} disabled className="rounded-full" />;
  }

  if (disabled) {
    return (
      <Button size={size} disabled variant="secondary" className="rounded-full">
        Sold out
      </Button>
    );
  }

  if (cartItem) {
    return (
      <div className="flex items-center gap-1 rounded-full border border-border bg-background">
        <Button
          size="icon-sm"
          variant="ghost"
          className="rounded-full"
          onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}
          aria-label="Decrease quantity"
        >
          <Minus className="size-3.5" />
        </Button>
        <span className="min-w-4 text-center text-sm font-semibold tabular-nums">{cartItem.quantity}</span>
        <Button
          size="icon-sm"
          variant="ghost"
          className="rounded-full"
          onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}
          aria-label="Increase quantity"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      size={size}
      className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
      onClick={() => {
        addItem({
          menuItemId: item.id,
          name: item.name,
          slug: item.slug,
          image: item.image,
          price: item.price,
          discountPrice: item.discountPrice,
          foodType: item.foodType,
        });
        toast.success(`Added ${item.name} to cart`);
      }}
    >
      <ShoppingBag className="size-3.5" /> Add
    </Button>
  );
}
