import { NextRequest, NextResponse } from "next/server";
import { refreshSession } from "@/services/auth.service";
import { setAuthCookies, clearAuthCookies } from "@/lib/auth/cookies";
import { toPublicUser } from "@/lib/serializers/user";
import { handleApiError, UnauthorizedError } from "@/lib/api/errors";
import { COOKIE_NAMES } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
    if (!refreshToken) throw new UnauthorizedError("No active session");

    const { user, accessToken, refreshToken: newRefreshToken } = await refreshSession(refreshToken, request);

    const response = NextResponse.json({ data: { user: toPublicUser(user) } });
    setAuthCookies(response, { accessToken, refreshToken: newRefreshToken });
    return response;
  } catch (error) {
    const response = handleApiError(error);
    clearAuthCookies(response);
    return response;
  }
}
