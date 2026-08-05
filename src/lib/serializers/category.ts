import type { ICategory } from "@/models";

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

/** Plain, client-safe shape — Mongoose documents can't cross the Server/Client Component boundary. */
export function toCategoryDTO(category: ICategory): CategoryDTO {
  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    image: category.image?.url,
  };
}
