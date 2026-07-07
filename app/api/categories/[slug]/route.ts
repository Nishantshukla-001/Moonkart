import { getCategoryBySlug } from "@/features/categories/services/category.service";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category || !category.isActive) return apiError("Category not found.", [], 404);
  return apiSuccess(category, "Category fetched.");
}
