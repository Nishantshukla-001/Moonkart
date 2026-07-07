import { removeWishlistItemByProduct } from "@/features/wishlist/services/wishlist.service";
import { getCurrentUser } from "@/lib/auth";
import { apiError, apiSuccess } from "@/lib/apiResponse";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return apiError("Not authenticated.", [], 401);

  const { productId } = await params;
  const wishlist = await removeWishlistItemByProduct(user.id, productId);
  if (!wishlist) return apiError("Wishlist not found.", [], 404);

  return apiSuccess(wishlist, "Removed from wishlist.");
}
