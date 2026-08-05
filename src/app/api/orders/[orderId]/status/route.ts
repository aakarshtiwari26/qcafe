import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { updateOrderStatusSchema } from "@/lib/validators/order";
import { updateOrderStatus } from "@/services/order.service";
import { handleApiError } from "@/lib/api/errors";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const session = await requireAdmin(request);
    const { orderId } = await params;
    const body = await request.json();
    const { status, note } = updateOrderStatusSchema.parse(body);
    const order = await updateOrderStatus(orderId, status, session.sub, note, request);
    return NextResponse.json({ data: order });
  } catch (error) {
    return handleApiError(error);
  }
}
