import { Star } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";

const TESTIMONIALS = [
  { name: "Ananya R.", detail: "Gavaskar Boys Hostel", quote: "Consistently fast, and the food actually arrives hot. My go-to for late-night study sessions." },
  { name: "Rohan K.", detail: "Virat Boys Hostel", quote: "Ordering takes seconds and tracking is spot on — I know exactly when to head down." },
  { name: "Meera S.", detail: "Mithali Girls Hostel", quote: "Portion sizes are generous and the thali options are genuinely good value." },
];

export function Testimonials() {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Reviews" title="What customers say" align="center" className="mx-auto" />
        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-6">
              <div className="flex gap-0.5 text-brand">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-brand" />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-foreground">&ldquo;{t.quote}&rdquo;</blockquote>
              <figcaption className="mt-1 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{t.name}</span> &middot; {t.detail}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
