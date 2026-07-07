import type { NextRequest } from "next/server";

import {
  categoryHasProducts,
  deleteCategory,
  updateCategory,
} from "@/features/categories/services/category.service";
import { updateCategorySchema } from "@/features/categories/validation/category.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const category = await prisma.category.findUnique({
    where: { id },
    include: { subCategories: true },
  });

  if (!category) return apiError("Category not found.", [], 404);
  return apiSuccess(category, "Category fetched.");
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const category = await updateCategory(id, parsed.data);
    return apiSuccess(category, "Category updated.");
  } catch {
    return apiError("Category not found or slug already in use.", [], 409);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;

  if (await categoryHasProducts(id)) {
    return apiError("Cannot delete a category that still has products.", [], 409);
  }

  try {
    await deleteCategory(id);
    return apiSuccess(null, "Category deleted.");
  } catch {
    return apiError("Category not found.", [], 404);
  }
}
