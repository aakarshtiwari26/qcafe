import { connectDB } from "@/lib/db/connect";
import { MenuItem } from "@/models";
import { NotFoundError } from "@/lib/api/errors";
import { slugify } from "@/lib/utils/slugify";
import { PAGINATION } from "@/constants";
import type { MenuItemInput } from "@/lib/validators/menu";
import type { FoodType, ItemTag } from "@/constants";

export interface MenuQueryOptions {
  categoryId?: string;
  tag?: ItemTag;
  foodType?: FoodType;
  search?: string;
  page?: number;
  pageSize?: number;
  includeHidden?: boolean;
}

export async function listMenuItems(options: MenuQueryOptions = {}) {
  await connectDB();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(options.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE);

  const filter: Record<string, unknown> = {};
  if (!options.includeHidden) filter.isHidden = false;
  if (options.categoryId) filter.category = options.categoryId;
  if (options.tag) filter.tags = options.tag;
  if (options.foodType) filter.foodType = options.foodType;
  if (options.search) filter.$text = { $search: options.search };

  const [items, total] = await Promise.all([
    MenuItem.find(filter)
      .populate("category", "name slug")
      .sort({ sortOrder: 1, createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    MenuItem.countDocuments(filter),
  ]);

  return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getMenuItemBySlug(slug: string) {
  await connectDB();
  const item = await MenuItem.findOne({ slug }).populate("category", "name slug");
  if (!item) throw new NotFoundError("Menu item not found");
  return item;
}

export async function getMenuItemById(id: string) {
  await connectDB();
  const item = await MenuItem.findById(id);
  if (!item) throw new NotFoundError("Menu item not found");
  return item;
}

async function uniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let slug = base;
  let suffix = 1;
  while (await MenuItem.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${base}-${++suffix}`;
  }
  return slug;
}

export async function createMenuItem(input: MenuItemInput) {
  await connectDB();
  const slug = await uniqueSlug(input.name);
  return MenuItem.create({ ...input, slug });
}

export async function updateMenuItem(id: string, input: Partial<MenuItemInput>) {
  await connectDB();
  const update: Record<string, unknown> = { ...input };
  if (input.name) update.slug = await uniqueSlug(input.name, id);

  const item = await MenuItem.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!item) throw new NotFoundError("Menu item not found");
  return item;
}

export async function deleteMenuItem(id: string) {
  await connectDB();
  const item = await MenuItem.findByIdAndDelete(id);
  if (!item) throw new NotFoundError("Menu item not found");
}

export async function duplicateMenuItem(id: string) {
  await connectDB();
  const original = await MenuItem.findById(id).lean();
  if (!original) throw new NotFoundError("Menu item not found");

  const { _id, createdAt, updatedAt, ...rest } = original;
  void _id;
  void createdAt;
  void updatedAt;

  const name = `${rest.name} (Copy)`;
  const slug = await uniqueSlug(name);
  return MenuItem.create({ ...rest, name, slug, isHidden: true });
}

export async function setMenuItemVisibility(id: string, isHidden: boolean) {
  await connectDB();
  const item = await MenuItem.findByIdAndUpdate(id, { isHidden }, { new: true });
  if (!item) throw new NotFoundError("Menu item not found");
  return item;
}

export async function setMenuItemAvailability(id: string, isAvailable: boolean) {
  await connectDB();
  const item = await MenuItem.findByIdAndUpdate(id, { isAvailable }, { new: true });
  if (!item) throw new NotFoundError("Menu item not found");
  return item;
}

export async function reorderMenuItems(orderedIds: string[]) {
  await connectDB();
  await Promise.all(
    orderedIds.map((id, index) => MenuItem.updateOne({ _id: id }, { $set: { sortOrder: index } }))
  );
}
