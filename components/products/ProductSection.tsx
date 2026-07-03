"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { ProductCard } from "@/components/products/ProductCard";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { cn } from "@/lib/utils";
import type { PlaceholderProduct } from "@/lib/placeholderData";

interface ProductSectionProps {
  title: string;
  subtitle?: string;
  products: PlaceholderProduct[];
  viewAllHref: string;
  background?: "white" | "blush" | "cream";
}

const sectionBackgrounds = {
  white: "",
  blush: "bg-blush-light/40",
  cream: "bg-bg-section",
} as const;

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
    <section className={cn("py-16 sm:py-20", sectionBackgrounds[background])}>
      <Container>
        <Reveal className="mb-10 flex items-end justify-between gap-4 sm:mb-12">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
              {title}
            </h2>
            {subtitle && <p className="text-base text-text-secondary">{subtitle}</p>}
          </div>
          <Button variant="ghost" size="sm" className="hidden shrink-0 sm:inline-flex" render={<Link href={viewAllHref} />}>
            View All
            <ArrowRight />
          </Button>
        </Reveal>

        <Reveal
          stagger
          className="grid grid-cols-2 gap-5 sm:gap-7 md:grid-cols-3 lg:grid-cols-4"
        >
          {products.map((product) => (
            <RevealItem key={product.slug}>
              <ProductCard
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
            </RevealItem>
          ))}
        </Reveal>

        <div className="mt-8 flex justify-center sm:hidden">
          <Button variant="outline" render={<Link href={viewAllHref} />}>
            View All
            <ArrowRight />
          </Button>
        </div>
      </Container>
    </section>
  );
}
