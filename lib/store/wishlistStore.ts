"use client";

import { create } from "zustand";

import type { IWishlistItemWithProduct } from "@/types/wishlist";

const NETWORK_ERROR_MESSAGE = "Could not reach the server. Check your connection and try again.";

interface WishlistState {
  items: IWishlistItemWithProduct[];
  productIds: Set<string>;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrate: (isAuthenticated: boolean) => Promise<void>;
  toggle: (productId: string, variantId?: string) => Promise<{ success: boolean; message: string }>;
  clearAll: () => Promise<{ success: boolean; message: string }>;
  isWishlisted: (productId: string) => boolean;
}

function toProductIdSet(items: IWishlistItemWithProduct[]) {
  return new Set(items.map((item) => item.productId));
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  productIds: new Set(),
  isAuthenticated: false,
  isLoading: true,

  hydrate: async (isAuthenticated) => {
    set({ isAuthenticated, isLoading: true });

    if (!isAuthenticated) {
      set({ items: [], productIds: new Set(), isLoading: false });
      return;
    }

    try {
      const response = await fetch("/api/wishlist", { cache: "no-store" });
      if (!response.ok) {
        set({ isLoading: false });
        return;
      }

      const json = await response.json();
      const items: IWishlistItemWithProduct[] = json.data?.items ?? [];
      set({ items, productIds: toProductIdSet(items), isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  toggle: async (productId, variantId) => {
    const { productIds, isAuthenticated } = get();

    if (!isAuthenticated) {
      return { success: false, message: "Please log in to save items to your wishlist." };
    }

    try {
      if (productIds.has(productId)) {
        const response = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
        const json = await response.json();
        if (!response.ok) {
          return { success: false, message: json.message ?? "Could not update wishlist." };
        }

        const items: IWishlistItemWithProduct[] = json.data?.items ?? [];
        set({ items, productIds: toProductIdSet(items) });
        return { success: true, message: "Removed from wishlist." };
      }

      const response = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId }),
      });
      const json = await response.json();
      if (!response.ok) {
        return { success: false, message: json.message ?? "Could not update wishlist." };
      }

      const items: IWishlistItemWithProduct[] = json.data?.items ?? [];
      set({ items, productIds: toProductIdSet(items) });
      return { success: true, message: "Added to wishlist." };
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  clearAll: async () => {
    try {
      const response = await fetch("/api/wishlist", { method: "DELETE" });
      const json = await response.json();
      if (!response.ok) {
        return { success: false, message: json.message ?? "Could not clear wishlist." };
      }

      set({ items: [], productIds: new Set() });
      return { success: true, message: "Wishlist cleared." };
    } catch {
      return { success: false, message: NETWORK_ERROR_MESSAGE };
    }
  },

  isWishlisted: (productId) => get().productIds.has(productId),
}));
