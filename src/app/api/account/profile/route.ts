import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validators/user";
import { updateProfile } from "@/services/profile.service";
import { toPublicUser } from "@/lib/serializers/user";
import { handleApiError } from "@/lib/api/errors";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();
    const input = updateProfileSchema.parse(body);
    const user = await updateProfile(session.sub, input);
    return NextResponse.json({ data: { user: toPublicUser(user) } });
  } catch (error) {
    return handleApiError(error);
  }
}
