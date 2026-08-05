import type { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { COOKIE_NAMES, USER_ROLE, USER_STATUS, type UserRole } from "@/constants";
import { verifyAccessToken, type AccessTokenPayload } from "./tokens";
import { UnauthorizedError, ForbiddenError } from "@/lib/api/errors";

/** Reads and verifies the access token from a Route Handler's NextRequest. */
export async function getSessionFromRequest(
  request: NextRequest
): Promise<AccessTokenPayload | null> {
  const token = request.cookies.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

/** Reads and verifies the access token from a Server Component (via next/headers). */
export async function getSession(): Promise<AccessTokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAMES.ACCESS_TOKEN)?.value;
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function requireSession(request: NextRequest): Promise<AccessTokenPayload> {
  const session = await getSessionFromRequest(request);
  if (!session) throw new UnauthorizedError();
  if (session.status === USER_STATUS.SUSPENDED) {
    throw new ForbiddenError("This account has been suspended");
  }
  return session;
}

export async function requireRole(
  request: NextRequest,
  allowedRoles: UserRole[]
): Promise<AccessTokenPayload> {
  const session = await requireSession(request);
  if (!allowedRoles.includes(session.role)) {
    throw new ForbiddenError();
  }
  return session;
}

export function requireAdmin(request: NextRequest) {
  return requireRole(request, [USER_ROLE.ADMIN, USER_ROLE.SUPER_ADMIN]);
}
