import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth";
import { register } from "@/services/auth.service";
import { handleApiError, RateLimitedError } from "@/lib/api/errors";
import { rateLimit, getClientIp, RATE_LIMIT_PRESETS } from "@/lib/security/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(`register:${getClientIp(request)}`, RATE_LIMIT_PRESETS.REGISTER);
    if (!limit.success) throw new RateLimitedError();

    const body = await request.json();
    const input = registerSchema.parse(body);
    const result = await register(input, request);

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
