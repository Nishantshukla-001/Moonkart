import type { NextRequest } from "next/server";

import {
  addCartItem,
  calculateCartTotals,
  clearCart,
  getOrCreateCart,
  resolveUnitPrice,
} from "@/features/cart/services/cart.service";
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

  // Auth verification and product/stock resolution don't depend on each
  // other — only the mutation itself (below) needs both — so run them
  // concurrently instead of paying their latency back-to-back. Resolving
  // product data doesn't leak anything: it's the same public catalog info
  // the product page already shows to anonymous visitors, and the result is
  // discarded untouched if auth fails.
  const [user, resolved] = await Promise.all([
    getCurrentUser(),
    resolveUnitPrice(parsed.data.productId, parsed.data.variantId),
  ]);
  if (!user) return apiError("Not authenticated.", [], 401);

  const result = await addCartItem(user.id, parsed.data, resolved);
  if (!result.success) return apiError(result.error, [], result.status);

  return apiSuccess({ item: result.item }, "Item added to cart.", 201);
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  await clearCart(user.id);
  return apiSuccess(null, "Cart cleared.");
}
