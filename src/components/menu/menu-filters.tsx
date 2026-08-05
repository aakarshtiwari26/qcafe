"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FOOD_TYPE, ITEM_TAG } from "@/constants";
import type { CategoryDTO } from "@/lib/serializers/category";

const TAG_OPTIONS = [
  { value: ITEM_TAG.POPULAR, label: "Popular" },
  { value: ITEM_TAG.RECOMMENDED, label: "Recommended" },
  { value: ITEM_TAG.BEST_SELLER, label: "Best Seller" },
  { value: ITEM_TAG.TODAYS_SPECIAL, label: "Today's Special" },
];

const FOOD_TYPE_OPTIONS = [
  { value: FOOD_TYPE.VEG, label: "Veg" },
  { value: FOOD_TYPE.NON_VEG, label: "Non-veg" },
  { value: FOOD_TYPE.EGG, label: "Egg" },
];

export function MenuFilters({ categories }: { categories: CategoryDTO[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("search") ?? "");

  const activeCategory = searchParams.get("category");
  const activeTag = searchParams.get("tag");
  const activeFoodType = searchParams.get("foodType");

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete("page");
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    },
    [pathname, router, searchParams]
  );

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParam("search", search.trim() || null);
  }

  const hasActiveFilters = activeCategory || activeTag || activeFoodType || searchParams.get("search");

  return (
    <div className="sticky top-16 z-40 -mx-4 border-b border-border/60 bg-background/95 px-4 py-4 backdrop-blur-lg sm:mx-0 sm:rounded-2xl sm:border sm:px-5">
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dishes..."
          className="rounded-full pl-9"
        />
      </form>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <FilterChip active={!activeCategory} onClick={() => updateParam("category", null)}>
          All
        </FilterChip>
        {categories.map((c) => (
          <FilterChip key={c.slug} active={activeCategory === c.slug} onClick={() => updateParam("category", c.slug)}>
            {c.name}
          </FilterChip>
        ))}
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        {FOOD_TYPE_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            size="xs"
            active={activeFoodType === opt.value}
            onClick={() => updateParam("foodType", activeFoodType === opt.value ? null : opt.value)}
          >
            {opt.label}
          </FilterChip>
        ))}
        <span className="mx-1 h-4 w-px bg-border" />
        {TAG_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            size="xs"
            active={activeTag === opt.value}
            onClick={() => updateParam("tag", activeTag === opt.value ? null : opt.value)}
          >
            {opt.label}
          </FilterChip>
        ))}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto gap-1 text-muted-foreground"
            onClick={() => {
              setSearch("");
              router.push(pathname);
            }}
          >
            <X className="size-3" /> Clear
          </Button>
        )}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  size = "sm",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  size?: "xs" | "sm";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 whitespace-nowrap rounded-full border font-medium transition-colors",
        size === "xs" ? "px-3 py-1 text-xs" : "px-3.5 py-1.5 text-sm",
        active
          ? "border-brand bg-brand text-brand-foreground"
          : "border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
