import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { restaurantSettingsSchema } from "@/lib/validators/user";
import { updateRestaurantSettings } from "@/services/settings.service";
import { handleApiError } from "@/lib/api/errors";
import { logActivity } from "@/lib/audit/log";
import { ACTIVITY_ACTION } from "@/constants";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    const body = await request.json();
    const input = restaurantSettingsSchema.partial().parse(body);
    const settings = await updateRestaurantSettings(input);

    await logActivity({
      actorId: session.sub,
      actorRole: session.role,
      action: ACTIVITY_ACTION.SETTINGS_UPDATED,
      targetType: "RestaurantSettings",
      request,
    });

    return NextResponse.json({ data: settings });
  } catch (error) {
    return handleApiError(error);
  }
}
