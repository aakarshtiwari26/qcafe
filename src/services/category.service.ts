import { connectDB } from "@/lib/db/connect";
import { Category, MenuItem } from "@/models";
import { NotFoundError, ConflictError } from "@/lib/api/errors";
import { slugify } from "@/lib/utils/slugify";
import type { CategoryInput } from "@/lib/validators/menu";

export async function listCategories(includeInactive = false) {
  await connectDB();
  const filter = includeInactive ? {} : { isActive: true };
  return Category.find(filter).sort({ sortOrder: 1, name: 1 });
}

export async function getCategoryBySlug(slug: string) {
  await connectDB();
  return Category.findOne({ slug, isActive: true });
}

async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let suffix = 1;
  while (await Category.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${++suffix}`;
  }
  return slug;
}

export async function createCategory(input: CategoryInput) {
  await connectDB();
  const slug = await uniqueSlug(input.name);
  return Category.create({ ...input, slug });
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  await connectDB();
  const update: Record<string, unknown> = { ...input };
  if (input.name) update.slug = await uniqueSlug(input.name, id);

  const category = await Category.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!category) throw new NotFoundError("Category not found");
  return category;
}

export async function deleteCategory(id: string) {
  await connectDB();
  const inUse = await MenuItem.exists({ category: id });
  if (inUse) {
    throw new ConflictError("Cannot delete a category that still has menu items. Move or delete them first.");
  }
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw new NotFoundError("Category not found");
}

export async function reorderCategories(orderedIds: string[]) {
  await connectDB();
  await Promise.all(
    orderedIds.map((id, index) => Category.updateOne({ _id: id }, { $set: { sortOrder: index } }))
  );
}
