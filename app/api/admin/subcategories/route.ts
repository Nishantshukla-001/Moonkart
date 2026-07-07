import type { NextRequest } from "next/server";

import { createSubCategory, getSubCategories } from "@/features/categories/services/subCategory.service";
import { subCategorySchema } from "@/features/categories/validation/subCategory.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const categoryId = request.nextUrl.searchParams.get("categoryId") ?? undefined;
  const subCategories = await getSubCategories({ categoryId, includeInactive: true });
  return apiSuccess(subCategories, "Subcategories fetched.");
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = subCategorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const subCategory = await createSubCategory(parsed.data);
    return apiSuccess(subCategory, "Subcategory created.", 201);
  } catch {
    return apiError("A subcategory with this slug already exists, or the category is invalid.", [], 409);
  }
}
