import type { NextRequest } from "next/server";

import { calculateCartTotals, removeCartItem, updateCartItemQuantity } from "@/features/cart/services/cart.service";
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

  const cart = await updateCartItemQuantity(user.id, itemId, parsed.data.quantity);
  if (!cart) return apiError("Cart item not found.", [], 404);

  return apiSuccess({ ...cart, ...calculateCartTotals(cart) }, "Quantity updated.");
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ itemId: string }> }) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { itemId } = await params;
  const cart = await removeCartItem(user.id, itemId);
  if (!cart) return apiError("Cart item not found.", [], 404);

  return apiSuccess({ ...cart, ...calculateCartTotals(cart) }, "Item removed.");
}
