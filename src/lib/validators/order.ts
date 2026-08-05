import { z } from "zod";
import { ORDER_STATUS } from "@/constants";

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        menuItemId: z.string().min(1),
        quantity: z.number().int().min(1).max(50),
      })
    )
    .min(1, "Your cart is empty"),
  hostelId: z.string().min(1, "Select a delivery hostel"),
  roomNumber: z.string().trim().min(1, "Room number is required").max(20),
  landmark: z.string().trim().max(200).optional(),
  contactPhone: z
    .string()
    .trim()
    .regex(/^[0-9]{10}$/, "Enter a valid 10-digit phone number"),
  customerNotes: z.string().trim().max(500).optional(),
  couponCode: z.string().trim().max(30).optional(),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    ORDER_STATUS.RECEIVED,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ]),
  note: z.string().trim().max(300).optional(),
});
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
