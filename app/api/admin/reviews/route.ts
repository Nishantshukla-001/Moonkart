import type { NextRequest } from "next/server";

import { getReviewsAdmin } from "@/features/reviews/services/review.service";
import { adminReviewQuerySchema } from "@/features/reviews/validation/review.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const parsed = adminReviewQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return apiError(
      "Invalid query parameters.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const result = await getReviewsAdmin(parsed.data);
  return apiSuccess(result, "Reviews fetched.");
}
