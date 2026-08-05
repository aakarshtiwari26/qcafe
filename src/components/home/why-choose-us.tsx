import { Timer, ShieldCheck, Salad, Wallet } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";

const FEATURES = [
  { icon: Timer, title: "Fast delivery", description: "Hot food at your door in minutes, not hours." },
  { icon: Salad, title: "Fresh, made-to-order", description: "Nothing is pre-made — every dish is cooked when you order." },
  { icon: ShieldCheck, title: "Secure & reliable", description: "Verified accounts, tracked orders, real support." },
  { icon: Wallet, title: "Fair pricing", description: "No hidden markups — transparent totals every time." },
];

export function WhyChooseUs() {
  return (
    <section className="border-y border-border/60 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Why us" title="Built for a better order" align="center" className="mx-auto" />
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-6 text-center">
              <div className="flex size-11 items-center justify-center rounded-xl bg-brand/10">
                <Icon className="size-5 text-brand" />
              </div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
