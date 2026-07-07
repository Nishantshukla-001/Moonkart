import { getBrandBySlug } from "@/features/categories/services/brand.service";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug);

  if (!brand || !brand.isActive) return apiError("Brand not found.", [], 404);
  return apiSuccess(brand, "Brand fetched.");
}
