import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { requestEmailChangeNew } from "@/services/account.service";
import { handleApiError, RateLimitedError } from "@/lib/api/errors";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";

const schema = z.object({
  changeToken: z.string().min(1),
  newEmail: z.string().trim().toLowerCase().email(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const limit = rateLimit(`email-change-otp:${session.sub}`, RATE_LIMIT_PRESETS.OTP_REQUEST);
    if (!limit.success) throw new RateLimitedError();

    const body = await request.json();
    const { changeToken, newEmail } = schema.parse(body);

    await requestEmailChangeNew(session.sub, changeToken, newEmail);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
