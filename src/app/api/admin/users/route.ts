import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { listUsersForAdmin } from "@/services/admin-user.service";
import { handleApiError } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const params = request.nextUrl.searchParams;
    const result = await listUsersForAdmin({
      search: params.get("search") ?? undefined,
      status: params.get("status") ?? undefined,
      page: params.get("page") ? Number(params.get("page")) : undefined,
      pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : undefined,
    });
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
