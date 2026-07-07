import type { NextRequest } from "next/server";

import { getProducts } from "@/features/products/services/product.service";
import { productQuerySchema } from "@/features/products/validation/productQuery.schema";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? request.nextUrl.searchParams.get("search");
  if (!query || !query.trim()) {
    return apiError("A search query is required.", [], 422);
  }

  const parsed = productQuerySchema.safeParse({
    ...Object.fromEntries(request.nextUrl.searchParams),
    search: query,
  });
  if (!parsed.success) {
    return apiError(
      "Invalid query parameters.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const result = await getProducts(parsed.data);
  return apiSuccess(result, "Search results fetched.");
}
