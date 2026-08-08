import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { reviewSchema } from "@/lib/validators/review";
import { listReviewsForAdmin, createReview } from "@/services/review.service";
import { handleApiError } from "@/lib/api/errors";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const reviews = await listReviewsForAdmin();
    return NextResponse.json({ data: reviews });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin(request);
    const body = await request.json();
    const input = reviewSchema.parse(body);
    const review = await createReview(input);
    return NextResponse.json({ data: review }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
