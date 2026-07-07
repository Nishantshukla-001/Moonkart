"use client";

import { useEffect, useRef } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useWishlistStore } from "@/lib/store/wishlistStore";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { profile, isLoading: authLoading } = useAuth();
  const hydrate = useWishlistStore((state) => state.hydrate);
  const lastAuthState = useRef<boolean | null>(null);

  useEffect(() => {
    if (authLoading) return;

    const isAuthenticated = Boolean(profile);
    if (lastAuthState.current === isAuthenticated) return;

    lastAuthState.current = isAuthenticated;
    hydrate(isAuthenticated);
  }, [profile, authLoading, hydrate]);

  return <>{children}</>;
}
