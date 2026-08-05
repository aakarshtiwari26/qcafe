import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accent?: "brand" | "veg" | "nonveg";
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div
          className={cn(
            "flex size-8 items-center justify-center rounded-lg",
            accent === "veg" && "bg-veg/10 text-veg",
            accent === "nonveg" && "bg-nonveg/10 text-nonveg",
            (accent === "brand" || !accent) && "bg-brand/10 text-brand"
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-2.5 text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}
