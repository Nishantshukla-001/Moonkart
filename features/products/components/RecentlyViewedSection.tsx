"use client";

import { useEffect, useState } from "react";

import { Carousel } from "@/components/shared/Carousel";
import { RecentlyViewedCard } from "@/features/products/components/RecentlyViewedCard";
import { ROUTES } from "@/constants/routes";
import { readRecentlyViewed, type RecentlyViewedItem } from "@/lib/recentlyViewedStorage";

/** Reads from localStorage on mount — client-only, so it's rendered nowhere near the initial server HTML (avoids a hydration mismatch for data the server can't see). */
export function RecentlyViewedSection({ excludeSlug, background }: { excludeSlug?: string; background?: "white" | "blush" | "cream" }) {
  const [items, setItems] = useState<RecentlyViewedItem[] | null>(null);

  useEffect(() => {
    const stored = readRecentlyViewed().filter((item) => item.slug !== excludeSlug);
    setItems(stored);
  }, [excludeSlug]);

  if (!items || items.length === 0) return null;

  return (
    <Carousel
      title="Recently Viewed"
      viewAllHref={ROUTES.products}
      ariaLabel="Recently Viewed"
      background={background}
    >
      {items.map((item) => (
        <RecentlyViewedCard key={item.productId} item={item} />
      ))}
    </Carousel>
  );
}
