import type { NextRequest } from "next/server";

import { addWishlistItem, clearWishlist, getOrCreateWishlist } from "@/features/wishlist/services/wishlist.service";
import { wishlistItemInputSchema } from "@/features/wishlist/validation/wishlist.schema";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const wishlist = await getOrCreateWishlist(user.id);
  return apiSuccess(wishlist, "Wishlist fetched.");
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const wishlist = await clearWishlist(user.id);
  if (!wishlist) return apiError("Wishlist not found.", [], 404);

  return apiSuccess(wishlist, "Wishlist cleared.");
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const body = await request.json().catch(() => null);
  if (!body) return apiError("Invalid request body.", [], 400);

  const parsed = wishlistItemInputSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(
      "Validation failed.",
      parsed.error.issues.map((issue) => issue.message),
      422
    );
  }

  const result = await addWishlistItem(user.id, parsed.data);
  if (!result.success) return apiError(result.error, [], 404);

  return apiSuccess(result.wishlist, "Added to wishlist.", 201);
}
