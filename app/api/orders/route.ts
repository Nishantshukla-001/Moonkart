import type { NextRequest } from "next/server";

import { getOrdersForUser } from "@/features/orders/services/order.service";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const page = Number(request.nextUrl.searchParams.get("page")) || 1;
  const pageSize = Number(request.nextUrl.searchParams.get("pageSize")) || 10;

  const result = await getOrdersForUser(user.id, page, pageSize);
  return apiSuccess(result, "Orders fetched.");
}
