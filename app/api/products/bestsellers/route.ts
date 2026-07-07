import { getBestSellers } from "@/features/products/services/product.service";
import { apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const products = await getBestSellers();
  return apiSuccess(products, "Best sellers fetched.");
}
