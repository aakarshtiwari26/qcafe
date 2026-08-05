import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { verifyEmailChangeNew } from "@/services/account.service";
import { toPublicUser } from "@/lib/serializers/user";
import { handleApiError } from "@/lib/api/errors";

const schema = z.object({ code: z.string().length(6) });

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();
    const { code } = schema.parse(body);

    const user = await verifyEmailChangeNew(session.sub, code);
    return NextResponse.json({ data: { user: toPublicUser(user) } });
  } catch (error) {
    return handleApiError(error);
  }
}
