"use client";

import { useEffect } from "react";

import { trackRecentlyViewed } from "@/lib/recentlyViewedStorage";

interface TrackRecentlyViewedProps {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
}

/** Renders nothing — just records this product view to localStorage on mount. */
export function TrackRecentlyViewed(props: TrackRecentlyViewedProps) {
  useEffect(() => {
    trackRecentlyViewed(props);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only re-track if the viewed product itself changes, not on every prop object identity change
  }, [props.productId]);

  return null;
}
