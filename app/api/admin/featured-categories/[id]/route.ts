import type { NextRequest } from "next/server";

import {
  removeFeaturedCategory,
  updateFeaturedCategory,
} from "@/features/homepage/services/featuredCategory.service";
import { updateFeaturedCategorySchema } from "@/features/homepage/validation/featuredCategory.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateFeaturedCategorySchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const featured = await updateFeaturedCategory(id, parsed.data);
    return apiSuccess(featured, "Updated.");
  } catch {
    return apiError("Not found.", [], 404);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;

  try {
    await removeFeaturedCategory(id);
    return apiSuccess(null, "Removed from homepage.");
  } catch {
    return apiError("Not found.", [], 404);
  }
}
