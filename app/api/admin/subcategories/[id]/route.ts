import type { NextRequest } from "next/server";

import {
  deleteSubCategory,
  subCategoryHasProducts,
  updateSubCategory,
} from "@/features/categories/services/subCategory.service";
import { updateSubCategorySchema } from "@/features/categories/validation/subCategory.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateSubCategorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const subCategory = await updateSubCategory(id, parsed.data);
    return apiSuccess(subCategory, "Subcategory updated.");
  } catch {
    return apiError("Subcategory not found or slug already in use.", [], 409);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;

  if (await subCategoryHasProducts(id)) {
    return apiError("Cannot delete a subcategory that still has products.", [], 409);
  }

  try {
    await deleteSubCategory(id);
    return apiSuccess(null, "Subcategory deleted.");
  } catch {
    return apiError("Subcategory not found.", [], 404);
  }
}
