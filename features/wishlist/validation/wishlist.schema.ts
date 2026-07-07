import { z } from "zod";

export const wishlistItemInputSchema = z.object({
  productId: z.uuid("Invalid product"),
  variantId: z.uuid("Invalid variant").optional(),
});

export type WishlistItemInput = z.infer<typeof wishlistItemInputSchema>;
