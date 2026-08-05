import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { categorySchema } from "@/lib/validators/menu";
import { updateCategory, deleteCategory } from "@/services/category.service";
import { handleApiError } from "@/lib/api/errors";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    const body = await request.json();
    const input = categorySchema.partial().parse(body);
    const category = await updateCategory(id, input);
    return NextResponse.json({ data: category });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await params;
    await deleteCategory(id);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
