import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listOrdersForAdmin } from "@/services/order.service";
import { handleApiError } from "@/lib/api/errors";
import type { OrderStatus } from "@/constants";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const params = request.nextUrl.searchParams;
    const result = await listOrdersForAdmin({
      status: (params.get("status") as OrderStatus) ?? undefined,
      hostelName: params.get("hostel") ?? undefined,
      search: params.get("search") ?? undefined,
      page: params.get("page") ? Number(params.get("page")) : undefined,
      pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : undefined,
    });
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
