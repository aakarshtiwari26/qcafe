"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { CartItemRow } from "./cart-item-row";
import { OrderSummary } from "./order-summary";
import { useCartStore } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-mounted";
import { computeOrderPreview } from "@/lib/utils/pricing";
import { formatCurrency } from "@/lib/utils/format";

export function CartView({
  deliveryFee,
  taxPercent,
  minOrderValue,
}: {
  deliveryFee: number;
  taxPercent: number;
  minOrderValue: number;
}) {
  const items = useCartStore((s) => s.items);
  const mounted = useMounted();

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add something delicious from the menu to get started."
        action={
          <Button asChild className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            <Link href="/menu">Browse menu</Link>
          </Button>
        }
      />
    );
  }

  const preview = computeOrderPreview(items, deliveryFee, taxPercent);
  const belowMinimum = preview.subtotal < minOrderValue;

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="rounded-2xl border border-border/60 bg-card px-4 divide-y divide-border">
          {items.map((item) => (
            <CartItemRow key={item.menuItemId} item={item} />
          ))}
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-border/60 bg-card p-5">
          <div className="relative mb-4">
            <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Coupon code (coming soon)" disabled className="pl-9" />
          </div>

          <OrderSummary
            subtotal={preview.subtotal}
            deliveryFee={preview.deliveryFee}
            taxAmount={preview.taxAmount}
            total={preview.total}
            taxPercent={taxPercent}
          />

          {belowMinimum && (
            <p className="mt-3 rounded-lg bg-nonveg/10 px-3 py-2 text-xs text-nonveg">
              Add {formatCurrency(minOrderValue - preview.subtotal)} more to reach the {formatCurrency(minOrderValue)} minimum order.
            </p>
          )}

          <Button
            asChild={!belowMinimum}
            disabled={belowMinimum}
            size="lg"
            className="mt-5 w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {belowMinimum ? (
              <span>Proceed to checkout</span>
            ) : (
              <Link href="/checkout">
                Proceed to checkout <ArrowRight className="size-4" />
              </Link>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
