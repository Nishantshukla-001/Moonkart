import type { Cart, CartItem, ProductVariant } from "@prisma/client";

export type ICart = Cart;
export type ICartItem = CartItem;

export interface ICartItemWithProduct extends ICartItem {
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    stock: number;
    images: { imageUrl: string }[];
  };
  variant: ProductVariant | null;
}

export interface ICartWithItems extends ICart {
  items: ICartItemWithProduct[];
  itemCount: number;
  subtotal: number;
}

/**
 * A single line item kept in the browser for a guest (signed-out) cart.
 * Denormalized (carries its own name/image/price) so the cart drawer/page
 * can render a guest cart without an extra "fetch products by id" round trip.
 */
export interface GuestCartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  name: string;
  slug: string;
  image: string;
  price: number;
  stock: number;
}
