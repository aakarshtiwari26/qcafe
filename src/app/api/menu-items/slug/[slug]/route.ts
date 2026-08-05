import { NextRequest, NextResponse } from "next/server";
import { getMenuItemBySlug } from "@/services/menu.service";
import { handleApiError } from "@/lib/api/errors";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const item = await getMenuItemBySlug(slug);
    return NextResponse.json({ data: item });
  } catch (error) {
    return handleApiError(error);
  }
}
