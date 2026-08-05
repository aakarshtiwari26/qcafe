import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { couponSchema } from "@/lib/validators/coupon";
import { updateCoupon, deleteCoupon } from "@/services/coupon.service";
import { handleApiError } from "@/lib/api/errors";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const input = couponSchema.partial().parse(body);
    const coupon = await updateCoupon(id, input);
    return NextResponse.json({ data: coupon });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    await deleteCoupon(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
