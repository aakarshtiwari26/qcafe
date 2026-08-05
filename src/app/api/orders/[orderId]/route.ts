import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getOrderByOrderId } from "@/services/order.service";
import { handleApiError } from "@/lib/api/errors";
import { USER_ROLE } from "@/constants";

export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const session = await requireSession(request);
    const { orderId } = await params;
    const isAdmin = session.role === USER_ROLE.ADMIN || session.role === USER_ROLE.SUPER_ADMIN;
    const order = await getOrderByOrderId(orderId, session.sub, isAdmin);
    return NextResponse.json({ data: order });
  } catch (error) {
    return handleApiError(error);
  }
}
