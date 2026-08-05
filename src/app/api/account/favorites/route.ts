import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { listFavorites } from "@/services/profile.service";
import { handleApiError } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const favorites = await listFavorites(session.sub);
    return NextResponse.json({ data: favorites });
  } catch (error) {
    return handleApiError(error);
  }
}
