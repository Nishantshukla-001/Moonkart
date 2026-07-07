import type { NextRequest } from "next/server";

import { createBrand, getBrands } from "@/features/categories/services/brand.service";
import { brandSchema } from "@/features/categories/validation/brand.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const brands = await getBrands({ includeInactive: true });
  return apiSuccess(brands, "Brands fetched.");
}

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = brandSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const brand = await createBrand(parsed.data);
    return apiSuccess(brand, "Brand created.", 201);
  } catch {
    return apiError("A brand with this slug already exists.", [], 409);
  }
}
