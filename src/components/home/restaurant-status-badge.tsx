"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { isRestaurantOpen } from "@/lib/utils/restaurant-hours";

// Ticks on its own so "Open now" / "Currently closed" flips the moment the schedule
// crosses over, without the visitor needing to reload the page.
export function RestaurantStatusBadge({
  isOpenToggle,
  openingTime,
  closingTime,
}: {
  isOpenToggle: boolean;
  openingTime: string;
  closingTime: string;
}) {
  const settings = { isOpen: isOpenToggle, openingTime, closingTime };
  const [open, setOpen] = useState(() => isRestaurantOpen(settings));

  useEffect(() => {
    const tick = () => setOpen(isRestaurantOpen({ isOpen: isOpenToggle, openingTime, closingTime }));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [isOpenToggle, openingTime, closingTime]);

  return (
    <Badge
      variant="secondary"
      className={`gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${open ? "text-veg" : "text-nonveg"}`}
    >
      <span className={`size-1.5 rounded-full ${open ? "bg-veg" : "bg-nonveg"}`} />
      {open ? "Open now" : "Currently closed"}
    </Badge>
  );
}
