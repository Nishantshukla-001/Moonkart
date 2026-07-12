import { ShoppingBag, Star } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductBadge, type ProductBadgeType } from "@/components/products/ProductBadge";
import { AspectImage } from "@/components/shared/AspectImage";
import { WishlistButton } from "@/components/shared/WishlistButton";
import { calculateDiscountPercent } from "@/utils/calculateDiscount";
import { formatCurrency } from "@/utils/formatCurrency";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  name: string;
  slug: string;
  image: string;
  category?: string;
  rating?: number;
  price: number;
  oldPrice?: number;
  badge?: ProductBadgeType;
  isWishlisted?: boolean;
  onToggleWishlist?: () => void;
  onAddToCart?: () => void;
  className?: string;
}

export function ProductCard({
  name,
  slug,
  image,
  category,
  rating,
  price,
  oldPrice,
  badge,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  className,
}: ProductCardProps) {
  const discountPercent = oldPrice ? calculateDiscountPercent(oldPrice, price) : 0;

  return (
    <Card
      className={cn(
        "group h-full w-full gap-3 rounded-product-card p-0 ring-1 ring-transparent transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:shadow-soft-lg hover:ring-blush/25",
        className
      )}
    >
      {/* Top: badge + wishlist float over the image; Middle: the image itself. */}
      <div className="relative shrink-0">
        <Link href={`/products/${slug}`} tabIndex={-1} aria-hidden="true">
          <AspectImage
            src={image}
            alt={name}
            ratio="square"
            rounded="rounded-t-product-card"
            imageClassName="transition-transform duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
          />
        </Link>
        {badge && <ProductBadge type={badge} className="absolute top-3 left-3" />}
        <WishlistButton
          active={isWishlisted}
          onToggle={onToggleWishlist}
          className="absolute top-3 right-3"
        />
      </div>

      {/* Bottom: category, name, rating, price, and a full-width CTA pinned
          to the card's bottom edge via mt-auto — so every card in a row
          lines up its button regardless of how many lines the name wraps to.
          Kept deliberately compact (tight gaps, smaller type, a "sm" button)
          so the card reads as square/premium rather than a tall rectangle. */}
      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4">
        {category && (
          <span className="text-[11px] font-medium tracking-[0.3px] text-text-muted uppercase">
            {category}
          </span>
        )}
        <Link href={`/products/${slug}`}>
          <h3 className="line-clamp-1 font-heading text-[15px] leading-snug font-semibold text-text-primary transition-colors duration-[250ms] group-hover:text-blush-hover">
            {name}
          </h3>
        </Link>

        {rating !== undefined && (
          <div className="flex items-center gap-1 text-xs font-medium text-text-secondary">
            <Star className="size-3 fill-warning text-warning" aria-hidden="true" />
            <span aria-hidden="true">{rating.toFixed(1)}</span>
            <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-base font-bold text-text-primary">{formatCurrency(price)}</span>
          {oldPrice && oldPrice > price && (
            <>
              {discountPercent > 0 && (
                <span className="rounded-full bg-warm-yellow px-1.5 py-0.5 text-[10px] font-semibold text-text-primary">
                  -{discountPercent}%
                </span>
              )}
              <span className="text-xs font-medium text-text-muted line-through">
                {formatCurrency(oldPrice)}
              </span>
            </>
          )}
        </div>

        <Button
          size="sm"
          className="group/btn mt-2 w-full hover:-translate-y-0.5"
          onClick={onAddToCart}
          aria-label={`Add ${name} to cart`}
        >
          <ShoppingBag className="transition-transform duration-[250ms] group-hover/btn:-translate-y-0.5 group-hover/btn:scale-110" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
