import { getBrands } from "@/features/categories/services/brand.service";
import { apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const brands = await getBrands();
  return apiSuccess(brands, "Brands fetched.");
}
