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
        "group gap-4 rounded-product-card p-0 ring-1 ring-transparent transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-soft-lg hover:ring-blush/25",
        className
      )}
    >
      <div className="relative">
        <Link href={`/products/${slug}`}>
          <AspectImage
            src={image}
            alt={name}
            ratio="square"
            rounded="rounded-t-product-card"
            imageClassName="transition-transform duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
          />
        </Link>
        {badge && <ProductBadge type={badge} className="absolute top-3.5 left-3.5" />}
        <WishlistButton
          active={isWishlisted}
          onToggle={onToggleWishlist}
          className="absolute top-3.5 right-3.5"
        />
      </div>

      <div className="flex flex-col gap-2.5 px-5 pb-6">
        {category && (
          <span className="text-xs font-medium tracking-[0.3px] text-text-muted uppercase">
            {category}
          </span>
        )}
        <Link href={`/products/${slug}`}>
          <h3 className="font-heading text-[22px] leading-snug font-semibold text-text-primary transition-colors duration-[250ms] group-hover:text-blush-hover">
            {name}
          </h3>
        </Link>

        {rating !== undefined && (
          <div className="flex items-center gap-1 text-sm font-medium text-text-secondary">
            <Star className="size-3.5 fill-warning text-warning" />
            {rating.toFixed(1)}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-xl font-bold text-text-primary">{formatCurrency(price)}</span>
          {oldPrice && oldPrice > price && (
            <>
              {discountPercent > 0 && (
                <span className="rounded-full bg-warm-yellow px-2 py-0.5 text-xs font-semibold text-text-primary">
                  -{discountPercent}%
                </span>
              )}
              <span className="text-base font-medium text-text-muted line-through">
                {formatCurrency(oldPrice)}
              </span>
            </>
          )}
        </div>

        <Button
          size="sm"
          className="group/btn mt-2.5 w-full hover:-translate-y-0.5"
          onClick={onAddToCart}
        >
          <ShoppingBag className="transition-transform duration-[250ms] group-hover/btn:-translate-y-0.5 group-hover/btn:scale-110" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
}
