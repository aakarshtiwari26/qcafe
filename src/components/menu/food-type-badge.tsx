import { cn } from "@/lib/utils";
import type { FoodType } from "@/constants";
import { FOOD_TYPE } from "@/constants";

const LABEL: Record<FoodType, string> = {
  [FOOD_TYPE.VEG]: "Veg",
  [FOOD_TYPE.NON_VEG]: "Non-veg",
  [FOOD_TYPE.EGG]: "Contains egg",
};

export function FoodTypeBadge({ foodType, className }: { foodType: FoodType; className?: string }) {
  const isVeg = foodType === FOOD_TYPE.VEG;
  const colorClass = isVeg ? "border-veg text-veg" : "border-nonveg text-nonveg";

  return (
    <span
      title={LABEL[foodType]}
      aria-label={LABEL[foodType]}
      className={cn("inline-flex size-3.5 shrink-0 items-center justify-center border p-[2px]", colorClass, className)}
    >
      <span className={cn("size-full rounded-full", isVeg ? "bg-veg" : "bg-nonveg")} />
    </span>
  );
}
