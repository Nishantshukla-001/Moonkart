import type { NextRequest } from "next/server";

import { placeOrder } from "@/features/orders/services/order.service";
import { placeOrderSchema } from "@/features/orders/validation/order.schema";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);
  if (!user.isActive) return apiError("This account is deactivated.", [], 403);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = placeOrderSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const result = await placeOrder(user.id, parsed.data.addressId);
  if (!result.success) return apiError(result.error, [], 409);

  return apiSuccess(result.order, "Order placed.", 201);
}
