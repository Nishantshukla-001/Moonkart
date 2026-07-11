import type { NextRequest } from "next/server";

import { getReviewsAdmin } from "@/features/reviews/services/review.service";
import { adminReviewQuerySchema } from "@/features/reviews/validation/review.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const query = adminReviewQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  const result = await getReviewsAdmin(query);
  return apiSuccess(result, "Reviews fetched.");
}
