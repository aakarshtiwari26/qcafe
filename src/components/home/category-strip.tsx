import Link from "next/link";
import Image from "next/image";
import { UtensilsCrossed } from "lucide-react";
import { SectionHeading } from "@/components/shared/section-heading";
import type { ICategory } from "@/models";

export function CategoryStrip({ categories }: { categories: ICategory[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Browse" title="Shop by category" />
      <div className="mt-7 flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {categories.map((category) => (
          <Link
            key={String(category._id)}
            href={`/menu?category=${category.slug}`}
            className="group flex w-24 shrink-0 flex-col items-center gap-2.5 sm:w-28"
          >
            <div className="relative flex size-20 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-muted transition-transform group-hover:scale-105 sm:size-24">
              {category.image?.url ? (
                <Image src={category.image.url} alt={category.name} fill sizes="96px" className="object-cover" />
              ) : (
                <UtensilsCrossed className="size-6 text-muted-foreground" />
              )}
            </div>
            <span className="text-center text-xs font-medium leading-tight">{category.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
