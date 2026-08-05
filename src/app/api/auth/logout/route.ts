import { NextRequest, NextResponse } from "next/server";
import { logout } from "@/services/auth.service";
import { clearAuthCookies } from "@/lib/auth/cookies";
import { handleApiError } from "@/lib/api/errors";
import { COOKIE_NAMES } from "@/constants";

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(COOKIE_NAMES.REFRESH_TOKEN)?.value;
    await logout(refreshToken);

    const response = NextResponse.json({ data: { success: true } });
    clearAuthCookies(response);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
