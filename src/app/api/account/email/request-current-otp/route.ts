import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { requestEmailChangeCurrent } from "@/services/account.service";
import { handleApiError, RateLimitedError } from "@/lib/api/errors";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const limit = rateLimit(`email-change-otp:${session.sub}`, RATE_LIMIT_PRESETS.OTP_REQUEST);
    if (!limit.success) throw new RateLimitedError();

    await requestEmailChangeCurrent(session.sub);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
