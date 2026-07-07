import { getProductBySlug, getRelatedProducts } from "@/features/products/services/product.service";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) return apiError("Product not found.", [], 404);

  const related = await getRelatedProducts(product.id, product.categoryId);
  return apiSuccess(related, "Related products fetched.");
}
