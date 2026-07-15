import type { NextRequest } from "next/server";

import { addFeaturedSubCategory } from "@/features/homepage/services/featuredCategory.service";
import { addFeaturedSubCategorySchema } from "@/features/homepage/validation/featuredCategory.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = addFeaturedSubCategorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const featured = await addFeaturedSubCategory(parsed.data.subCategoryId);
    return apiSuccess(featured, "Subcategory added.", 201);
  } catch {
    return apiError("This subcategory is already featured, or does not exist.", [], 409);
  }
}
