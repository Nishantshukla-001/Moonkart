import { getOrderById } from "@/features/orders/services/order.service";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { id } = await params;
  const order = await getOrderById(user.id, id);
  if (!order) return apiError("Order not found.", [], 404);

  return apiSuccess(order, "Order fetched.");
}
