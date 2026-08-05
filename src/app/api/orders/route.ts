import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { createOrderSchema } from "@/lib/validators/order";
import { createOrder, listOrdersForUser } from "@/services/order.service";
import { handleApiError, RateLimitedError } from "@/lib/api/errors";
import { rateLimit } from "@/lib/security/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const params = request.nextUrl.searchParams;
    const page = params.get("page") ? Number(params.get("page")) : undefined;
    const result = await listOrdersForUser(session.sub, page);
    return NextResponse.json({ data: result });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);

    const limit = rateLimit(`create-order:${session.sub}`, { windowMs: 60_000, max: 10 });
    if (!limit.success) throw new RateLimitedError("Too many orders placed, please slow down");

    const body = await request.json();
    const input = createOrderSchema.parse(body);
    const order = await createOrder(session.sub, input, request);

    return NextResponse.json({ data: order }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
