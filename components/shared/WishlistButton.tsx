"use client";

import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  active?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function WishlistButton({ active = false, onToggle, className }: WishlistButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      className={cn(
        "flex size-10 items-center justify-center rounded-full bg-background/85 shadow-soft backdrop-blur-sm transition-all duration-[250ms] hover:scale-110 hover:shadow-soft-md",
        className
      )}
    >
      <Heart
        className={cn(
          "size-[18px] transition-all duration-[250ms]",
          active ? "scale-110 fill-blush text-blush" : "text-text-secondary"
        )}
      />
    </button>
  );
}
