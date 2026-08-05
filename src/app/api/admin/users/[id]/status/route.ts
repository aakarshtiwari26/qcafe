import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { setUserStatus, assertNotSelfDemotion } from "@/services/admin-user.service";
import { handleApiError } from "@/lib/api/errors";
import { logActivity } from "@/lib/audit/log";
import { USER_STATUS, ACTIVITY_ACTION } from "@/constants";

const schema = z.object({ status: z.enum([USER_STATUS.ACTIVE, USER_STATUS.SUSPENDED]) });

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAdmin(request);
    const { id } = await params;
    const { status } = schema.parse(await request.json());

    await assertNotSelfDemotion(session.sub, id);
    const user = await setUserStatus(id, status);

    await logActivity({
      actorId: session.sub,
      actorRole: session.role,
      action: status === USER_STATUS.SUSPENDED ? ACTIVITY_ACTION.USER_SUSPENDED : ACTIVITY_ACTION.USER_ACTIVATED,
      targetType: "User",
      targetId: id,
      request,
    });

    return NextResponse.json({ data: user });
  } catch (error) {
    return handleApiError(error);
  }
}
