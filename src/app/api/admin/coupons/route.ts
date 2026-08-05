import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { couponSchema } from "@/lib/validators/coupon";
import { listCouponsForAdmin, createCoupon } from "@/services/coupon.service";
import { handleApiError } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const coupons = await listCouponsForAdmin();
    return NextResponse.json({ data: coupons });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const input = couponSchema.parse(body);
    const coupon = await createCoupon(input);
    return NextResponse.json({ data: coupon }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
