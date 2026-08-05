import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().trim().min(2).max(30),
  description: z.string().trim().max(200).optional(),
  discountType: z.enum(["percentage", "flat"]),
  discountValue: z.number().positive(),
  minOrderValue: z.number().min(0).default(0),
  maxDiscountAmount: z.number().positive().optional(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
  validFrom: z.coerce.date().optional(),
  validUntil: z.coerce.date().optional(),
});
export type CouponInput = z.input<typeof couponSchema>;
