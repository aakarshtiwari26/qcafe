import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { toggleFavorite } from "@/services/profile.service";
import { handleApiError } from "@/lib/api/errors";

export async function POST(request: NextRequest, { params }: { params: Promise<{ menuItemId: string }> }) {
  try {
    const session = await requireSession(request);
    const { menuItemId } = await params;
    const user = await toggleFavorite(session.sub, menuItemId);
    const isFavorite = user.favorites.some((f) => String(f) === menuItemId);
    return NextResponse.json({ data: { isFavorite } });
  } catch (error) {
    return handleApiError(error);
  }
}
