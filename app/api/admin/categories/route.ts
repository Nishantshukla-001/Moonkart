import type { NextRequest } from "next/server";

import { getCategoriesAdmin, createCategory } from "@/features/categories/services/category.service";
import { categorySchema } from "@/features/categories/validation/category.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const categories = await getCategoriesAdmin();
  return apiSuccess(categories, "Categories fetched.");
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const category = await createCategory(parsed.data);
    return apiSuccess(category, "Category created.", 201);
  } catch {
    return apiError("A category with this slug already exists.", [], 409);
  }
}
