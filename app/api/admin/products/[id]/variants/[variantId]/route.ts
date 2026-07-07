import type { NextRequest } from "next/server";

import { deleteProductVariant, updateProductVariant } from "@/features/products/services/product.service";
import { updateProductVariantSchema } from "@/features/products/validation/product.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { variantId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateProductVariantSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const variant = await updateProductVariant(variantId, parsed.data);
    return apiSuccess(variant, "Variant updated.");
  } catch {
    return apiError("Variant not found.", [], 404);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { variantId } = await params;

  try {
    await deleteProductVariant(variantId);
    return apiSuccess(null, "Variant deleted.");
  } catch {
    return apiError("Variant not found.", [], 404);
  }
}
