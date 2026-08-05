import type { Metadata } from "next";
import { listCouponsForAdmin } from "@/services/coupon.service";
import { CouponManager } from "@/components/admin/coupon-manager";

export const metadata: Metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const coupons = await listCouponsForAdmin();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <CouponManager
        coupons={coupons.map((c) => ({
          id: String(c._id),
          code: c.code,
          description: c.description,
          discountType: c.discountType,
          discountValue: c.discountValue,
          isActive: c.isActive,
          usedCount: c.usedCount,
          usageLimit: c.usageLimit,
        }))}
      />
    </div>
  );
}
