"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FoodTypeBadge } from "@/components/menu/food-type-badge";
import { formatCurrency } from "@/lib/utils/format";
import { useCartStore, type CartItem } from "@/store/cart-store";

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore();
  const unitPrice = item.discountPrice ?? item.price;

  return (
    <div className="flex gap-3.5 py-4">
      <Link href={`/menu/${item.slug}`} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        {item.image && <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <FoodTypeBadge foodType={item.foodType} />
            <Link href={`/menu/${item.slug}`} className="truncate text-sm font-semibold hover:underline">
              {item.name}
            </Link>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">{formatCurrency(unitPrice)} each</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full border border-border">
            <Button size="icon-sm" variant="ghost" className="rounded-full" onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}>
              <Minus className="size-3.5" />
            </Button>
            <span className="min-w-5 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
            <Button size="icon-sm" variant="ghost" className="rounded-full" onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}>
              <Plus className="size-3.5" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold">{formatCurrency(unitPrice * item.quantity)}</span>
            <Button
              size="icon-sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => removeItem(item.menuItemId)}
              aria-label={`Remove ${item.name}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
