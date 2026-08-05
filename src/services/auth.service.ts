import type { NextRequest } from "next/server";
import { connectDB } from "@/lib/db/connect";
import { User, Otp, RefreshToken } from "@/models";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateOtpCode, hashOtp, verifyOtp, otpExpiryDate } from "@/lib/auth/otp";
import {
  signAccessToken,
  generateRefreshTokenValue,
  hashRefreshTokenValue,
  refreshTokenExpiryDate,
} from "@/lib/auth/tokens";
import { sendOtpEmail, sendWelcomeEmail } from "@/lib/email/mailer";
import { logActivity } from "@/lib/audit/log";
import { getClientIp } from "@/lib/security/rate-limit";
import {
  USER_ROLE,
  USER_STATUS,
  OTP_PURPOSE,
  AUTH_LIMITS,
  ACTIVITY_ACTION,
  type OtpPurpose,
} from "@/constants";
import { AppError, UnauthorizedError, ForbiddenError, ConflictError, NotFoundError } from "@/lib/api/errors";
import type { RegisterInput, LoginInput, VerifyOtpInput } from "@/lib/validators/auth";

async function issueSession(userId: string, role: (typeof USER_ROLE)[keyof typeof USER_ROLE], status: (typeof USER_STATUS)[keyof typeof USER_STATUS], request: NextRequest) {
  const accessToken = await signAccessToken({ sub: userId, role, status });
  const refreshValue = generateRefreshTokenValue();

  await RefreshToken.create({
    user: userId,
    tokenHash: hashRefreshTokenValue(refreshValue),
    userAgent: request.headers.get("user-agent") ?? undefined,
    ip: getClientIp(request),
    expiresAt: refreshTokenExpiryDate(),
  });

  return { accessToken, refreshToken: refreshValue };
}

