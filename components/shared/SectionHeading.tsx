import { Flower2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  className?: string;
}

/**
 * Shared pastel-gradient heading used across the homepage's own sections
 * (never imported by shared, cross-page components like Carousel — those
 * opt in individually so this styling never leaks onto non-homepage pages).
 */
export function SectionHeading({ title, subtitle, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <h2 className="flex items-center gap-2 bg-gradient-to-r from-blush-hover via-blush to-blush-hover bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-[32px]">
        <Flower2 className="size-5 shrink-0 text-sage/70" aria-hidden="true" />
        {title}
        <Flower2 className="size-5 shrink-0 scale-x-[-1] text-blush-hover/70" aria-hidden="true" />
      </h2>
      {subtitle && <p className="max-w-lg text-base text-text-secondary">{subtitle}</p>}
    </div>
  );
}
