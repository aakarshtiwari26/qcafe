import { connectDB } from "@/lib/db/connect";
import { Coupon } from "@/models";
import { NotFoundError } from "@/lib/api/errors";
import type { ICoupon } from "@/models";

export async function listActiveCoupons() {
  await connectDB();
  const now = new Date();
  return Coupon.find({
    isActive: true,
    validFrom: { $lte: now },
    $or: [{ validUntil: { $exists: false } }, { validUntil: { $gte: now } }],
  }).sort({ createdAt: -1 });
}

export async function listCouponsForAdmin() {
  await connectDB();
  return Coupon.find({}).sort({ createdAt: -1 });
}

export async function createCoupon(input: Partial<ICoupon>) {
  await connectDB();
  return Coupon.create(input);
}

export async function updateCoupon(id: string, input: Partial<ICoupon>) {
  await connectDB();
  const coupon = await Coupon.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!coupon) throw new NotFoundError("Coupon not found");
  return coupon;
}

export async function deleteCoupon(id: string) {
  await connectDB();
  const coupon = await Coupon.findByIdAndDelete(id);
  if (!coupon) throw new NotFoundError("Coupon not found");
}
