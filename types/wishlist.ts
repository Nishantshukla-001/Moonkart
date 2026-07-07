import type { ProductVariant, Wishlist, WishlistItem } from "@prisma/client";

export type IWishlist = Wishlist;
export type IWishlistItem = WishlistItem;

export interface IWishlistItemWithProduct extends IWishlistItem {
  product: {
    id: string;
    name: string;
    slug: string;
    thumbnail: string;
    price: number;
    salePrice: number | null;
    averageRating: number;
    images: { imageUrl: string }[];
  };
  variant: ProductVariant | null;
}

export interface IWishlistWithItems extends IWishlist {
  items: IWishlistItemWithProduct[];
}
