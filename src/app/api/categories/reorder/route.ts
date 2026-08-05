import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { reorderCategories } from "@/services/category.service";
import { handleApiError } from "@/lib/api/errors";

const schema = z.object({ orderedIds: z.array(z.string()).min(1) });

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const { orderedIds } = schema.parse(body);
    await reorderCategories(orderedIds);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
