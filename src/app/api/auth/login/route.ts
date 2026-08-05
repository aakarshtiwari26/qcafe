import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { login } from "@/services/auth.service";
import { setAuthCookies } from "@/lib/auth/cookies";
import { toPublicUser } from "@/lib/serializers/user";
import { handleApiError, RateLimitedError } from "@/lib/api/errors";
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(`login:${getClientIp(request)}`, RATE_LIMIT_PRESETS.LOGIN);
    if (!limit.success) throw new RateLimitedError();

    const body = await request.json();
    const input = loginSchema.parse(body);
    const { user, accessToken, refreshToken } = await login(input, request);

    const response = NextResponse.json({ data: { user: toPublicUser(user) } });
    setAuthCookies(response, { accessToken, refreshToken });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
