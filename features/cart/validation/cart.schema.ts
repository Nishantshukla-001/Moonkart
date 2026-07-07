import { z } from "zod";

export const cartItemInputSchema = z.object({
  productId: z.uuid("Invalid product"),
  variantId: z.uuid("Invalid variant").optional(),
  quantity: z.number().int("Quantity must be a whole number").min(1, "Quantity must be at least 1"),
});

export type CartItemInput = z.infer<typeof cartItemInputSchema>;

export const updateCartItemSchema = z.object({
  quantity: z.number().int("Quantity must be a whole number").min(1, "Quantity must be at least 1"),
});

export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;

/** A single line from the guest (localStorage) cart, sent to /api/cart/merge. */
export const guestCartItemSchema = z.object({
  productId: z.uuid("Invalid product"),
  variantId: z.uuid("Invalid variant").optional(),
  quantity: z.number().int().min(1),
});

export const mergeCartSchema = z.object({
  items: z.array(guestCartItemSchema).max(100, "Too many items"),
});

export type MergeCartInput = z.infer<typeof mergeCartSchema>;
