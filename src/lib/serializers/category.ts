import type { ICategory } from "@/models";

export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  image?: string;
}

export function toCategoryDTO(category: ICategory): CategoryDTO {
  return {
    id: String(category._id),
    name: category.name,
    slug: category.slug,
    image: category.image?.url,
  };
}
