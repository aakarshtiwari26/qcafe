import { getSiteConfig } from "@/config/site";
import { env } from "@/config/env";
import { emailLayout, emailOtpBlock } from "./layout";
import { OTP_PURPOSE, type OtpPurpose } from "@/constants";

const COPY: Record<OtpPurpose, { subject: string; heading: string; blurb: string }> = {
  [OTP_PURPOSE.REGISTER]: {
    subject: "Verify your email",
    heading: "Verify your email",
    blurb: "Enter this code to activate your account.",
  },
  [OTP_PURPOSE.LOGIN_2FA]: {
    subject: "Your login code",
    heading: "Confirm it's you",
    blurb: "Enter this code to finish signing in.",
  },
  [OTP_PURPOSE.RESET_PASSWORD]: {
    subject: "Reset your password",
    heading: "Reset your password",
    blurb: "Enter this code to choose a new password. If you didn't request this, you can ignore this email.",
  },
  [OTP_PURPOSE.CHANGE_EMAIL_CURRENT]: {
    subject: "Confirm email change",
    heading: "Confirm it's you",
    blurb: "Enter this code on your current email to start changing your account email.",
  },
  [OTP_PURPOSE.CHANGE_EMAIL_NEW]: {
    subject: "Verify your new email",
    heading: "Verify your new email",
    blurb: "Enter this code to confirm this is your new email address.",
  },
  [OTP_PURPOSE.CHANGE_PHONE]: {
    subject: "Confirm phone number change",
    heading: "Confirm phone change",
    blurb: "Enter this code to confirm your new phone number.",
  },
};

export function otpEmail(purpose: OtpPurpose, code: string) {
  const site = getSiteConfig();
  const copy = COPY[purpose];

  const html = emailLayout(
    `<h1 style="margin:0 0 8px;font-size:20px;color:#18181b;">${copy.heading}</h1>
<p style="margin:0;font-size:14px;line-height:22px;color:#52525b;">${copy.blurb}</p>
${emailOtpBlock(code)}
<p style="margin:0;font-size:13px;line-height:20px;color:#a1a1aa;">This code expires in ${env.OTP_EXPIRY_MINUTES} minutes. Never share it with anyone, including ${site.name} staff.</p>`,
    { preheader: `Your ${site.name} verification code: ${code}` }
  );

  return { subject: `${copy.subject} · ${site.name}`, html };
}
