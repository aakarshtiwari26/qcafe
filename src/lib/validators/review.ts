import { z } from "zod";

export const reviewSchema = z.object({
  customerName: z.string().trim().min(2).max(100),
  detail: z.string().trim().max(150).optional(),
  quote: z.string().trim().min(5).max(500),
  rating: z.number().int().min(1).max(5).default(5),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export type ReviewInput = z.input<typeof reviewSchema>;
