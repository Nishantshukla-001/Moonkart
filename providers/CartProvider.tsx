"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { CartDrawer } from "@/components/shared/CartDrawer";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/lib/store/cartStore";

/**
 * Keeps the cart store in sync with auth state: loads the guest
 * (localStorage) cart while signed out, and merges it into the server cart
 * the moment a session appears (login/signup), per docs' "merge guest cart
 * after login" requirement. Also hosts the global cart drawer, so any
 * "Add to Cart" click anywhere in the app can open it.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { profile, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const hydrate = useCartStore((state) => state.hydrate);
  const lastAuthState = useRef<boolean | null>(null);

  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.subtotal);
  const isDrawerOpen = useCartStore((state) => state.isDrawerOpen);
  const setDrawerOpen = useCartStore((state) => state.setDrawerOpen);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  useEffect(() => {
    if (authLoading) return;

    const isAuthenticated = Boolean(profile);
    if (lastAuthState.current === isAuthenticated) return;

    lastAuthState.current = isAuthenticated;
    hydrate(isAuthenticated);
  }, [profile, authLoading, hydrate]);

  function handleQuantityChange(id: string, delta: number) {
    const item = items.find((line) => line.id === id);
    if (!item) return;
    const nextQuantity = item.quantity + delta;
    if (nextQuantity <= 0) {
      removeItem(id);
    } else {
      updateQuantity(id, nextQuantity);
    }
  }

  return (
    <>
      {children}
      <CartDrawer
        open={isDrawerOpen}
        onOpenChange={setDrawerOpen}
        items={items}
        subtotal={subtotal}
        onIncreaseQuantity={(id) => handleQuantityChange(id, 1)}
        onDecreaseQuantity={(id) => handleQuantityChange(id, -1)}
        onRemoveItem={removeItem}
        onCheckout={() => {
          setDrawerOpen(false);
          router.push(ROUTES.checkout);
        }}
      />
    </>
  );
}
