"use client";

import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/utils/formatCurrency";

export interface CartDrawerItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CartDrawerItem[];
  subtotal: number;
  onIncreaseQuantity?: (id: string) => void;
  onDecreaseQuantity?: (id: string) => void;
  onRemoveItem?: (id: string) => void;
  onCheckout?: () => void;
}

export function CartDrawer({
  open,
  onOpenChange,
  items,
  subtotal,
  onIncreaseQuantity,
  onDecreaseQuantity,
  onRemoveItem,
  onCheckout,
}: CartDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-4/5 sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Bag</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4">
          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Your bag is empty"
              description="Add products to see them here."
            />
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-image bg-bg-dashboard">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-heading text-sm font-semibold text-text-primary">
                        {item.name}
                      </p>
                      <button
                        type="button"
                        onClick={() => onRemoveItem?.(item.id)}
                        aria-label="Remove item"
                        className="text-text-muted transition-colors hover:text-danger"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-text-primary">
                      {formatCurrency(item.price)}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon-xs"
                        onClick={() => onDecreaseQuantity?.(item.id)}
                        aria-label="Decrease quantity"
                      >
                        <Minus />
                      </Button>
                      <span className="w-6 text-center text-sm text-text-primary">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        onClick={() => onIncreaseQuantity?.(item.id)}
                        aria-label="Increase quantity"
                      >
                        <Plus />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="gap-3 border-t border-divider">
            <div className="flex items-center justify-between">
              <span className="font-heading text-base font-semibold text-text-primary">
                Subtotal
              </span>
              <span className="font-heading text-lg font-bold text-text-primary">
                {formatCurrency(subtotal)}
              </span>
            </div>
            <Button size="lg" className="w-full" onClick={onCheckout}>
              Checkout
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
