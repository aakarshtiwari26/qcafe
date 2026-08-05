import { NextRequest, NextResponse } from "next/server";
import { verifyOtpSchema } from "@/lib/validators/auth";
import { verifyRegistrationOtp } from "@/services/auth.service";
import { setAuthCookies } from "@/lib/auth/cookies";
import { toPublicUser } from "@/lib/serializers/user";
import { handleApiError, RateLimitedError } from "@/lib/api/errors";
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(`verify-otp:${getClientIp(request)}`, RATE_LIMIT_PRESETS.OTP_VERIFY);
    if (!limit.success) throw new RateLimitedError();

    const body = await request.json();
    const input = verifyOtpSchema.parse(body);
    const { user, accessToken, refreshToken } = await verifyRegistrationOtp(input, request);

    const response = NextResponse.json({ data: { user: toPublicUser(user) } });
    setAuthCookies(response, { accessToken, refreshToken });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
