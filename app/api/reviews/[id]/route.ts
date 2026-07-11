import type { NextRequest } from "next/server";

import { deleteReviewAsOwner, updateReview } from "@/features/reviews/services/review.service";
import { updateReviewSchema } from "@/features/reviews/validation/review.schema";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateReviewSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const review = await updateReview(user.id, id, parsed.data);
  if (!review) return apiError("Review not found.", [], 404);

  return apiSuccess(review, "Review updated.");
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { id } = await params;
  const deleted = await deleteReviewAsOwner(user.id, id);
  if (!deleted) return apiError("Review not found.", [], 404);

  return apiSuccess(null, "Review deleted.");
}
