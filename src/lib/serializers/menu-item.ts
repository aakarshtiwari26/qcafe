import type { IMenuItem } from "@/models";

/** Plain, client-safe shape for a menu item — used across menu, cart, and admin UIs. */
export interface MenuItemDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  image?: string;
  foodType: IMenuItem["foodType"];
  spiceLevel: IMenuItem["spiceLevel"];
  tags: IMenuItem["tags"];
  prepTimeMinutes: number;
  inStock: boolean;
  isAvailable: boolean;
  category?: { id: string; name: string; slug: string };
}

export function toMenuItemDTO(item: IMenuItem): MenuItemDTO {
  const primaryImage = item.images.find((img) => img.isPrimary)?.url ?? item.images[0]?.url;
  const category =
    item.category && typeof item.category === "object" && "name" in item.category
      ? {
          id: String((item.category as unknown as { _id: unknown; name: string; slug: string })._id),
          name: (item.category as unknown as { name: string }).name,
          slug: (item.category as unknown as { slug: string }).slug,
        }
      : undefined;

  return {
    id: String(item._id),
    name: item.name,
    slug: item.slug,
    description: item.description,
    price: item.price,
    discountPrice: item.discountPrice,
    image: primaryImage,
    foodType: item.foodType,
    spiceLevel: item.spiceLevel,
    tags: item.tags,
    prepTimeMinutes: item.prepTimeMinutes,
    inStock: item.inStock,
    isAvailable: item.isAvailable,
    category,
  };
}
