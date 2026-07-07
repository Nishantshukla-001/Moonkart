"use client";

import { create } from "zustand";
import { toast } from "sonner";

import { clearGuestCart, readGuestCart, writeGuestCart } from "@/lib/cartStorage";
import type { GuestCartItem } from "@/types/cart";

const NETWORK_ERROR_MESSAGE = "Could not reach the server. Check your connection and try again.";

/** A cart line normalized for display, regardless of guest vs. server-backed mode. */
export interface CartLine {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  stock: number;
}

function guestLineId(productId: string, variantId?: string) {
  return `guest:${productId}:${variantId ?? ""}`;
}

function guestItemToLine(item: GuestCartItem): CartLine {
  return {
    id: guestLineId(item.productId, item.variantId),
    productId: item.productId,
    variantId: item.variantId,
    name: item.name,
    slug: item.slug,
    image: item.image,
    price: item.price,
    quantity: item.quantity,
    stock: item.stock,
  };
}

interface ServerCartItem {
  id: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  price: number;
  product: { name: string; slug: string; thumbnail: string; stock: number; images: { imageUrl: string }[] };
  variant: { stock: number; image: string | null } | null;
}

function serverItemToLine(item: ServerCartItem): CartLine {
  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId ?? undefined,
    name: item.product.name,
    slug: item.product.slug,
    image: item.variant?.image ?? item.product.images[0]?.imageUrl ?? item.product.thumbnail,
    price: item.price,
    quantity: item.quantity,
    stock: item.variant?.stock ?? item.product.stock,
  };
}

interface CartState {
  items: CartLine[];
  isLoading: boolean;
  isAuthenticated: boolean;
  isDrawerOpen: boolean;
  itemCount: number;
  subtotal: number;
  setDrawerOpen: (open: boolean) => void;
  hydrate: (isAuthenticated: boolean) => Promise<void>;
  addItem: (
    input: Omit<GuestCartItem, "quantity"> & { quantity?: number }
  ) => Promise<{ success: boolean; message: string }>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

function computeTotals(items: CartLine[]) {
  return {
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

async function fetchServerCart(): Promise<CartLine[]> {
  try {
    const response = await fetch("/api/cart", { cache: "no-store" });
    if (!response.ok) return [];
    const json = await response.json();
    return (json.data?.items ?? []).map(serverItemToLine);
  } catch {
    // Network error (server unreachable, connection dropped, etc.) — fail
    // quietly to an empty cart rather than letting the rejection escape.
    return [];
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoading: true,
  isAuthenticated: false,
  isDrawerOpen: false,
  itemCount: 0,
  subtotal: 0,

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),

  hydrate: async (isAuthenticated) => {
    set({ isLoading: true, isAuthenticated });

    if (isAuthenticated) {
      // Merge whatever was in the guest cart (if any), then load the server cart.
      const guestItems = readGuestCart();
      if (guestItems.length > 0) {
        try {
          const response = await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: guestItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
              })),
            }),
          });
          // Only clear the guest cart once we know the merge actually
          // reached the server — otherwise a dropped request would silently
          // lose those items forever.
          if (response.ok) clearGuestCart();
        } catch {
          // Leave the guest cart in localStorage; it will retry on the next
          // hydrate (e.g. next page load) instead of being lost.
        }
      }

      const items = await fetchServerCart();
      set({ items, isLoading: false, ...computeTotals(items) });
      return;
    }

    const items = readGuestCart().map(guestItemToLine);
    set({ items, isLoading: false, ...computeTotals(items) });
  },

  addItem: async (input) => {
    const quantity = input.quantity ?? 1;
    const { isAuthenticated } = get();

    if (isAuthenticated) {
      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: input.productId, variantId: input.variantId, quantity }),
        });
        const json = await response.json();
        if (!response.ok) return { success: false, message: json.message ?? "Could not add to cart." };

        const items = (json.data?.items ?? []).map(serverItemToLine);
        set({ items, ...computeTotals(items) });
        return { success: true, message: "Added to cart." };
      } catch {
        return { success: false, message: NETWORK_ERROR_MESSAGE };
      }
    }

    const guestItems = readGuestCart();
    const existingIndex = guestItems.findIndex(
      (item) => item.productId === input.productId && item.variantId === input.variantId
    );

    if (existingIndex >= 0) {
      guestItems[existingIndex] = {
        ...guestItems[existingIndex],
        quantity: guestItems[existingIndex].quantity + quantity,
      };
    } else {
      guestItems.push({ ...input, quantity });
    }

    writeGuestCart(guestItems);
    const items = guestItems.map(guestItemToLine);
    set({ items, ...computeTotals(items) });
    return { success: true, message: "Added to cart." };
  },

  updateQuantity: async (id, quantity) => {
    const { isAuthenticated } = get();

    if (isAuthenticated) {
      try {
        const response = await fetch(`/api/cart/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity }),
        });
        const json = await response.json();
        if (!response.ok) {
          toast.error(json.message ?? "Could not update quantity.");
          return;
        }
        const items = (json.data?.items ?? []).map(serverItemToLine);
        set({ items, ...computeTotals(items) });
      } catch {
        toast.error(NETWORK_ERROR_MESSAGE);
      }
      return;
    }

    const guestItems = readGuestCart();
    const updated = guestItems
      .map((item) =>
        guestLineId(item.productId, item.variantId) === id ? { ...item, quantity } : item
      )
      .filter((item) => item.quantity > 0);

    writeGuestCart(updated);
    const items = updated.map(guestItemToLine);
    set({ items, ...computeTotals(items) });
  },

  removeItem: async (id) => {
    const { isAuthenticated } = get();

    if (isAuthenticated) {
      try {
        const response = await fetch(`/api/cart/${id}`, { method: "DELETE" });
        const json = await response.json();
        if (!response.ok) {
          toast.error(json.message ?? "Could not remove item.");
          return;
        }
        const items = (json.data?.items ?? []).map(serverItemToLine);
        set({ items, ...computeTotals(items) });
      } catch {
        toast.error(NETWORK_ERROR_MESSAGE);
      }
      return;
    }

    const guestItems = readGuestCart().filter(
      (item) => guestLineId(item.productId, item.variantId) !== id
    );
    writeGuestCart(guestItems);
    const items = guestItems.map(guestItemToLine);
    set({ items, ...computeTotals(items) });
  },

  clear: async () => {
    const { isAuthenticated } = get();

    if (isAuthenticated) {
      try {
        await fetch("/api/cart", { method: "DELETE" });
      } catch {
        toast.error(NETWORK_ERROR_MESSAGE);
        return;
      }
    } else {
      clearGuestCart();
    }

    set({ items: [], itemCount: 0, subtotal: 0 });
  },
}));
