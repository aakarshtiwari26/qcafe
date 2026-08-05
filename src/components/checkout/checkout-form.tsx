"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Loader2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { OrderSummary } from "@/components/cart/order-summary";
import { createOrderSchema, type CreateOrderInput } from "@/lib/validators/order";
import { apiFetch, ApiClientError } from "@/lib/api/client";
import { useCartStore } from "@/store/cart-store";
import { useMounted } from "@/hooks/use-mounted";
import { computeOrderPreview } from "@/lib/utils/pricing";
import type { HostelDTO } from "@/lib/serializers/hostel";
import type { IOrder } from "@/models";

export function CheckoutForm({
  hostels,
  defaultHostelId,
  defaultPhone,
  deliveryFee,
  taxPercent,
}: {
  hostels: HostelDTO[];
  defaultHostelId?: string;
  defaultPhone?: string;
  deliveryFee: number;
  taxPercent: number;
}) {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const mounted = useMounted();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Omit<CreateOrderInput, "items">>({
    resolver: zodResolver(createOrderSchema.omit({ items: true })),
    defaultValues: { hostelId: defaultHostelId, contactPhone: defaultPhone },
  });

  async function onSubmit(values: Omit<CreateOrderInput, "items">) {
    setServerError(null);
    try {
      const order = await apiFetch<IOrder>("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          ...values,
          items: items.map((i) => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
        }),
      });
      clearCart();
      router.push(`/orders/${order.orderId}`);
    } catch (err) {
      setServerError(err instanceof ApiClientError ? err.message : "Something went wrong placing your order");
    }
  }

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        description="Add items to your cart before checking out."
        action={
          <Button asChild className="rounded-full bg-brand text-brand-foreground hover:bg-brand/90">
            <Link href="/menu">Browse menu</Link>
          </Button>
        }
      />
    );
  }

  const preview = computeOrderPreview(items, deliveryFee, taxPercent);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {serverError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {serverError}
          </div>
        )}

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="text-sm font-semibold">Delivery details</h2>

          <div className="mt-4 grid grid-cols-2 gap-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="hostelId">Hostel</Label>
              <Controller
                name="hostelId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="hostelId" className="w-full">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map((h) => (
                        <SelectItem key={h.id} value={h.id}>
                          {h.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.hostelId && <p className="text-xs text-destructive">{errors.hostelId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roomNumber">Room number</Label>
              <Input id="roomNumber" placeholder="e.g. 214" {...register("roomNumber")} />
              {errors.roomNumber && <p className="text-xs text-destructive">{errors.roomNumber.message}</p>}
            </div>
          </div>

          <div className="mt-3.5 space-y-1.5">
            <Label htmlFor="landmark">Landmark (optional)</Label>
            <Input id="landmark" placeholder="Near the common room" {...register("landmark")} />
          </div>

          <div className="mt-3.5 space-y-1.5">
            <Label htmlFor="contactPhone">Contact phone</Label>
            <Input id="contactPhone" type="tel" inputMode="numeric" {...register("contactPhone")} />
            {errors.contactPhone && <p className="text-xs text-destructive">{errors.contactPhone.message}</p>}
          </div>

          <div className="mt-3.5 space-y-1.5">
            <Label htmlFor="customerNotes">Order notes (optional)</Label>
            <Textarea id="customerNotes" placeholder="Any special instructions?" rows={2} {...register("customerNotes")} />
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="text-sm font-semibold">Payment method</h2>
          <div className="mt-3 flex items-center gap-2.5 rounded-xl border border-brand/40 bg-brand/5 px-3.5 py-3 text-sm font-medium">
            <span className="flex size-2 rounded-full bg-brand" /> Cash on Delivery
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Online payments are coming soon.</p>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="sticky top-24 rounded-2xl border border-border/60 bg-card p-5">
          <h2 className="mb-4 text-sm font-semibold">Order summary</h2>
          <ul className="mb-4 space-y-1.5 text-sm text-muted-foreground">
            {items.map((item) => (
              <li key={item.menuItemId} className="flex justify-between gap-2">
                <span className="truncate">
                  {item.quantity} &times; {item.name}
                </span>
              </li>
            ))}
          </ul>
          <OrderSummary
            subtotal={preview.subtotal}
            deliveryFee={preview.deliveryFee}
            taxAmount={preview.taxAmount}
            total={preview.total}
            taxPercent={taxPercent}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="mt-5 w-full rounded-full bg-brand text-brand-foreground hover:bg-brand/90"
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            Place order
          </Button>
        </div>
      </div>
    </form>
  );
}
