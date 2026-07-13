import { Heart } from "lucide-react";
import Link from "next/link";

import { AspectImage } from "@/components/shared/AspectImage";
import { cn } from "@/lib/utils";

interface FeaturedCategoryCardProps {
  name: string;
  slug: string;
  image: string;
  productCount?: number;
  className?: string;
  /** Overrides the default `/categories/${slug}` destination — same convention as CategoryCard. */
  href?: string;
}

// Rotating "mat" tint per card — the pastel container color, not just the text strip.
const pastelMats = [
  { mat: "bg-blush-light", text: "text-blush-hover", ring: "hover:ring-blush-hover/50" },
  { mat: "bg-sage-light", text: "text-sage-hover", ring: "hover:ring-sage-hover/50" },
  { mat: "bg-warm-yellow/40", text: "text-blush-hover", ring: "hover:ring-warm-yellow" },
  { mat: "bg-blush/40", text: "text-blush-hover", ring: "hover:ring-blush-hover/50" },
] as const;

function matFor(slug: string) {
  const sum = [...slug].reduce((total, char) => total + char.charCodeAt(0), 0);
  return pastelMats[sum % pastelMats.length];
}

/**
 * Homepage-only category card — a taller, portrait-image variant sitting in
 * its own pastel "mat" frame, matching the approved homepage mockup.
 * Deliberately a separate component from CategoryCard (used by /categories)
 * so that page's look is untouched.
 */
export function FeaturedCategoryCard({
  name,
  slug,
  image,
  productCount,
  className,
  href,
}: FeaturedCategoryCardProps) {
  const { mat, text, ring } = matFor(slug);

  return (
    <Link href={href ?? `/categories/${slug}`}>
      <div
        className={cn(
          "group flex flex-col gap-0 rounded-[28px] p-2.5 shadow-soft ring-1 ring-transparent transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-soft-lg sm:p-3",
          mat,
          ring,
          className
        )}
      >
        <AspectImage
          src={image}
          alt={name}
          ratio="portrait"
          rounded="rounded-[22px]"
          className="shadow-soft"
          imageClassName="transition-transform duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
        />
        <div className="flex items-end justify-between gap-2 px-2 pt-3 pb-1">
          <div className="flex flex-col gap-0.5">
            <span className="font-heading text-base font-semibold text-text-primary transition-colors duration-[250ms] group-hover:text-blush-hover">
              {name}
            </span>
            {productCount !== undefined && (
              <span className={cn("text-xs font-semibold", text)}>{productCount} products</span>
            )}
          </div>
          <Heart className={cn("size-4 shrink-0", text, "opacity-70")} aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}
