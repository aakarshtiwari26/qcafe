"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore, cartItemCount } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-mounted";

export function CartBadge() {
  const items = useCartStore((s) => s.items);
  const mounted = useMounted();

  const count = mounted ? cartItemCount(items) : 0;

  return (
    <Button variant="ghost" size="icon" className="relative size-9" asChild>
      <Link href="/cart" aria-label={`Cart, ${count} items`}>
        <ShoppingBag className="size-4.5" />
        {count > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-brand text-[10px] font-semibold text-brand-foreground">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </Link>
    </Button>
  );
}
