import { connectDB } from "@/lib/db/connect";
import { Order, User } from "@/models";
import { ORDER_STATUS } from "@/constants";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getDashboardStats() {
  await connectDB();
  const todayStart = startOfToday();

  const [
    todaysOrders,
    todaysRevenueAgg,
    pendingCount,
    preparingCount,
    completedCount,
    cancelledCount,
    customerCount,
    topItems,
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: todayStart } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart }, status: { $ne: ORDER_STATUS.CANCELLED } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    Order.countDocuments({ status: { $in: [ORDER_STATUS.RECEIVED, ORDER_STATUS.CONFIRMED] } }),
    Order.countDocuments({ status: { $in: [ORDER_STATUS.PREPARING, ORDER_STATUS.READY, ORDER_STATUS.OUT_FOR_DELIVERY] } }),
    Order.countDocuments({ status: ORDER_STATUS.DELIVERED, createdAt: { $gte: todayStart } }),
    Order.countDocuments({ status: ORDER_STATUS.CANCELLED, createdAt: { $gte: todayStart } }),
    User.countDocuments({}),
    Order.aggregate([
      { $match: { createdAt: { $gte: todayStart } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.name", quantity: { $sum: "$items.quantity" } } },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return {
    todaysOrders,
    todaysRevenue: todaysRevenueAgg[0]?.total ?? 0,
    pendingOrders: pendingCount,
    preparingOrders: preparingCount,
    completedOrders: completedCount,
    cancelledOrders: cancelledCount,
    customerCount,
    topSellingItems: topItems.map((i) => ({ name: i._id as string, quantity: i.quantity as number })),
  };
}

export async function getRevenueTrend(days = 14) {
  await connectDB();
  const since = new Date();
  since.setDate(since.getDate() - days);
  since.setHours(0, 0, 0, 0);

  const results = await Order.aggregate([
    { $match: { createdAt: { $gte: since }, status: { $ne: ORDER_STATUS.CANCELLED } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return results.map((r) => ({ date: r._id as string, revenue: r.revenue as number, orders: r.orders as number }));
}
