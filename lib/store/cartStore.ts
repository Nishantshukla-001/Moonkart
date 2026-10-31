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

// Tracks the most recent updateQuantity/removeItem call per cart item id.
// Requests themselves are now serialized per id (see cartLineQueue below),
// so a response is never genuinely "late" relative to a later request — that
// later request hasn't even been sent yet when an earlier one resolves.
// What *isn't* serialized is resyncCartLine's background GET, fired
// fire-and-forget after a failure — this version counter exists solely to
// stop that detached resync from landing after a subsequent queued action
// has already moved the line on.
const latestCartLineRequest = new Map<string, number>();

function beginCartLineRequest(id: string): number {
  const version = (latestCartLineRequest.get(id) ?? 0) + 1;
  latestCartLineRequest.set(id, version);
  return version;
}

function isCurrentCartLineRequest(id: string, version: number): boolean {
  return latestCartLineRequest.get(id) === version;
}

// Serializes updateQuantity/removeItem NETWORK calls (not the optimistic UI
// update, which stays immediate) per cart item id. Without this, two rapid
// clicks on the same line fire two concurrent requests, and the server has
// no way to know which one the shopper intended to happen "first" — it can
// only reject whichever loses the race for its row lock, even if that one
// was the first click. Queuing requests per id means the second click's
// request isn't even sent until the first click's has fully resolved, so
// each one's compare-and-swap basis is always accurate by the time it's
// actually sent.
const cartLineQueue = new Map<string, Promise<void>>();

// Marks a cart item id as explicitly removed the moment removeItem's
// optimistic update runs. A queued updateQuantity task uses this — not "is
// this id merely absent from `items` right now" — to decide whether to skip
// itself or avoid resurrecting a line. `items` can also become momentarily
// empty for a reason that has nothing to do with this line (e.g. the whole
// cart gets re-fetched and briefly reset by an unrelated session/auth
// refresh elsewhere in the app) — treating "absent" as "removed" in that
// case would wrongly skip/drop a perfectly legitimate queued quantity
// change. Explicit removal is the only thing that should suppress it.
const explicitlyRemovedCartLines = new Set<string>();

// Bumped by every authenticated cart mutation's optimistic step (addItem,
// updateQuantity, removeItem). hydrate() captures this value right before
// its own `GET /api/cart`, and after that GET resolves, only applies the
// fetched snapshot if the counter hasn't moved since — otherwise a mutation
// was initiated while hydrate's request was in flight, and that mutation's
// own (more current) response is what should decide the final state, not a
// GET that may have been querying the database before that mutation
// committed. Without this, hydrate — which never goes through
// cartLineQueue or any per-line version check — can have its response
// arrive after a later mutation's and silently overwrite newer, correct
// state with older data. This can happen even without the shopper doing
// anything unusual: hydrate() also re-runs whenever CartProvider sees
// isAuthenticated flip, and AuthProvider's profile can itself flicker
// (e.g. a transient failure of its own internal /api/auth/me check)
// independently of any real login/logout.
let cartMutationGeneration = 0;

function enqueueCartLineTask(id: string, task: () => Promise<void>): Promise<void> {
  const previous = cartLineQueue.get(id) ?? Promise.resolve();
  const next = previous.then(task, task);
  cartLineQueue.set(id, next.catch(() => {}));
  return next;
}

/**
 * Re-fetches the authoritative server cart after a failed/rejected mutation
 * and applies it, instead of leaving the UI on a locally-guessed rollback
 * snapshot — that snapshot is only ever "what this tab last knew," which can
 * itself be stale (e.g. after a 409 compare-and-swap conflict, the server's
 * real quantity is neither what we tried to set nor necessarily what we
 * rolled back to). Skipped if a newer action for this same line has been
 * issued since — that action now owns the outcome.
 */
