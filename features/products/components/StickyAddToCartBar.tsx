"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { AspectImage } from "@/components/shared/AspectImage";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatCurrency";
import { getDefaultVariant, getEffectivePrice } from "@/features/products/utils";
import type { IProductWithRelations } from "@/types/product";

/**
 * Mobile-only quick-add bar that appears once the user scrolls past the main
 * purchase panel. Deliberately independent of `ProductPurchasePanel`'s
 * size/color selection state (no coupling into that already-working
 * component) — it quick-adds the default variant, or for products that
 * require an explicit choice, scrolls back up to the real panel instead of
 * guessing which variant the shopper wants.
 */
export function StickyAddToCartBar({ product }: { product: IProductWithRelations }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addItem = useCart((state) => state.addItem);

  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 560);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const defaultVariant = getDefaultVariant(product);
  const needsExplicitSelection = product.hasVariants && !defaultVariant;
  const price = defaultVariant
    ? (defaultVariant.salePrice ?? defaultVariant.price ?? getEffectivePrice(product))
    : getEffectivePrice(product);
  const stock = defaultVariant ? defaultVariant.stock : product.stock;

  async function handleQuickAdd() {
    if (needsExplicitSelection) {
      document.getElementById("product-purchase-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (stock <= 0) return;

    setIsSubmitting(true);
    const result = await addItem({
      productId: product.id,
      variantId: defaultVariant?.id,
      name: product.name,
      slug: product.slug,
      image: defaultVariant?.image ?? product.images[0]?.imageUrl ?? product.thumbnail,
      price,
      stock,
    });
    setIsSubmitting(false);

    if (result.success) toast.success(`${product.name} added to cart`);
    else toast.error(result.message);
  }

  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-border-light bg-background/95 px-4 py-3 shadow-soft-lg backdrop-blur-md lg:hidden">
      <div className="size-11 shrink-0 overflow-hidden rounded-lg">
        <AspectImage src={product.thumbnail} alt="" ratio="square" rounded="rounded-lg" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium text-text-primary">{product.name}</p>
        <p className="text-sm font-semibold text-text-primary">{formatCurrency(price)}</p>
      </div>
      <Button onClick={handleQuickAdd} disabled={isSubmitting || (!needsExplicitSelection && stock <= 0)} className="shrink-0">
        <ShoppingBag />
        {needsExplicitSelection ? "Select Options" : stock <= 0 ? "Out of Stock" : "Add to Cart"}
      </Button>
    </div>
  );
}
