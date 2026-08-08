import type { Metadata } from "next";
import { listReviewsForAdmin } from "@/services/review.service";
import { ReviewManager } from "@/components/admin/review-manager";

export const metadata: Metadata = { title: "Reviews" };

export default async function AdminReviewsPage() {
  const reviews = await listReviewsForAdmin();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <ReviewManager
        reviews={reviews.map((r) => ({
          id: String(r._id),
          customerName: r.customerName,
          detail: r.detail,
          quote: r.quote,
          rating: r.rating,
          isActive: r.isActive,
        }))}
      />
    </div>
  );
}
