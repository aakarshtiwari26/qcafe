import { connectDB } from "@/lib/db/connect";
import { User, Otp, RefreshToken } from "@/models";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateOtpCode, hashOtp, otpExpiryDate } from "@/lib/auth/otp";
import { signActionToken, verifyActionToken } from "@/lib/auth/tokens";
import { sendOtpEmail } from "@/lib/email/mailer";
import { logActivity } from "@/lib/audit/log";
import { OTP_PURPOSE, ACTIVITY_ACTION } from "@/constants";
import { AppError, UnauthorizedError, ConflictError, NotFoundError } from "@/lib/api/errors";
import { consumeOtp } from "./auth.service";
import type {
  ForgotPasswordInput,
  ResetPasswordInput,
  ChangePasswordInput,
} from "@/lib/validators/auth";

export async function forgotPassword(input: ForgotPasswordInput) {
  await connectDB();
  const user = await User.findOne({ email: input.email });
  if (!user) return;

  const code = generateOtpCode();
  await Otp.create({
    email: input.email,
    purpose: OTP_PURPOSE.RESET_PASSWORD,
    codeHash: await hashOtp(code),
    expiresAt: otpExpiryDate(),
  });
  await sendOtpEmail(input.email, OTP_PURPOSE.RESET_PASSWORD, code).catch((err) =>
    console.error("[reset_password_otp_email_failed]", err)
  );
}

export async function resetPassword(input: ResetPasswordInput) {
  await connectDB();
  await consumeOtp(input.email, OTP_PURPOSE.RESET_PASSWORD, input.code);

  const user = await User.findOne({ email: input.email });
  if (!user) throw new NotFoundError("Account not found");

  user.passwordHash = await hashPassword(input.newPassword);
  await user.save();

  await RefreshToken.updateMany({ user: user._id, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });

  await logActivity({
    actorId: String(user._id),
    action: ACTIVITY_ACTION.PASSWORD_RESET,
    targetType: "User",
    targetId: String(user._id),
  });
}

export async function changePassword(userId: string, input: ChangePasswordInput) {
  await connectDB();
  const user = await User.findById(userId).select("+passwordHash");
  if (!user) throw new NotFoundError("Account not found");

  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) throw new UnauthorizedError("Current password is incorrect");

  user.passwordHash = await hashPassword(input.newPassword);
  await user.save();

  await RefreshToken.updateMany({ user: user._id, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });

  await logActivity({
    actorId: String(user._id),
    action: ACTIVITY_ACTION.PASSWORD_CHANGED,
    targetType: "User",
    targetId: String(user._id),
  });
}

const EMAIL_CHANGE_STEP1_PURPOSE = "email_change_step1_verified";

export async function requestEmailChangeCurrent(userId: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Account not found");

  const code = generateOtpCode();
  await Otp.create({
    email: user.email,
    purpose: OTP_PURPOSE.CHANGE_EMAIL_CURRENT,
    codeHash: await hashOtp(code),
    expiresAt: otpExpiryDate(),
  });
  await sendOtpEmail(user.email, OTP_PURPOSE.CHANGE_EMAIL_CURRENT, code).catch((err) =>
    console.error("[change_email_current_otp_failed]", err)
  );
}

export async function verifyEmailChangeCurrent(userId: string, code: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Account not found");

  await consumeOtp(user.email, OTP_PURPOSE.CHANGE_EMAIL_CURRENT, code);

  return signActionToken({ sub: userId, purpose: EMAIL_CHANGE_STEP1_PURPOSE });
}

export async function requestEmailChangeNew(userId: string, changeToken: string, newEmail: string) {
  await connectDB();
  const verified = await verifyActionToken(changeToken, EMAIL_CHANGE_STEP1_PURPOSE);
  if (!verified || verified.sub !== userId) {
    throw new UnauthorizedError("Please verify your current email again");
  }

  const taken = await User.exists({ email: newEmail });
  if (taken) throw new ConflictError("This email is already in use");

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Account not found");

  const code = generateOtpCode();
  await Otp.create({
    email: user.email,
    purpose: OTP_PURPOSE.CHANGE_EMAIL_NEW,
    newEmail,
    codeHash: await hashOtp(code),
    expiresAt: otpExpiryDate(),
  });
  await sendOtpEmail(newEmail, OTP_PURPOSE.CHANGE_EMAIL_NEW, code).catch((err) =>
    console.error("[change_email_new_otp_failed]", err)
  );
}

export async function verifyEmailChangeNew(userId: string, code: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Account not found");

  const otp = await consumeOtp(user.email, OTP_PURPOSE.CHANGE_EMAIL_NEW, code);
  if (!otp.newEmail) throw new AppError("No pending email change found", 400, "NO_PENDING_CHANGE");

  const taken = await User.exists({ email: otp.newEmail });
  if (taken) throw new ConflictError("This email is already in use");

  const oldEmail = user.email;
  user.email = otp.newEmail;
  await user.save();

  await logActivity({
    actorId: String(user._id),
    action: ACTIVITY_ACTION.EMAIL_CHANGED,
    targetType: "User",
    targetId: String(user._id),
    metadata: { from: oldEmail, to: user.email },
  });

  return user;
}

export async function requestPhoneChange(userId: string, newPhone: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Account not found");

  const taken = await User.exists({ phone: newPhone });
  if (taken) throw new ConflictError("This phone number is already in use");

  const code = generateOtpCode();
  await Otp.create({
    email: user.email,
    purpose: OTP_PURPOSE.CHANGE_PHONE,
    newPhone,
    codeHash: await hashOtp(code),
    expiresAt: otpExpiryDate(),
  });
  await sendOtpEmail(user.email, OTP_PURPOSE.CHANGE_PHONE, code).catch((err) =>
    console.error("[change_phone_otp_failed]", err)
  );
}

export async function verifyPhoneChange(userId: string, code: string) {
  await connectDB();
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("Account not found");

  const otp = await consumeOtp(user.email, OTP_PURPOSE.CHANGE_PHONE, code);
  if (!otp.newPhone) throw new AppError("No pending phone change found", 400, "NO_PENDING_CHANGE");

  const taken = await User.exists({ phone: otp.newPhone });
  if (taken) throw new ConflictError("This phone number is already in use");

  user.phone = otp.newPhone;
  await user.save();

  await logActivity({
    actorId: String(user._id),
    action: ACTIVITY_ACTION.PHONE_CHANGED,
    targetType: "User",
    targetId: String(user._id),
  });

  return user;
}
