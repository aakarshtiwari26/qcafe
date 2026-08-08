import { Star } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { listActiveReviews } from "@/services/review.service";
import { cn } from "@/lib/utils";

export async function Testimonials() {
  const reviews = await listActiveReviews();
  if (reviews.length === 0) return null;

  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Reviews" title="What customers say" align="center" className="mx-auto" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {reviews.map((review) => (
            <figure key={String(review._id)} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex gap-0.5 text-brand">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn("size-3.5", i < review.rating ? "fill-brand" : "fill-none text-muted-foreground/40")} />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-foreground">&ldquo;{review.quote}&rdquo;</blockquote>
              <figcaption className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{review.customerName}</span>
                {review.detail && <> &middot; {review.detail}</>}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
