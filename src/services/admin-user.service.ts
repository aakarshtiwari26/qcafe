import { connectDB } from "@/lib/db/connect";
import { User, Order, RefreshToken } from "@/models";
import { NotFoundError, AppError } from "@/lib/api/errors";
import { USER_STATUS, PAGINATION } from "@/constants";

export interface AdminUserQuery {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export async function listUsersForAdmin(query: AdminUserQuery = {}) {
  await connectDB();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.min(query.pageSize ?? PAGINATION.DEFAULT_PAGE_SIZE, PAGINATION.MAX_PAGE_SIZE);

  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
      { phone: { $regex: query.search, $options: "i" } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .populate("hostel", "name code")
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    User.countDocuments(filter),
  ]);

  return { users, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
}

export async function getUserDetailForAdmin(userId: string) {
  await connectDB();
  const user = await User.findById(userId).populate("hostel", "name code");
  if (!user) throw new NotFoundError("User not found");

  const [orderCount, totalSpent] = await Promise.all([
    Order.countDocuments({ user: userId }),
    Order.aggregate([{ $match: { user: user._id } }, { $group: { _id: null, total: { $sum: "$total" } } }]),
  ]);

  return {
    user,
    orderCount,
    totalSpent: totalSpent[0]?.total ?? 0,
  };
}

export async function setUserStatus(userId: string, status: typeof USER_STATUS.ACTIVE | typeof USER_STATUS.SUSPENDED) {
  await connectDB();
  const user = await User.findByIdAndUpdate(userId, { status }, { new: true });
  if (!user) throw new NotFoundError("User not found");

  if (status === USER_STATUS.SUSPENDED) {
    // Kill every active session immediately — suspension must take effect now, not at token expiry.
    await RefreshToken.updateMany({ user: userId, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
  }

  return user;
}

export async function assertNotSelfDemotion(actorId: string, targetId: string) {
  if (actorId === targetId) {
    throw new AppError("You cannot change your own account status", 400, "SELF_ACTION_FORBIDDEN");
  }
}
