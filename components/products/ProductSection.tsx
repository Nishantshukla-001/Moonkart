"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Carousel } from "@/components/shared/Carousel";
import { ProductCard } from "@/components/products/ProductCard";
import type { PlaceholderProduct } from "@/lib/placeholderData";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: PlaceholderProduct[];
  viewAllHref: string;
  background?: "white" | "blush" | "cream";
}

export function ProductSection({
  title,
  subtitle,
  products,
  viewAllHref,
  background = "white",
}: ProductSectionProps) {
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());

  function toggleWishlist(slug: string, name: string) {
    setWishlisted((current) => {
      const next = new Set(current);
      if (next.has(slug)) {
        next.delete(slug);
      } else {
        next.add(slug);
        toast.success(`${name} added to wishlist`);
      }
      return next;
    });
  }

  return (
    <Carousel title={title} subtitle={subtitle} viewAllHref={viewAllHref} ariaLabel={title} background={background}>
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          name={product.name}
          slug={product.slug}
          image={product.image}
          category={product.category}
          rating={product.rating}
          price={product.price}
          oldPrice={product.oldPrice}
          badge={product.badge}
          isWishlisted={wishlisted.has(product.slug)}
          onToggleWishlist={() => toggleWishlist(product.slug, product.name)}
          onAddToCart={() => toast.success(`${product.name} added to cart`)}
        />
      ))}
    </Carousel>
  );
}
