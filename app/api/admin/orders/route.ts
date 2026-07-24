import type { NextRequest } from "next/server";

import { getOrdersAdmin } from "@/features/orders/services/order.service";
import { adminOrderQuerySchema } from "@/features/orders/validation/order.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const parsed = adminOrderQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams.entries()));
  if (!parsed.success) {
    return apiError(
      "Invalid query parameters.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const result = await getOrdersAdmin(parsed.data);
  return apiSuccess(result, "Orders fetched.");
}
