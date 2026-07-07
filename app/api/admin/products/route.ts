import type { NextRequest } from "next/server";

import { createProduct, getProductsAdmin } from "@/features/products/services/product.service";
import { productSchema } from "@/features/products/validation/product.schema";
import { adminProductQuerySchema } from "@/features/admin/validation/adminProductQuery.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const query = adminProductQuerySchema.parse(
    Object.fromEntries(request.nextUrl.searchParams.entries())
  );

  const result = await getProductsAdmin(query);
  return apiSuccess(result, "Products fetched.");
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const product = await createProduct(parsed.data);
    return apiSuccess(product, "Product created.", 201);
  } catch {
    return apiError("A product with this slug or SKU already exists, or the category is invalid.", [], 409);
  }
}
