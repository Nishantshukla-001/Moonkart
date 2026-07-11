"use client";

import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeClasses = { sm: "size-3.5", md: "size-5", lg: "size-7" };

export function RatingStars({ rating, size = "sm", interactive, onChange, className }: RatingStarsProps) {
  return (
    <div className={cn("flex items-center gap-0.5", className)} role={interactive ? "radiogroup" : undefined} aria-label={interactive ? "Rating" : `${rating.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(rating);
        return interactive ? (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={star === Math.round(rating)}
            aria-label={`${star} star${star === 1 ? "" : "s"}`}
            onClick={() => onChange?.(star)}
            className="flex size-11 items-center justify-center rounded-md transition-transform hover:scale-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring sm:size-9"
          >
            <Star className={cn(sizeClasses[size], filled ? "fill-warning text-warning" : "text-border-medium")} />
          </button>
        ) : (
          <Star
            key={star}
            aria-hidden="true"
            className={cn(sizeClasses[size], filled ? "fill-warning text-warning" : "text-border-medium")}
          />
        );
      })}
    </div>
  );
}
