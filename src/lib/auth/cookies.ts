import type { NextResponse } from "next/server";
import { env } from "@/config/env";
import { COOKIE_NAMES } from "@/constants";

const baseCookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export function setAuthCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string }
) {
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, tokens.accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60, // 15 minutes; access token itself carries the real expiry
  });
  response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, tokens.refreshToken, {
    ...baseCookieOptions,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, "", { ...baseCookieOptions, maxAge: 0 });
  response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, "", { ...baseCookieOptions, maxAge: 0 });
}
