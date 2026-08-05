import type { Metadata } from "next";
import { listCategories } from "@/services/category.service";
import { toCategoryDTO } from "@/lib/serializers/category";
import { MenuItemForm } from "@/components/admin/menu-item-form";

export const metadata: Metadata = { title: "Add Menu Item" };

export default async function NewMenuItemPage() {
  const categories = await listCategories();

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <h2 className="mb-5 text-sm font-semibold">Add menu item</h2>
      <MenuItemForm categories={categories.map(toCategoryDTO)} />
    </div>
  );
}
