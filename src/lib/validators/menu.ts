import { z } from "zod";
import { FOOD_TYPE, SPICE_LEVEL, ITEM_TAG } from "@/constants";

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  image: z.object({ url: z.string().url(), fileId: z.string() }).optional(),
});
export type CategoryInput = z.input<typeof categorySchema>;

export const menuItemSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(1000),
  category: z.string().min(1, "Select a category"),
  price: z.number().positive("Price must be greater than 0"),
  discountPrice: z.number().positive().optional(),
  images: z
    .array(z.object({ url: z.string().url(), fileId: z.string(), isPrimary: z.boolean().default(false) }))
    .default([]),
  isAvailable: z.boolean().default(true),
  isHidden: z.boolean().default(false),
  prepTimeMinutes: z.number().int().min(0).default(15),
  foodType: z.enum([FOOD_TYPE.VEG, FOOD_TYPE.NON_VEG, FOOD_TYPE.EGG]),
  spiceLevel: z
    .enum([SPICE_LEVEL.NONE, SPICE_LEVEL.MILD, SPICE_LEVEL.MEDIUM, SPICE_LEVEL.HOT])
    .default(SPICE_LEVEL.NONE),
  tags: z
    .array(z.enum([ITEM_TAG.POPULAR, ITEM_TAG.RECOMMENDED, ITEM_TAG.BEST_SELLER, ITEM_TAG.TODAYS_SPECIAL]))
    .default([]),
  inStock: z.boolean().default(true),
  nutritionalInfo: z
    .object({
      calories: z.number().min(0).optional(),
      proteinGrams: z.number().min(0).optional(),
      carbsGrams: z.number().min(0).optional(),
      fatGrams: z.number().min(0).optional(),
    })
    .optional(),
  sortOrder: z.number().int().default(0),
});
export type MenuItemInput = z.input<typeof menuItemSchema>;

export const hostelSchema = z.object({
  name: z.string().trim().min(1).max(100),
  code: z.string().trim().min(1).max(20),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export type HostelInput = z.input<typeof hostelSchema>;
