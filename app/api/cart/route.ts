import type { NextRequest } from "next/server";

import { addCartItem, calculateCartTotals, clearCart, getOrCreateCart } from "@/features/cart/services/cart.service";
import { cartItemInputSchema } from "@/features/cart/validation/cart.schema";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const cart = await getOrCreateCart(user.id);
  return apiSuccess({ ...cart, ...calculateCartTotals(cart) }, "Cart fetched.");
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = cartItemInputSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const result = await addCartItem(user.id, parsed.data);
  if (!result.success) return apiError(result.error, [], 404);

  return apiSuccess(
    { ...result.cart, ...calculateCartTotals(result.cart) },
    "Item added to cart.",
    201
  );
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  await clearCart(user.id);
  return apiSuccess(null, "Cart cleared.");
}
