import type { NextRequest } from "next/server";

import { getOrderByIdAdmin, updateOrderStatus } from "@/features/orders/services/order.service";
import { updateOrderStatusSchema } from "@/features/orders/validation/order.schema";
import { getCurrentAdmin } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const order = await getOrderByIdAdmin(id);
  if (!order) return apiError("Order not found.", [], 404);

  return apiSuccess(order, "Order fetched.");
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getCurrentAdmin();
  if (!admin) return apiError("Forbidden.", [], 403);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateOrderStatusSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  try {
    const order = await updateOrderStatus(id, parsed.data.status);
    return apiSuccess(order, "Order status updated.");
  } catch {
    return apiError("Order not found.", [], 404);
  }
}
