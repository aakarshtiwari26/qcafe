import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Flame, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { getMenuItemBySlug, listMenuItems } from "@/services/menu.service";
import { toMenuItemDTO } from "@/lib/serializers/menu-item";
import { formatCurrency } from "@/lib/utils/format";
import { FoodTypeBadge } from "@/components/menu/food-type-badge";
import { FavoriteButton } from "@/components/menu/favorite-button";
import { ItemDetailActions } from "@/components/menu/item-detail-actions";
import { MenuItemCard } from "@/components/menu/menu-item-card";
import { Badge } from "@/components/ui/badge";
import { NotFoundError } from "@/lib/api/errors";
import { SPICE_LEVEL, ITEM_TAG } from "@/constants";

const TAG_LABEL: Partial<Record<string, string>> = {
  [ITEM_TAG.POPULAR]: "Popular",
  [ITEM_TAG.RECOMMENDED]: "Recommended",
  [ITEM_TAG.BEST_SELLER]: "Best Seller",
  [ITEM_TAG.TODAYS_SPECIAL]: "Today's Special",
};

interface ItemPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ItemPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const item = await getMenuItemBySlug(slug);
    return { title: item.name, description: item.description };
  } catch {
    return { title: "Item not found" };
  }
}

export default async function MenuItemPage({ params }: ItemPageProps) {
  const { slug } = await params;

  let itemDoc;
  try {
    itemDoc = await getMenuItemBySlug(slug);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const item = toMenuItemDTO(itemDoc);
  const session = await getSession();

  let isFavorite = false;
  if (session) {
    await connectDB();
    const user = await User.findById(session.sub).select("favorites");
    isFavorite = Boolean(user?.favorites.some((f) => String(f) === item.id));
  }

  const related = item.category
    ? await listMenuItems({ categoryId: item.category.id, pageSize: 4 })
    : { items: [] };
  const relatedItems = related.items.filter((r) => String(r._id) !== item.id).map(toMenuItemDTO);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/menu" className="hover:text-foreground">
          Menu
        </Link>
        {item.category && (
          <>
            <ChevronRight className="size-3" />
            <Link href={`/menu?category=${item.category.slug}`} className="hover:text-foreground">
              {item.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="size-3" />
        <span className="text-foreground">{item.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          {item.image ? (
            <Image src={item.image} alt={item.name} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">No image</div>
          )}
          <div className="absolute right-3 top-3">
            <FavoriteButton menuItemId={item.id} initialFavorite={isFavorite} isAuthenticated={Boolean(session)} />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {TAG_LABEL[tag]}
              </Badge>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <FoodTypeBadge foodType={item.foodType} />
            <h1 className="text-2xl font-bold tracking-tight sm:text-[28px]">{item.name}</h1>
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.description}</p>

          <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" /> {item.prepTimeMinutes} min prep
            </span>
            {item.spiceLevel !== SPICE_LEVEL.NONE && (
              <span className="flex items-center gap-1.5 capitalize">
                <Flame className="size-4" /> {item.spiceLevel}
              </span>
            )}
          </div>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-2xl font-bold">{formatCurrency(item.discountPrice ?? item.price)}</span>
            {item.discountPrice && (
              <span className="text-base text-muted-foreground line-through">{formatCurrency(item.price)}</span>
            )}
          </div>

          <div className="mt-6">
            <ItemDetailActions item={item} />
          </div>
        </div>
      </div>

      {relatedItems.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-bold tracking-tight">You might also like</h2>
          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedItems.map((r) => (
              <MenuItemCard key={r.id} item={r} isAuthenticated={Boolean(session)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