export async function register(input: RegisterInput, request: NextRequest) {
  await connectDB();

  const existing = await User.findOne({ email: input.email });
  if (existing && existing.status !== USER_STATUS.PENDING_VERIFICATION) {
    throw new ConflictError("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = existing
    ? Object.assign(existing, {
        name: input.name,
        passwordHash,
        phone: input.phone,
        hostel: input.hostelId,
      })
    : new User({
        name: input.name,
        email: input.email,
        passwordHash,
        phone: input.phone,
        hostel: input.hostelId,
        role: USER_ROLE.CUSTOMER,
        status: USER_STATUS.PENDING_VERIFICATION,
      });
  await user.save();

  const code = generateOtpCode();
  await Otp.create({
    email: input.email,
    purpose: OTP_PURPOSE.REGISTER,
    codeHash: await hashOtp(code),
    expiresAt: otpExpiryDate(),
  });
  await sendOtpEmail(input.email, OTP_PURPOSE.REGISTER, code).catch((err) =>
    console.error("[register_otp_email_failed]", err)
  );

  await logActivity({
    actorId: String(user._id),
    actorRole: USER_ROLE.CUSTOMER,
    action: ACTIVITY_ACTION.USER_REGISTERED,
    targetType: "User",
    targetId: String(user._id),
    request,
  });

  return { email: input.email };
}

async function consumeOtp(email: string, purpose: OtpPurpose, code: string) {
  const otp = await Otp.findOne({ email, purpose, consumedAt: { $exists: false } }).sort({ createdAt: -1 });

  if (!otp || otp.expiresAt < new Date()) {
    throw new AppError("This code has expired. Request a new one.", 400, "OTP_EXPIRED");
  }
  if (otp.attempts >= AUTH_LIMITS.MAX_OTP_ATTEMPTS) {
    throw new AppError("Too many incorrect attempts. Request a new code.", 429, "OTP_LOCKED");
  }

  const valid = await verifyOtp(code, otp.codeHash);
  if (!valid) {
    otp.attempts += 1;
    await otp.save();
    throw new AppError("Incorrect code. Please try again.", 400, "OTP_INCORRECT");
  }

  otp.consumedAt = new Date();
  await otp.save();
  return otp;
}

export async function verifyRegistrationOtp(input: VerifyOtpInput, request: NextRequest) {
  await connectDB();

  await consumeOtp(input.email, OTP_PURPOSE.REGISTER, input.code);

  const user = await User.findOne({ email: input.email });
  if (!user) throw new NotFoundError("Account not found");

  user.status = USER_STATUS.ACTIVE;
  user.emailVerifiedAt = new Date();
  await user.save();

  await sendWelcomeEmail(user.email, user.name).catch((err) => console.error("[welcome_email_failed]", err));

  const session = await issueSession(String(user._id), user.role, user.status, request);
  return { user, ...session };
}

export async function login(input: LoginInput, request: NextRequest) {
  await connectDB();

  const user = await User.findOne({ email: input.email }).select("+passwordHash +loginAttempts +lockUntil");
  if (!user) throw new UnauthorizedError("Invalid email or password");

  if (user.lockUntil && user.lockUntil > new Date()) {
    throw new ForbiddenError("Too many failed attempts. Try again in a few minutes.");
  }

  const validPassword = await verifyPassword(input.password, user.passwordHash);
  if (!validPassword) {
    user.loginAttempts = (user.loginAttempts ?? 0) + 1;
    if (user.loginAttempts >= AUTH_LIMITS.MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + AUTH_LIMITS.LOGIN_LOCKOUT_MINUTES * 60 * 1000);
      user.loginAttempts = 0;
    }
    await user.save();
    await logActivity({
      actorId: String(user._id),
      action: ACTIVITY_ACTION.USER_LOGIN_FAILED,
      targetType: "User",
      targetId: String(user._id),
      request,
    });
    throw new UnauthorizedError("Invalid email or password");
  }

  if (user.status === USER_STATUS.PENDING_VERIFICATION) {
    throw new ForbiddenError("Please verify your email before logging in");
  }
  if (user.status === USER_STATUS.SUSPENDED) {
    throw new ForbiddenError("Your account has been suspended. Contact support.");
  }

  user.loginAttempts = 0;
  user.lockUntil = undefined;
  user.lastLoginAt = new Date();
  await user.save();

  await logActivity({
    actorId: String(user._id),
    actorRole: user.role,
    action: ACTIVITY_ACTION.USER_LOGIN,
    targetType: "User",
    targetId: String(user._id),
    request,
  });

  const session = await issueSession(String(user._id), user.role, user.status, request);
  return { user, ...session };
}

export async function refreshSession(refreshTokenValue: string, request: NextRequest) {
  await connectDB();

  const tokenHash = hashRefreshTokenValue(refreshTokenValue);
  const stored = await RefreshToken.findOne({ tokenHash });

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    throw new UnauthorizedError("Session expired. Please log in again.");
  }

  const user = await User.findById(stored.user);
  if (!user || user.status === USER_STATUS.SUSPENDED) {
    throw new UnauthorizedError("Session no longer valid");
  }

  // Rotate: revoke the used token and issue a fresh pair.
  stored.revokedAt = new Date();
  await stored.save();

  const session = await issueSession(String(user._id), user.role, user.status, request);
  return { user, ...session };
}

export async function logout(refreshTokenValue: string | undefined) {
  if (!refreshTokenValue) return;
  await connectDB();
  const tokenHash = hashRefreshTokenValue(refreshTokenValue);
  await RefreshToken.updateOne({ tokenHash }, { $set: { revokedAt: new Date() } });
}

export async function resendRegistrationOtp(email: string) {
  await connectDB();
  const user = await User.findOne({ email });
  if (!user || user.status !== USER_STATUS.PENDING_VERIFICATION) {
    // Do not reveal account existence/state.
    return;
  }
  const code = generateOtpCode();
  await Otp.create({
    email,
    purpose: OTP_PURPOSE.REGISTER,
    codeHash: await hashOtp(code),
    expiresAt: otpExpiryDate(),
  });
  await sendOtpEmail(email, OTP_PURPOSE.REGISTER, code).catch((err) =>
    console.error("[resend_otp_email_failed]", err)
  );
}

export { consumeOtp };
