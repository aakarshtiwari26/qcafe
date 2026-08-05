import bcrypt from "bcryptjs";
import { AUTH_LIMITS } from "@/constants";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, AUTH_LIMITS.BCRYPT_SALT_ROUNDS);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
