import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { resetPassword } from "@/services/account.service";
import { handleApiError, RateLimitedError } from "@/lib/api/errors";
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(`reset-password:${getClientIp(request)}`, RATE_LIMIT_PRESETS.PASSWORD_RESET);
    if (!limit.success) throw new RateLimitedError();

    const body = await request.json();
    const input = resetPasswordSchema.parse(body);
    await resetPassword(input);

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    return handleApiError(error);
  }
}
