import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { addressSchema } from "@/lib/validators/user";
import { updateAddress, deleteAddress } from "@/services/profile.service";
import { toPublicUser } from "@/lib/serializers/user";
import { handleApiError } from "@/lib/api/errors";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ addressId: string }> }) {
  try {
    const session = await requireSession(request);
    const { addressId } = await params;
    const body = await request.json();
    const input = addressSchema.partial().parse(body);
    const user = await updateAddress(session.sub, addressId, input);
    return NextResponse.json({ data: { user: toPublicUser(user) } });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ addressId: string }> }) {
  try {
    const session = await requireSession(request);
    const { addressId } = await params;
    const user = await deleteAddress(session.sub, addressId);
    return NextResponse.json({ data: { user: toPublicUser(user) } });
  } catch (error) {
    return handleApiError(error);
  }
}
