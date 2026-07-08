import type { NextRequest } from "next/server";

import { getOrdersAdmin } from "@/features/orders/services/order.service";
import { adminOrderQuerySchema } from "@/features/orders/validation/order.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const query = adminOrderQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));

  const result = await getOrdersAdmin(query);
  return apiSuccess(result, "Orders fetched.");
}
