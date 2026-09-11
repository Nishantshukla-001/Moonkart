"use client";

import { Heart, Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import type { IProductVariant, IProductWithRelations } from "@/types/product";

interface ProductPurchasePanelProps {
  product: IProductWithRelations;
  /** Sizes/colors and the currently-selected variant are owned by the parent (ProductVariantSection) — the gallery needs to react to the same selection, so it can't live locally here anymore. Everything else (quantity, wishlist, add-to-cart) is unchanged. */
  sizes: string[];
  colors: string[];
  selectedSize?: string;
  selectedColor?: string;
  selectedVariant?: IProductVariant;
  onSelectSize: (size: string) => void;
  onSelectColor: (color: string) => void;
}

export function ProductPurchasePanel({
  product,
  sizes,
  colors,
  selectedSize,
  selectedColor,
  selectedVariant,
  onSelectSize,
  onSelectColor,
}: ProductPurchasePanelProps) {
  const addItem = useCart((state) => state.addItem);
  const isWishlisted = useWishlist((state) => state.isWishlisted(product.id));
  const toggleWishlist = useWishlist((state) => state.toggle);

  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const price = selectedVariant
    ? (selectedVariant.salePrice ?? selectedVariant.price ?? product.price)
    : (product.salePrice ?? product.price);
  const stock = selectedVariant ? selectedVariant.stock : product.stock;
  const canAddToCart = product.hasVariants ? Boolean(selectedVariant) && stock > 0 : stock > 0;

  async function handleAddToCart() {
    if (!canAddToCart) return;
    setIsSubmitting(true);

    const result = await addItem({
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      slug: product.slug,
      image: selectedVariant?.image ?? product.images[0]?.imageUrl ?? product.thumbnail,
      price,
      stock,
      quantity,
    });

    setIsSubmitting(false);
    if (result.success) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error(result.message);
    }
  }

  async function handleToggleWishlist() {
    const result = await toggleWishlist(product.id, selectedVariant?.id);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  }

  return (
    <div className="flex flex-col gap-5">
      {sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-heading text-sm font-semibold text-text-primary">Size</span>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onSelectSize(size)}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-[250ms]",
                  selectedSize === size
                    ? "border-blush-hover bg-blush-light text-text-primary"
                    : "border-border-medium text-text-secondary hover:border-blush"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-heading text-sm font-semibold text-text-primary">
            Selected Color: {selectedColor}
          </span>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => onSelectColor(color)}
                aria-pressed={selectedColor === color}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-medium transition-colors duration-[250ms]",
                  selectedColor === color
                    ? "border-blush-hover bg-blush-light text-text-primary"
                    : "border-border-medium text-text-secondary hover:border-blush"
                )}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <span className="font-heading text-sm font-semibold text-text-primary">Quantity</span>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            <Minus />
          </Button>
          <span className="w-8 text-center text-base font-medium text-text-primary">{quantity}</span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
            aria-label="Increase quantity"
            disabled={quantity >= stock}
          >
            <Plus />
          </Button>
        </div>
      </div>

      <p className="text-sm font-medium">
        {stock > 0 ? (
          <span className="text-success">In Stock ({stock} available)</span>
        ) : (
          <span className="text-danger">Out of Stock</span>
        )}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="w-full sm:flex-1"
          onClick={handleAddToCart}
          disabled={!canAddToCart || isSubmitting}
        >
          <ShoppingBag />
          {product.hasVariants && !selectedVariant ? "Select options" : "Add to Cart"}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          onClick={handleToggleWishlist}
          aria-pressed={isWishlisted}
        >
          <Heart className={cn(isWishlisted && "fill-blush text-blush")} />
          {isWishlisted ? "Wishlisted" : "Wishlist"}
        </Button>
      </div>
    </div>
  );
}
