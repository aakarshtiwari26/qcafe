import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest, requireAdmin } from "@/lib/auth/session";
import { menuItemSchema } from "@/lib/validators/menu";
import { listMenuItems, createMenuItem } from "@/services/menu.service";
import { handleApiError } from "@/lib/api/errors";
import { USER_ROLE } from "@/constants";
import type { FoodType, ItemTag } from "@/constants";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const session = await getSessionFromRequest(request);
    const isAdmin = session?.role === USER_ROLE.ADMIN || session?.role === USER_ROLE.SUPER_ADMIN;

    const result = await listMenuItems({
      categoryId: params.get("category") ?? undefined,
      tag: (params.get("tag") as ItemTag) ?? undefined,
      foodType: (params.get("foodType") as FoodType) ?? undefined,
      search: params.get("search") ?? undefined,
      page: params.get("page") ? Number(params.get("page")) : undefined,
      pageSize: params.get("pageSize") ? Number(params.get("pageSize")) : undefined,
      includeHidden: isAdmin && params.get("includeHidden") === "true",
    });
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const input = menuItemSchema.parse(body);
    const item = await createMenuItem(input);
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
