import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api/errors";
import { deleteImage } from "@/lib/imagekit/client";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ fileId: string }> }) {
  try {
    await requireAdmin(request);
    const { fileId } = await params;
    await deleteImage(fileId);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
