import { SignJWT, jwtVerify } from "jose";
import crypto from "crypto";
import { env } from "@/config/env";
import type { UserRole, UserStatus } from "@/constants";

/**
 * `jose` (not `jsonwebtoken`) because it runs on both the Node runtime
 * (API routes) and the Edge runtime (middleware) — access tokens must be
 * verifiable in middleware without a Node-only crypto dependency.
 */
export interface AccessTokenPayload {
  sub: string; // user id
  role: UserRole;
  status: UserStatus;
}

const accessSecret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);

export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ role: payload.role, status: payload.status, typ: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(env.JWT_ACCESS_EXPIRES_IN)
    .sign(accessSecret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    if (!payload.sub || payload.typ !== "access") return null;
    return {
      sub: payload.sub,
      role: payload.role as UserRole,
      status: payload.status as UserStatus,
    };
  } catch {
    return null;
  }
}

/**
 * Short-lived bridge tokens for multi-step flows (change-email step 1 -> 2)
 * where a stateless API needs to prove "the previous OTP step already
 * succeeded" without re-sending an OTP. Distinct `typ` claim from access
 * tokens so one can never be replayed as the other, even though they share
 * a signing secret.
 */
export interface ActionTokenPayload {
  sub: string;
  purpose: string;
  data?: Record<string, string>;
}

export async function signActionToken(payload: ActionTokenPayload, expiresIn = "10m"): Promise<string> {
  return new SignJWT({ purpose: payload.purpose, data: payload.data ?? {}, typ: "action" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(accessSecret);
}

export async function verifyActionToken(
  token: string,
  expectedPurpose: string
): Promise<ActionTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, accessSecret);
    if (!payload.sub || payload.typ !== "action" || payload.purpose !== expectedPurpose) return null;
    return {
      sub: payload.sub,
      purpose: payload.purpose as string,
      data: payload.data as Record<string, string>,
    };
  } catch {
    return null;
  }
}

/**
 * Refresh tokens are opaque random strings, not JWTs — the raw value is
 * only ever sent to the client as a cookie. The server stores a SHA-256
 * hash (see RefreshToken model) so a single row can be revoked on logout
 * or when an account is suspended, which a stateless JWT can't do.
 */
export function generateRefreshTokenValue(): string {
  return crypto.randomBytes(64).toString("hex");
}

export function hashRefreshTokenValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function refreshTokenExpiryDate(): Date {
  const ms = parseDurationToMs(env.JWT_REFRESH_EXPIRES_IN);
  return new Date(Date.now() + ms);
}

function parseDurationToMs(duration: string): number {
  const match = /^(\d+)([smhd])$/.exec(duration.trim());
  if (!match) return 30 * 24 * 60 * 60 * 1000; // default 30d
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 86_400_000;
  return value * unitMs;
}
