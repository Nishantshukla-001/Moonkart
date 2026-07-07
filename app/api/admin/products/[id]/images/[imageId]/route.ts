import type { NextRequest } from "next/server";

import { deleteProductImage, updateProductImage } from "@/features/products/services/product.service";
import { updateProductImageSchema } from "@/features/products/validation/product.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { imageId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateProductImageSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const image = await updateProductImage(imageId, parsed.data);
    return apiSuccess(image, "Image updated.");
  } catch {
    return apiError("Image not found.", [], 404);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { imageId } = await params;

  try {
    await deleteProductImage(imageId);
    return apiSuccess(null, "Image deleted.");
  } catch {
    return apiError("Image not found.", [], 404);
  }
}
