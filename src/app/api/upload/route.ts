import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { USER_ROLE } from "@/constants";
import { handleApiError, AppError, ForbiddenError } from "@/lib/api/errors";
import { validateImageFile } from "@/lib/security/file-validation";
import { uploadImage } from "@/lib/imagekit/client";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";

const ADMIN_ONLY_FOLDERS = new Set(["menu", "category", "restaurant"]);
const ALLOWED_FOLDERS = new Set(["menu", "category", "restaurant", "avatar"]);

export async function POST(request: NextRequest) {
  try {
    const limit = rateLimit(`upload:${getClientIp(request)}`, { windowMs: 60_000, max: 20 });
    if (!limit.success) {
      throw new AppError("Too many uploads, please slow down", 429, "RATE_LIMITED");
    }

    const session = await requireSession(request);

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File) || typeof folder !== "string" || !ALLOWED_FOLDERS.has(folder)) {
      throw new AppError("Invalid upload request", 400, "INVALID_UPLOAD");
    }

    const isAdmin = session.role === USER_ROLE.ADMIN || session.role === USER_ROLE.SUPER_ADMIN;
    if (ADMIN_ONLY_FOLDERS.has(folder) && !isAdmin) {
      throw new ForbiddenError("Only admins can upload to this folder");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    validateImageFile(file, buffer);

    const uploaded = await uploadImage(buffer, file.name, folder);

    return NextResponse.json({ data: uploaded }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
