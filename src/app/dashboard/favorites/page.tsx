import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { listFavorites } from "@/services/profile.service";
import { toMenuItemDTO } from "@/lib/serializers/menu-item";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { EmptyState } from "@/components/shared/empty-state";
import type { IMenuItem } from "@/models";

export const metadata: Metadata = { title: "Favorites" };

export default async function FavoritesPage() {
  const session = await getSession();
  const favorites = await listFavorites(session!.sub);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="text-sm font-semibold">Favorites</h2>

      {favorites.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No favorites yet"
          description="Tap the heart on any dish to save it here."
          action={
            <Link href="/menu" className="text-sm font-medium text-brand hover:underline">
              Browse the menu
            </Link>
          }
          className="mt-4 border-none py-14"
        />
      ) : (
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {favorites.map((item) => (
            <MenuItemCard
              key={String(item._id)}
              item={toMenuItemDTO(item as unknown as IMenuItem)}
              isAuthenticated
              isFavorite
            />
          ))}
        </div>
      )}
    </div>
  );
}
