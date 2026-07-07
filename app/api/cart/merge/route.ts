import type { NextRequest } from "next/server";

import { calculateCartTotals, mergeGuestCart } from "@/features/cart/services/cart.service";
import { mergeCartSchema } from "@/features/cart/validation/cart.schema";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

/** Merges the guest (localStorage) cart into the user's DB cart, called once right after login. */
export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = mergeCartSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const cart = await mergeGuestCart(user.id, parsed.data);
  return apiSuccess({ ...cart, ...calculateCartTotals(cart) }, "Cart merged.");
}
