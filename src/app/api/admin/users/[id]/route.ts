import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getUserDetailForAdmin } from "@/services/admin-user.service";
import { handleApiError } from "@/lib/api/errors";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const result = await getUserDetailForAdmin(id);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}
