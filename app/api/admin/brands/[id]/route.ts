import type { NextRequest } from "next/server";

import { brandHasProducts, deleteBrand, updateBrand } from "@/features/categories/services/brand.service";
import { updateBrandSchema } from "@/features/categories/validation/brand.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateBrandSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const brand = await updateBrand(id, parsed.data);
    return apiSuccess(brand, "Brand updated.");
  } catch {
    return apiError("Brand not found or slug already in use.", [], 409);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;

  if (await brandHasProducts(id)) {
    return apiError("Cannot delete a brand that still has products.", [], 409);
  }

  try {
    await deleteBrand(id);
    return apiSuccess(null, "Brand deleted.");
  } catch {
    return apiError("Brand not found.", [], 404);
  }
}
