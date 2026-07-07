import type { NextRequest } from "next/server";

import {
  deleteProduct,
  getProductByIdAdmin,
  updateProduct,
} from "@/features/products/services/product.service";
import { updateProductSchema } from "@/features/products/validation/product.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const product = await getProductByIdAdmin(id);
  if (!product) return apiError("Product not found.", [], 404);

  return apiSuccess(product, "Product fetched.");
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateProductSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const product = await updateProduct(id, parsed.data);
    return apiSuccess(product, "Product updated.");
  } catch {
    return apiError("Product not found, or the slug/SKU is already in use.", [], 409);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;

  try {
    await deleteProduct(id);
    return apiSuccess(null, "Product deleted.");
  } catch {
    return apiError("Product not found.", [], 404);
  }
}
