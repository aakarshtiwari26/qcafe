import type { Metadata } from "next";
import { listCategories } from "@/services/category.service";
import { CategoryManager } from "@/components/admin/category-manager";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await listCategories(true);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6">
      <CategoryManager
        categories={categories.map((c) => ({ id: String(c._id), name: c.name, isActive: c.isActive }))}
      />
    </div>
  );
}
