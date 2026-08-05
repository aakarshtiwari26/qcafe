import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { hostelSchema } from "@/lib/validators/menu";
import { listHostels, createHostel } from "@/services/hostel.service";
import { handleApiError } from "@/lib/api/errors";
import { logActivity } from "@/lib/audit/log";
import { ACTIVITY_ACTION } from "@/constants";

export async function GET() {
  try {
    const hostels = await listHostels();
    return NextResponse.json({ data: hostels });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin(request);
    const body = await request.json();
    const input = hostelSchema.parse(body);
    const hostel = await createHostel(input);

    await logActivity({
      actorId: session.sub,
      actorRole: session.role,
      action: ACTIVITY_ACTION.SETTINGS_UPDATED,
      targetType: "Hostel",
      targetId: String(hostel._id),
      request,
    });

    return NextResponse.json({ data: hostel }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
