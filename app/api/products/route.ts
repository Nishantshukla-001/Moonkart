import type { NextRequest } from "next/server";

import { getProducts } from "@/features/products/services/product.service";
import { productQuerySchema } from "@/features/products/validation/productQuery.schema";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  const parsed = productQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return apiError(
      "Invalid query parameters.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const result = await getProducts(parsed.data);
  return apiSuccess(result, "Products fetched.");
}
