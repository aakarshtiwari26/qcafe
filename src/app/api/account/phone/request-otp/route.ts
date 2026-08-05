import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { requestPhoneChangeSchema } from "@/lib/validators/auth";
import { requestPhoneChange } from "@/services/account.service";
import { handleApiError, RateLimitedError } from "@/lib/api/errors";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const limit = rateLimit(`phone-change-otp:${session.sub}`, RATE_LIMIT_PRESETS.OTP_REQUEST);
    if (!limit.success) throw new RateLimitedError();

    const body = await request.json();
    const { newPhone } = requestPhoneChangeSchema.parse(body);

    await requestPhoneChange(session.sub, newPhone);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
