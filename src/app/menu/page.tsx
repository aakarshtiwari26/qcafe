import type { Metadata } from "next";
import { SearchX } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { listCategories, getCategoryBySlug } from "@/services/category.service";
import { listMenuItems } from "@/services/menu.service";
import { toMenuItemDTO } from "@/lib/serializers/menu-item";
import { toCategoryDTO } from "@/lib/serializers/category";
import { MenuFilters } from "@/components/menu/menu-filters";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { EmptyState } from "@/components/shared/empty-state";
import { PaginationControls } from "@/components/shared/pagination-controls";
import type { FoodType, ItemTag } from "@/constants";

export const metadata: Metadata = { title: "Menu" };

interface MenuPageProps {
  searchParams: Promise<{
    category?: string;
    tag?: string;
    foodType?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const params = await searchParams;
  const [session, categories, category] = await Promise.all([
    getSession(),
    listCategories(),
    params.category ? getCategoryBySlug(params.category) : Promise.resolve(null),
  ]);

  const { items, page, totalPages } = await listMenuItems({
    categoryId: category ? String(category._id) : undefined,
    tag: params.tag as ItemTag | undefined,
    foodType: params.foodType as FoodType | undefined,
    search: params.search,
    page: params.page ? Number(params.page) : 1,
    pageSize: 24,
  });

  let favoriteIds = new Set<string>();
  if (session) {
    await connectDB();
    const user = await User.findById(session.sub).select("favorites");
    if (user) favoriteIds = new Set(user.favorites.map(String));
  }

  const dtoItems = items.map(toMenuItemDTO);
  const buildHref = (p: number) => {
    const sp = new URLSearchParams();
    if (params.category) sp.set("category", params.category);
    if (params.tag) sp.set("tag", params.tag);
    if (params.foodType) sp.set("foodType", params.foodType);
    if (params.search) sp.set("search", params.search);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `/menu?${qs}` : "/menu";
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">Full Menu</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {category ? category.name : "All dishes"} &middot; {items.length ? `showing page ${page} of ${totalPages}` : "no results"}
        </p>
      </div>

      <MenuFilters categories={categories.map(toCategoryDTO)} />

      {dtoItems.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="No dishes found"
          description="Try a different search term or clear your filters."
          className="mt-8"
        />
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {dtoItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              isAuthenticated={Boolean(session)}
              isFavorite={favoriteIds.has(item.id)}
            />
          ))}
        </div>
      )}

      <PaginationControls page={page} totalPages={totalPages} buildHref={buildHref} />
    </div>
  );
}
