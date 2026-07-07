import { getNewArrivals } from "@/features/products/services/product.service";
import { apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const products = await getNewArrivals();
  return apiSuccess(products, "New arrivals fetched.");
}
