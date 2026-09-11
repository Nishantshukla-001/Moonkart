"use client";

import { useMemo, useState } from "react";

import { ProductGallery } from "@/features/products/components/ProductGallery";
import { ProductPurchasePanel } from "@/features/products/components/ProductPurchasePanel";
import type { IProductWithRelations } from "@/types/product";

interface ProductVariantSectionProps {
  product: IProductWithRelations;
  /** The product's full image list (thumbnail + gallery), exactly as computed in app/products/[slug]/page.tsx today. */
  images: string[];
  /** Server-rendered content between the gallery/panel column's top and the purchase panel — brand, name, rating, price, short description. Doesn't depend on the selected variant, so it stays untouched, just relocated here. */
  header: React.ReactNode;
  /** Server-rendered content after the purchase panel — the category/SKU/weight/dimensions detail list. */
  details: React.ReactNode;
}

/**
 * Owns size/color selection so the gallery (left column) and the purchase
 * panel (right column) — otherwise unconnected sibling components — can
 * both react to the same selected variant. This is the only state lifted
 * out of ProductPurchasePanel; quantity, wishlist, and add-to-cart stay
 * exactly where they were.
 */
export function ProductVariantSection({ product, images, header, details }: ProductVariantSectionProps) {
  const sizes = useMemo(
    () => [...new Set(product.variants.map((variant) => variant.size).filter(Boolean))] as string[],
    [product.variants]
  );
  const colors = useMemo(
    () => [...new Set(product.variants.map((variant) => variant.color).filter(Boolean))] as string[],
    [product.variants]
  );

  const defaultVariant = product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
  const [selectedSize, setSelectedSize] = useState(defaultVariant?.size ?? undefined);
  const [selectedColor, setSelectedColor] = useState(defaultVariant?.color ?? undefined);

  const selectedVariant = product.hasVariants
    ? product.variants.find(
        (variant) =>
          (sizes.length === 0 || variant.size === selectedSize) &&
          (colors.length === 0 || variant.color === selectedColor)
      )
    : undefined;

  // The selected variant's own image (if it has one) moves to the front so
  // the gallery opens on it — the rest of the product's images stay right
  // after it, still browsable. Products with no variant image, or no
  // variants at all, see the exact same `images` list as before.
  const galleryImages = useMemo(() => {
    if (!selectedVariant?.image) return images;
    return [selectedVariant.image, ...images.filter((image) => image !== selectedVariant.image)];
  }, [images, selectedVariant]);

  return (
    <>
      {/* Keyed by the selected variant so the gallery's internal scroll/active-index state resets to the front image whenever the color changes, instead of staying on whatever index the shopper had scrolled to. */}
      <ProductGallery key={selectedVariant?.id ?? "base"} images={galleryImages} name={product.name} />

      <div className="flex flex-col gap-5">
        {header}

        <div key="purchase-panel" id="product-purchase-panel">
          <ProductPurchasePanel
            product={product}
            sizes={sizes}
            colors={colors}
            selectedSize={selectedSize}
            selectedColor={selectedColor}
            selectedVariant={selectedVariant}
            onSelectSize={setSelectedSize}
            onSelectColor={setSelectedColor}
          />
        </div>

        {details}
      </div>
    </>
  );
}
