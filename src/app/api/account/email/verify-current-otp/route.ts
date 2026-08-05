import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { verifyEmailChangeCurrent } from "@/services/account.service";
import { handleApiError } from "@/lib/api/errors";

const schema = z.object({ code: z.string().length(6) });

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession(request);
    const body = await request.json();
    const { code } = schema.parse(body);

    const changeToken = await verifyEmailChangeCurrent(session.sub, code);
    return NextResponse.json({ data: { changeToken } });
  } catch (error) {
    return handleApiError(error);
  }
}
