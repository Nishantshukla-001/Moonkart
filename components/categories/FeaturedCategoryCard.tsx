"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AspectImage } from "@/components/shared/AspectImage";
import { luxeEase } from "@/lib/motion";
import { cn } from "@/lib/utils";

interface FeaturedCategorySubItem {
  id: string;
  name: string;
  href: string;
}

interface FeaturedCategoryCardProps {
  name: string;
  slug: string;
  image: string;
  productCount?: number;
  className?: string;
  /** Overrides the default `/categories/${slug}` destination — same convention as CategoryCard. */
  href?: string;
  /** When present, the name row becomes an expand/collapse toggle revealing these links instead of navigating directly. */
  subCategories?: FeaturedCategorySubItem[];
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
 *
 * When `subCategories` is passed, the name row becomes an accordion toggle
 * (image still links straight to the category) that expands in place to
 * list them, instead of the homepage rendering a separate chip row outside
 * the card.
 */
export function FeaturedCategoryCard({
  name,
  slug,
  image,
  productCount,
  className,
  href,
  subCategories = [],
}: FeaturedCategoryCardProps) {
  const { mat, text, ring } = matFor(slug);
  const [expanded, setExpanded] = useState(false);
  const hasSubCategories = subCategories.length > 0;
  const destination = href ?? `/categories/${slug}`;

  const nameRow = (
    <>
      <div className="flex flex-col gap-0.5">
        <span className="font-heading text-base font-semibold text-text-primary transition-colors duration-[250ms] group-hover:text-blush-hover">
          {name}
        </span>
        {productCount !== undefined && (
          <span className={cn("text-xs font-semibold", text)}>{productCount} products</span>
        )}
      </div>
      {hasSubCategories ? (
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            text,
            expanded && "rotate-180"
          )}
          aria-hidden="true"
        />
      ) : (
        <Heart className={cn("size-4 shrink-0", text, "opacity-70")} aria-hidden="true" />
      )}
    </>
  );

  return (
    <div
      className={cn(
        "group flex flex-col gap-0 rounded-[28px] p-2.5 shadow-soft ring-1 ring-transparent transition-all duration-[350ms] ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-2 hover:shadow-soft-lg sm:p-3",
        mat,
        ring,
        className
      )}
    >
      <Link href={destination}>
        <AspectImage
          src={image}
          alt={name}
          ratio="portrait"
          rounded="rounded-[22px]"
          className="shadow-soft"
          imageClassName="transition-transform duration-[500ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.08]"
        />
      </Link>

      {hasSubCategories ? (
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          className="flex items-end justify-between gap-2 px-2 pt-3 pb-1 text-left"
        >
          {nameRow}
        </button>
      ) : (
        <Link href={destination} className="flex items-end justify-between gap-2 px-2 pt-3 pb-1">
          {nameRow}
        </Link>
      )}

      <AnimatePresence initial={false}>
        {hasSubCategories && expanded && (
          <motion.div
            key="subcategories"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: luxeEase }}
            className="overflow-hidden"
          >
            <ul className="flex flex-col gap-0.5 px-1 pt-1 pb-1">
              {subCategories.map((subCategory) => (
                <li key={subCategory.id}>
                  <Link
                    href={subCategory.href}
                    className="block rounded-lg px-2 py-1.5 text-sm text-text-secondary transition-colors duration-200 hover:bg-white/60 hover:text-text-primary"
                  >
                    {subCategory.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
