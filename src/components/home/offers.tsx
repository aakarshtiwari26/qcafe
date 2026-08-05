import { Percent, Tag } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import type { ICoupon } from "@/models";

export function Offers({ coupons }: { coupons: ICoupon[] }) {
  if (coupons.length === 0) return null;

  return (
    <section id="specials-offers" className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Offers" title="Active offers" />
      <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coupons.map((coupon) => (
          <div
            key={String(coupon._id)}
            className="flex items-center gap-4 rounded-2xl border border-dashed border-brand/40 bg-brand/5 p-5"
          >
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-brand text-brand-foreground">
              {coupon.discountType === "percentage" ? <Percent className="size-5" /> : <Tag className="size-5" />}
            </div>
            <div className="min-w-0">
              <p className="font-mono text-sm font-bold tracking-wide">{coupon.code}</p>
              <p className="truncate text-xs text-muted-foreground">
                {coupon.description ??
                  (coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% off`
                    : `Flat ${coupon.discountValue} off`)}
                {coupon.minOrderValue > 0 && ` on orders above ${coupon.minOrderValue}`}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
