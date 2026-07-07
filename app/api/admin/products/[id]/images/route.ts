import type { NextRequest } from "next/server";

import { addProductImage } from "@/features/products/services/product.service";
import { productImageSchema } from "@/features/products/validation/product.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = productImageSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const image = await addProductImage(id, parsed.data);
    return apiSuccess(image, "Image added.", 201);
  } catch {
    return apiError("Product not found.", [], 404);
  }
}
