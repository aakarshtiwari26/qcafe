import Link from "next/link";
import Image from "next/image";
import { Flame, Clock } from "lucide-react";
import { FoodTypeBadge } from "./food-type-badge";
import { AddToCartButton } from "./add-to-cart-button";
import { FavoriteButton } from "./favorite-button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils/format";
import { SPICE_LEVEL, ITEM_TAG } from "@/constants";
import type { MenuItemDTO } from "@/lib/serializers/menu-item";

const TAG_LABEL: Partial<Record<string, string>> = {
  [ITEM_TAG.POPULAR]: "Popular",
  [ITEM_TAG.RECOMMENDED]: "Recommended",
  [ITEM_TAG.BEST_SELLER]: "Best Seller",
  [ITEM_TAG.TODAYS_SPECIAL]: "Today's Special",
};

export function MenuItemCard({
  item,
  isAuthenticated,
  isFavorite,
}: {
  item: MenuItemDTO;
  isAuthenticated: boolean;
  isFavorite?: boolean;
}) {
  const primaryTag = item.tags[0];
  const soldOut = !item.isAvailable || !item.inStock;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-lg">
      <Link href={`/menu/${item.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-transform duration-300 group-hover:scale-105 ${soldOut ? "opacity-50 grayscale" : ""}`}
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground text-sm">No image</div>
        )}
        {primaryTag && (
          <Badge className="absolute left-2.5 top-2.5 bg-background/90 text-foreground backdrop-blur-sm hover:bg-background/90">
            {TAG_LABEL[primaryTag]}
          </Badge>
        )}
        <div className="absolute right-2.5 top-2.5">
          <FavoriteButton menuItemId={item.id} initialFavorite={isFavorite} isAuthenticated={isAuthenticated} />
        </div>
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/40">
            <Badge variant="secondary" className="text-xs">
              Sold out
            </Badge>
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3.5">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/menu/${item.slug}`} className="min-w-0">
            <div className="flex items-center gap-1.5">
              <FoodTypeBadge foodType={item.foodType} />
              <h3 className="truncate text-sm font-semibold">{item.name}</h3>
            </div>
          </Link>
        </div>

        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{item.description}</p>

        <div className="mt-0.5 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" /> {item.prepTimeMinutes} min
          </span>
          {item.spiceLevel !== SPICE_LEVEL.NONE && (
            <span className="flex items-center gap-1 capitalize">
              <Flame className="size-3" /> {item.spiceLevel}
            </span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold">{formatCurrency(item.discountPrice ?? item.price)}</span>
            {item.discountPrice && (
              <span className="text-xs text-muted-foreground line-through">{formatCurrency(item.price)}</span>
            )}
          </div>
          <AddToCartButton item={item} />
        </div>
      </div>
    </div>
  );
}
