import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import type { MenuItemDTO } from "@/lib/serializers/menu-item";

export function MenuItemRow({
  id,
  eyebrow,
  title,
  description,
  items,
  isAuthenticated,
  viewAllHref = "/menu",
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  items: MenuItemDTO[];
  isAuthenticated: boolean;
  viewAllHref?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section id={id} className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between gap-4">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <Link
          href={viewAllHref}
          className="hidden shrink-0 items-center gap-1 text-sm font-medium text-brand hover:underline sm:flex"
        >
          View all <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} isAuthenticated={isAuthenticated} />
        ))}
      </div>
    </section>
  );
}
