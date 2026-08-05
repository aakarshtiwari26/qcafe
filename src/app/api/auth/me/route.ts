import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models";
import { toPublicUser } from "@/lib/serializers/user";
import { handleApiError, NotFoundError } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession(request);
    await connectDB();
    const user = await User.findById(session.sub).populate("hostel");
    if (!user) throw new NotFoundError("Account not found");
    return NextResponse.json({ data: { user: toPublicUser(user) } });
  } catch (error) {
    return handleApiError(error);
  }
}
