import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validators/auth";
import { changePassword } from "@/services/account.service";
import { handleApiError } from "@/lib/api/errors";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();
    const input = changePasswordSchema.parse(body);
    await changePassword(session.sub, input);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
