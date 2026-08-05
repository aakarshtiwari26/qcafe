import crypto from "crypto";
import bcrypt from "bcryptjs";
import { env } from "@/config/env";

/** Cryptographically random numeric OTP — never Math.random(). */
export function generateOtpCode(): string {
  const length = env.OTP_LENGTH;
  const max = 10 ** length;
  const code = crypto.randomInt(0, max);
  return code.toString().padStart(length, "0");
}

export function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export function verifyOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function otpExpiryDate(): Date {
  return new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60 * 1000);
}
