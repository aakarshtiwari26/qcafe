import { connectDB } from "@/lib/db/connect";
import { Review } from "@/models";
import { NotFoundError } from "@/lib/api/errors";
import type { ReviewInput } from "@/lib/validators/review";

export async function listActiveReviews() {
  await connectDB();
  return Review.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
}

export async function listReviewsForAdmin() {
  await connectDB();
  return Review.find({}).sort({ sortOrder: 1, createdAt: -1 });
}

export async function createReview(input: ReviewInput) {
  await connectDB();
  return Review.create(input);
}

export async function updateReview(id: string, input: Partial<ReviewInput>) {
  await connectDB();
  const review = await Review.findByIdAndUpdate(id, input, { new: true, runValidators: true });
  if (!review) throw new NotFoundError("Review not found");
  return review;
}

export async function deleteReview(id: string) {
  await connectDB();
  const review = await Review.findByIdAndDelete(id);
  if (!review) throw new NotFoundError("Review not found");
}
