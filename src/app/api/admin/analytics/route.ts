import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getDashboardStats, getRevenueTrend } from "@/services/analytics.service";
import { handleApiError } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const [stats, revenueTrend] = await Promise.all([getDashboardStats(), getRevenueTrend(14)]);
    return NextResponse.json({ data: { stats, revenueTrend } });
  } catch (error) {
    return handleApiError(error);
  }
}
