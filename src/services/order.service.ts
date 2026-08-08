import type { NextRequest } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db/connect";
import { Order, MenuItem, Hostel, User, type IOrder } from "@/models";
import { generateUniqueOrderId } from "@/lib/order/generate-order-id";
import { getRestaurantSettings } from "./settings.service";
import { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "@/lib/email/mailer";
import { logActivity } from "@/lib/audit/log";
import { AppError, NotFoundError, ForbiddenError } from "@/lib/api/errors";
import { isRestaurantOpen } from "@/lib/utils/restaurant-hours";
import { ACTIVITY_ACTION, ORDER_STATUS, ORDER_STATUS_FLOW, PAGINATION, type OrderStatus } from "@/constants";
import type { CreateOrderInput } from "@/lib/validators/order";

export async function createOrder(userId: string, input: CreateOrderInput, request: NextRequest) {
  await connectDB();

  const settings = await getRestaurantSettings();
  if (!isRestaurantOpen(settings)) {
    throw new AppError("We're currently closed. Please check back during opening hours.", 409, "RESTAURANT_CLOSED");
  }

  const hostel = await Hostel.findOne({ _id: input.hostelId, isActive: true });
  if (!hostel) throw new AppError("Selected hostel is not available", 400, "INVALID_HOSTEL");

  const menuItemIds = input.items.map((i) => i.menuItemId);
  const menuItems = await MenuItem.find({ _id: { $in: menuItemIds } });
  const menuItemMap = new Map(menuItems.map((m) => [String(m._id), m]));

  const orderItems = input.items.map(({ menuItemId, quantity }) => {
    const menuItem = menuItemMap.get(menuItemId);
    if (!menuItem || menuItem.isHidden || !menuItem.isAvailable || !menuItem.inStock) {
      throw new AppError(
        `"${menuItem?.name ?? "An item"}" in your cart is no longer available`,
        409,
        "ITEM_UNAVAILABLE"
      );
    }
    const unitPrice = menuItem.discountPrice ?? menuItem.price;
    return {
      menuItem: menuItem._id,
      name: menuItem.name,
      image: menuItem.images.find((img) => img.isPrimary)?.url ?? menuItem.images[0]?.url,
      unitPrice,
      quantity,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  if (subtotal < settings.minOrderValue) {
    throw new AppError(
      `Minimum order value is ${settings.minOrderValue}`,
      400,
      "BELOW_MIN_ORDER_VALUE"
    );
  }

  const taxAmount = Math.round((subtotal * settings.taxPercent) / 100);
  const deliveryFee = settings.deliveryCharges;
  const discountAmount = 0;
  const total = subtotal + taxAmount + deliveryFee - discountAmount;

  const orderId = await generateUniqueOrderId();

  const order = await Order.create({
    orderId,
    user: userId,
    items: orderItems,
    hostelName: hostel.name,
    roomNumber: input.roomNumber,
    landmark: input.landmark,
    contactPhone: input.contactPhone,
    subtotal,
    taxAmount,
    deliveryFee,
    discountAmount,
    total,
    couponCode: input.couponCode,
    status: ORDER_STATUS.RECEIVED,
    statusHistory: [{ status: ORDER_STATUS.RECEIVED, changedAt: new Date() }],
    customerNotes: input.customerNotes,
    estimatedDeliveryAt: new Date(Date.now() + settings.avgDeliveryTimeMinutes * 60 * 1000),
  });

  const user = await User.findById(userId);
  if (user) {
    await sendOrderConfirmationEmail(user.email, order).catch((err) =>
      console.error("[order_confirmation_email_failed]", err)
    );
  }

  await logActivity({
    actorId: userId,
    action: ACTIVITY_ACTION.ORDER_CREATED,
    targetType: "Order",
    targetId: String(order._id),
    metadata: { orderId: order.orderId, total },
    request,
  });

  return order;
}

export async function getOrderByOrderId(orderId: string, requesterId: string, isAdmin: boolean) {
  await connectDB();
  const order = await Order.findOne({ orderId });
  if (!order) throw new NotFoundError("Order not found");
  if (!isAdmin && String(order.user) !== requesterId) {
    throw new ForbiddenError("You don't have access to this order");
  }
  await autoAdvanceStatus(order);
  return order;
}

export async function listOrdersForUser(userId: string, page = 1, pageSize: number = PAGINATION.DEFAULT_PAGE_SIZE) {
  await connectDB();
  const [orders, total] = await Promise.all([
    Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    Order.countDocuments({ user: userId }),
  ]);
  await Promise.all(orders.map((order) => autoAdvanceStatus(order)));
  return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export interface AdminOrderQuery {
  status?: OrderStatus;
  hostelName?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listOrdersForAdmin(query: AdminOrderQuery = {}) {
  await connectDB();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(query.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE);

  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.hostelName) filter.hostelName = query.hostelName;
  if (query.search) filter.orderId = { $regex: query.search, $options: "i" };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    Order.countDocuments(filter),
  ]);

  await Promise.all(orders.map((order) => autoAdvanceStatus(order)));

  return { orders, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

// Admin only ever taps Accept, Cancel, or Delivered. The kitchen stages in between
// (confirmed -> preparing -> ready -> out for delivery) advance on their own, paced
// off the restaurant's average delivery time, so nobody has to click through every step.
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [ORDER_STATUS.RECEIVED]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.PREPARING]: [
    ORDER_STATUS.READY,
    ORDER_STATUS.OUT_FOR_DELIVERY,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ],
  [ORDER_STATUS.READY]: [ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.OUT_FOR_DELIVERY]: [ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [],
};

const AUTO_ADVANCE_FROM = new Set<OrderStatus>([
  ORDER_STATUS.CONFIRMED,
  ORDER_STATUS.PREPARING,
  ORDER_STATUS.READY,
  ORDER_STATUS.OUT_FOR_DELIVERY,
]);

function computeAutoStatus(minutesSinceConfirmed: number, avgDeliveryTimeMinutes: number): OrderStatus {
  const budget = Math.max(avgDeliveryTimeMinutes, 1);
  const ratio = minutesSinceConfirmed / budget;
  if (ratio < 0.25) return ORDER_STATUS.PREPARING;
  if (ratio < 0.65) return ORDER_STATUS.READY;
  return ORDER_STATUS.OUT_FOR_DELIVERY;
}

/**
 * Silently advances an accepted order through Preparing -> Ready -> Out for delivery
 * based on elapsed time, so the admin never has to click each kitchen stage. Never
 * touches Delivered/Cancelled — those stay admin-only. Runs whenever the order is read.
 */
export async function autoAdvanceStatus(order: IOrder): Promise<IOrder> {
  if (!AUTO_ADVANCE_FROM.has(order.status)) return order;

  const confirmedAt = order.statusHistory.find((h) => h.status === ORDER_STATUS.CONFIRMED)?.changedAt;
  if (!confirmedAt) return order;

  const settings = await getRestaurantSettings();
  const minutesSinceConfirmed = (Date.now() - confirmedAt.getTime()) / 60000;
  const target = computeAutoStatus(minutesSinceConfirmed, settings.avgDeliveryTimeMinutes);

  if (ORDER_STATUS_FLOW.indexOf(target) <= ORDER_STATUS_FLOW.indexOf(order.status)) return order;

  order.status = target;
  order.statusHistory.push({ status: target, changedAt: new Date() });
  await order.save();

  const user = await User.findById(order.user);
  if (user) {
    await sendOrderStatusUpdateEmail(user.email, order, target).catch((err) =>
      console.error("[order_status_email_failed]", err)
    );
  }

  return order;
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminId: string,
  note: string | undefined,
  request: NextRequest
): Promise<IOrder> {
  await connectDB();
  const order = await Order.findOne({ orderId });
  if (!order) throw new NotFoundError("Order not found");

  if (!VALID_TRANSITIONS[order.status].includes(newStatus)) {
    throw new AppError(`Cannot move order from "${order.status}" to "${newStatus}"`, 409, "INVALID_TRANSITION");
  }

  order.status = newStatus;
  order.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy: new Types.ObjectId(adminId),
    note,
  });
  await order.save();

  const user = await User.findById(order.user);
  if (user) {
    await sendOrderStatusUpdateEmail(user.email, order, newStatus).catch((err) =>
      console.error("[order_status_email_failed]", err)
    );
  }

  await logActivity({
    actorId: adminId,
    action: ACTIVITY_ACTION.ORDER_STATUS_CHANGED,
    targetType: "Order",
    targetId: String(order._id),
    metadata: { orderId: order.orderId, status: newStatus },
    request,
  });

  return order;
}
