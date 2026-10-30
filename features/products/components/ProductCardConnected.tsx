"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ProductCard } from "@/components/products/ProductCard";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { getDefaultVariant, getEffectivePrice, toProductCardProps } from "@/features/products/utils";
import type { IProductWithRelations } from "@/types/product";

export function ProductCardConnected({ product }: { product: IProductWithRelations }) {
  const addItem = useCart((state) => state.addItem);
  const isWishlisted = useWishlist((state) => state.isWishlisted(product.id));
  const toggleWishlist = useWishlist((state) => state.toggle);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  async function handleAddToCart() {
    if (isAddingToCart) return;

    const variant = getDefaultVariant(product);

    if (product.stock <= 0 && !variant) {
      toast.error("This product is out of stock.");
      return;
    }

    setIsAddingToCart(true);
    const result = await addItem({
      productId: product.id,
      variantId: variant?.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.imageUrl ?? product.thumbnail,
      price: variant ? (variant.salePrice ?? variant.price ?? getEffectivePrice(product)) : getEffectivePrice(product),
      stock: variant?.stock ?? product.stock,
    });
    setIsAddingToCart(false);

    if (result.success) {
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error(result.message);
    }
  }

  async function handleToggleWishlist() {
    const result = await toggleWishlist(product.id);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <ProductCard
      {...toProductCardProps(product)}
      isWishlisted={isWishlisted}
      onToggleWishlist={handleToggleWishlist}
      onAddToCart={handleAddToCart}
      isAddingToCart={isAddingToCart}
    />
  );
}
