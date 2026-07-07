import { getFeaturedProducts } from "@/features/products/services/product.service";
import { apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const products = await getFeaturedProducts();
  return apiSuccess(products, "Featured products fetched.");
}
