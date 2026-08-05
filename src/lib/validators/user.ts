import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  hostelId: z.string().min(1).optional(),
  profileImage: z.object({ url: z.string().url(), fileId: z.string() }).optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const addressSchema = z.object({
  label: z.string().trim().min(1).max(50),
  hostelId: z.string().min(1),
  roomNumber: z.string().trim().min(1).max(20),
  landmark: z.string().trim().max(200).optional(),
  isDefault: z.boolean().default(false),
});
export type AddressInput = z.input<typeof addressSchema>;

export const restaurantSettingsSchema = z.object({
  name: z.string().trim().min(1).max(100),
  tagline: z.string().trim().max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  contactNumber: z.string().trim().max(20).optional(),
  whatsappNumber: z.string().trim().max(20).optional(),
  email: z.string().trim().email().optional(),
  address: z.string().trim().max(500).optional(),
  avgResponseTimeMinutes: z.number().int().min(0).optional(),
  avgDeliveryTimeMinutes: z.number().int().min(0).optional(),
  deliveryCharges: z.number().min(0).optional(),
  minOrderValue: z.number().min(0).optional(),
  taxPercent: z.number().min(0).max(100).optional(),
  isOpen: z.boolean().optional(),
  logo: z.object({ url: z.string().url(), fileId: z.string() }).optional(),
  banner: z.object({ url: z.string().url(), fileId: z.string() }).optional(),
});
export type RestaurantSettingsInput = z.infer<typeof restaurantSettingsSchema>;
