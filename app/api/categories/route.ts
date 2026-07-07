import { getCategories } from "@/features/categories/services/category.service";
import { apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const categories = await getCategories();
  return apiSuccess(categories, "Categories fetched.");
}
