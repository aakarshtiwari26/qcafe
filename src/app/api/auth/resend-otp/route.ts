import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resendRegistrationOtp } from "@/services/auth.service";
import { handleApiError, RateLimitedError } from "@/lib/api/errors";
import { rateLimit, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";

const schema = z.object({ email: z.string().trim().toLowerCase().email() });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const limit = rateLimit(`resend-otp:${email}`, RATE_LIMIT_PRESETS.OTP_REQUEST);
    if (!limit.success) throw new RateLimitedError("Please wait before requesting another code");

    await resendRegistrationOtp(email);
    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
