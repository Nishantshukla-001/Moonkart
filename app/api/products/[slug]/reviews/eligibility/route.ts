import { getProductBySlug } from "@/features/products/services/product.service";
import { getReviewEligibility } from "@/features/reviews/services/review.service";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiSuccess({ canReview: false, hasPurchased: false, existingReview: null }, "Not authenticated.");

  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return apiError("Product not found.", [], 404);

  const eligibility = await getReviewEligibility(user.id, product.id);
  return apiSuccess(eligibility, "Eligibility fetched.");
}
