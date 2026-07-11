import type { NextRequest } from "next/server";
import { z } from "zod";

import { deleteReviewAsAdmin, setReviewHidden } from "@/features/reviews/services/review.service";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

const setHiddenSchema = z.object({ isHidden: z.boolean() });

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = setHiddenSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const review = await setReviewHidden(id, parsed.data.isHidden);
  if (!review) return apiError("Review not found.", [], 404);

  return apiSuccess(review, parsed.data.isHidden ? "Review hidden." : "Review unhidden.");
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const deleted = await deleteReviewAsAdmin(id);
  if (!deleted) return apiError("Review not found.", [], 404);

  return apiSuccess(null, "Review deleted.");
}
