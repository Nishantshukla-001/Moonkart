import type { NextRequest } from "next/server";

import { getProductBySlug } from "@/features/products/services/product.service";
import { createReview, getReviewsForProduct } from "@/features/reviews/services/review.service";
import { reviewQuerySchema, reviewSchema } from "@/features/reviews/validation/review.schema";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return apiError("Product not found.", [], 404);

  const query = reviewQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  const result = await getReviewsForProduct(product.id, query);
  return apiSuccess(result, "Reviews fetched.");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return apiError("Product not found.", [], 404);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const result = await createReview(user.id, product.id, parsed.data);
  if (!result.success) return apiError(result.error, [], 409);

  return apiSuccess(result.review, "Review submitted.", 201);
}
