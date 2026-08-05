import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { ActivityLog } from "@/models";
import { handleApiError } from "@/lib/api/errors";
import { PAGINATION } from "@/constants";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    await connectDB();

    const params = request.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get("page") ?? 1));
    const pageSize = Math.min(Number(params.get("pageSize") ?? PAGINATION.DEFAULT_PAGE_SIZE), PAGINATION.MAX_PAGE_SIZE);

    const [logs, total] = await Promise.all([
      ActivityLog.find({})
        .populate("actor", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize),
      ActivityLog.countDocuments({}),
    ]);

    return NextResponse.json({ data: { logs, total, page, pageSize, totalPages: Math.ceil(total / pageSize) } });
  } catch (error) {
    return handleApiError(error);
  }
}