async function resyncCartLine(
  id: string,
  version: number,
  set: (partial: Partial<CartState>) => void
) {
  if (!isCurrentCartLineRequest(id, version)) return;
  try {
    const response = await fetch("/api/cart", { cache: "no-store" });
    if (!response.ok) return;
    const json = await response.json();
    if (!isCurrentCartLineRequest(id, version)) return;
    const items = (json.data?.items ?? []).map(serverItemToLine);
    set({ items, ...computeTotals(items) });
  } catch {
    // Still unreachable — the local rollback already applied stands.
  }
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
      const generationAtStart = cartMutationGeneration;

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

      if (cartMutationGeneration !== generationAtStart) {
        // A cart mutation started while this GET was in flight. That
        // mutation's own response (success or rollback) is already the
        // authoritative outcome for whatever it touched — this snapshot may
        // have been queried before that mutation committed, so applying it
        // now would silently revert newer, correct state. Just clear the
        // loading flag and leave `items` alone.
        set({ isLoading: false });
        return;
      }

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
      // Optimistic update: show the item in the cart (badge count, drawer,
      // cart page — all read from this same store) immediately, before the
      // network round trip resolves, so Add to Cart feels instant. The
      // server's response below is still what's actually persisted — on
      // success it fully replaces this guess with the authoritative cart
      // (real id, price, stock), and on failure the optimistic change is
      // rolled back to `previousItems`. Nothing here is ever trusted as
      // the final state; it's purely a perceived-latency improvement.
      const previousItems = get().items;
      const existingIndex = previousItems.findIndex(
        (item) => item.productId === input.productId && item.variantId === input.variantId
      );
      const optimisticItems =
        existingIndex >= 0
          ? previousItems.map((item, index) =>
              index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
            )
          : [
              ...previousItems,
              {
                id: `optimistic:${input.productId}:${input.variantId ?? ""}`,
                productId: input.productId,
                variantId: input.variantId,
                name: input.name,
                slug: input.slug,
                image: input.image,
                price: input.price,
                quantity,
                stock: input.stock,
              },
            ];
      set({ items: optimisticItems, ...computeTotals(optimisticItems) });
      cartMutationGeneration++;

      try {
        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: input.productId, variantId: input.variantId, quantity }),
        });
        const json = await response.json();
        if (!response.ok) {
          set({ items: previousItems, ...computeTotals(previousItems) });
          return { success: false, message: json.message ?? "Could not add to cart." };
        }

        const items = (json.data?.items ?? []).map(serverItemToLine);
        set({ items, ...computeTotals(items) });
        return { success: true, message: "Added to cart." };
      } catch {
        set({ items: previousItems, ...computeTotals(previousItems) });
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
      const previousItems = get().items;
      const existing = previousItems.find((item) => item.id === id);
      if (!existing) return; // nothing to update — e.g. already optimistically removed
      const expectedQuantity = existing.quantity;

      // Optimistic update happens immediately, on every click, regardless of
      // queue position — only the network call below is serialized.
      const optimisticItems = previousItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      );
      set({ items: optimisticItems, ...computeTotals(optimisticItems) });
      cartMutationGeneration++;

      await enqueueCartLineTask(id, async () => {
        // A remove queued ahead of this task (issued after this click, but
        // whose turn in the queue came up first because it was behind
        // nothing) already took the line out — nothing left to update.
        if (explicitlyRemovedCartLines.has(id)) return;

        const version = beginCartLineRequest(id); // used only to gate the detached resync below
        try {
          const response = await fetch(`/api/cart/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity, expectedQuantity }),
          });
          const json = await response.json();

          if (!response.ok) {
            if (response.status === 404) {
              const withoutItem = get().items.filter((item) => item.id !== id);
              set({ items: withoutItem, ...computeTotals(withoutItem) });
              return;
            }
            if (explicitlyRemovedCartLines.has(id)) {
              // A remove queued behind this one already took the line out
              // while this request was in flight — don't resurrect it just
              // because this particular update failed.
              toast.error(json.message ?? "Could not update quantity.");
              return;
            }
            // Covers a rejected compare-and-swap (409 — the quantity
            // changed server-side since we last saw it) and any other
            // rejection. Either way, this request's intended quantity was
            // NOT saved — roll back immediately, then resync with the
            // server's actual state rather than trusting our own snapshot.
            set({ items: previousItems, ...computeTotals(previousItems) });
            toast.error(json.message ?? "Could not update quantity.");
            void resyncCartLine(id, version, set);
            return;
          }

          if (explicitlyRemovedCartLines.has(id)) {
            // Same resurrection guard, for the success path: a remove
            // queued behind this update already removed the line while
            // this request was in flight — the queued remove's own
            // response, not this now-stale "it still exists", owns the
            // final state.
            return;
          }
          const items = (json.data?.items ?? []).map(serverItemToLine);
          set({ items, ...computeTotals(items) });
        } catch {
          if (explicitlyRemovedCartLines.has(id)) return;
          set({ items: previousItems, ...computeTotals(previousItems) });
          toast.error(NETWORK_ERROR_MESSAGE);
          void resyncCartLine(id, version, set);
        }
      });
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
      const previousItems = get().items;
      const optimisticItems = previousItems.filter((item) => item.id !== id);
      set({ items: optimisticItems, ...computeTotals(optimisticItems) });
      cartMutationGeneration++;
      // Marked immediately (not after the request resolves) so a quantity
      // task for this same id, still waiting in the queue behind this one,
      // knows right away not to bother sending its own request.
      explicitlyRemovedCartLines.add(id);

      await enqueueCartLineTask(id, async () => {
        const version = beginCartLineRequest(id); // used only to gate the detached resync below
        try {
          const response = await fetch(`/api/cart/${id}`, { method: "DELETE" });
          const json = await response.json();

          if (!response.ok) {
            if (response.status === 404) {
              // The server already agrees this item is gone — either this
              // request's own delete raced a concurrent one that won first,
              // or it was already removed some other way. The optimistic
              // removal already reflects that correctly; rolling back would
              // resurrect an item the server insists doesn't exist.
              return;
            }
            // The remove itself failed — it's not actually gone, so undo the
            // "explicitly removed" mark along with the optimistic removal,
            // or a legitimate quantity task queued behind this one would
            // stay incorrectly suppressed forever.
            explicitlyRemovedCartLines.delete(id);
            set({ items: previousItems, ...computeTotals(previousItems) });
            toast.error(json.message ?? "Could not remove item.");
            void resyncCartLine(id, version, set);
            return;
          }
          const items = (json.data?.items ?? []).map(serverItemToLine);
          set({ items, ...computeTotals(items) });
        } catch {
          explicitlyRemovedCartLines.delete(id);
          set({ items: previousItems, ...computeTotals(previousItems) });
          toast.error(NETWORK_ERROR_MESSAGE);
          void resyncCartLine(id, version, set);
        }
      });
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
