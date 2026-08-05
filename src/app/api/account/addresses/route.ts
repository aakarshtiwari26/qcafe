import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { addressSchema } from "@/lib/validators/user";
import { addAddress } from "@/services/profile.service";
import { toPublicUser } from "@/lib/serializers/user";
import { handleApiError } from "@/lib/api/errors";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();
    const input = addressSchema.parse(body);
    const user = await addAddress(session.sub, input);
    return NextResponse.json({ data: { user: toPublicUser(user) } }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
