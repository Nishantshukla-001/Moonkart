import { getProductBySlug } from "@/features/products/services/product.service";
import { getRatingBreakdown } from "@/features/reviews/services/review.service";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return apiError("Product not found.", [], 404);

  const breakdown = await getRatingBreakdown(product.id);
  return apiSuccess(breakdown, "Rating breakdown fetched.");
}
