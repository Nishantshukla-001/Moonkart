import type { NextRequest } from "next/server";

import { removeCartItem, updateCartItemQuantity } from "@/features/cart/services/cart.service";
import { updateCartItemSchema } from "@/features/cart/validation/cart.schema";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ itemId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { itemId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = updateCartItemSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const result = await updateCartItemQuantity(
    user.id,
    itemId,
    parsed.data.quantity,
    parsed.data.expectedQuantity
  );
  if (!result.success) return apiError(result.error, [], result.status);

  return apiSuccess({ item: result.item }, "Quantity updated.");
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { itemId } = await params;
  const result = await removeCartItem(user.id, itemId);
  if (!result.success) return apiError("Cart item not found.", [], 404);

  return apiSuccess(null, "Item removed.");
}
