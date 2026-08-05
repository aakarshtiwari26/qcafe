import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { listCategories } from "@/services/category.service";
import { getMenuItemById } from "@/services/menu.service";
import { toCategoryDTO } from "@/lib/serializers/category";
import { MenuItemForm } from "@/components/admin/menu-item-form";
import { NotFoundError } from "@/lib/api/errors";

export const metadata: Metadata = { title: "Edit Menu Item" };

export default async function EditMenuItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let item;
  try {
    item = await getMenuItemById(id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const categories = await listCategories();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="mb-5 text-sm font-semibold">Edit menu item</h2>
      <MenuItemForm
        categories={categories.map(toCategoryDTO)}
        itemId={id}
        defaultValues={{
          name: item.name,
          description: item.description,
          category: String(item.category),
          price: item.price,
          discountPrice: item.discountPrice,
          images: item.images.map((img) => ({ url: img.url, fileId: img.fileId, isPrimary: img.isPrimary })),
          isAvailable: item.isAvailable,
          isHidden: item.isHidden,
          prepTimeMinutes: item.prepTimeMinutes,
          foodType: item.foodType,
          spiceLevel: item.spiceLevel,
          tags: item.tags,
          inStock: item.inStock,
          sortOrder: item.sortOrder,
        }}
      />
    </div>
  );
}
