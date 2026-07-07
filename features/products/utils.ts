import type { ProductBadgeType } from "@/components/products/ProductBadge";
import type { IProductWithRelations } from "@/types/product";

const NEW_ARRIVAL_WINDOW_DAYS = 14;

/** Effective selling price — the sale price when one is set, otherwise the base price. */
export function getEffectivePrice(product: Pick<IProductWithRelations, "price" | "salePrice">) {
  return product.salePrice ?? product.price;
}

export function getProductBadge(
  product: Pick<IProductWithRelations, "salePrice" | "isBestSeller" | "isFeatured" | "createdAt">
): ProductBadgeType | undefined {
  if (product.salePrice) return "sale";
  if (product.isBestSeller) return "trending";
  if (product.isFeatured) return "exclusive";

  const ageInDays = (Date.now() - new Date(product.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (ageInDays <= NEW_ARRIVAL_WINDOW_DAYS) return "new";

  return undefined;
}

/** Maps a catalog Product into the props ProductCard expects. */
export function toProductCardProps(product: IProductWithRelations) {
  return {
    name: product.name,
    slug: product.slug,
    image: product.images[0]?.imageUrl ?? product.thumbnail,
    category: product.category?.name,
    rating: product.averageRating > 0 ? product.averageRating : undefined,
    price: getEffectivePrice(product),
    oldPrice: product.salePrice ? product.price : undefined,
    badge: getProductBadge(product),
  };
}

/** The variant used when a "quick add" doesn't ask the shopper to choose one. */
export function getDefaultVariant(product: IProductWithRelations) {
  if (!product.hasVariants || product.variants.length === 0) return undefined;
  return product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
}
