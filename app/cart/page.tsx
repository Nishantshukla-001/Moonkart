"use client";

import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import Link from "next/link";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { AspectImage } from "@/components/shared/AspectImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { useCart } from "@/hooks/useCart";
import { formatCurrency } from "@/utils/formatCurrency";

export default function CartPage() {
  const items = useCart((state) => state.items);
  const subtotal = useCart((state) => state.subtotal);
  const isLoading = useCart((state) => state.isLoading);
  const updateQuantity = useCart((state) => state.updateQuantity);
  const removeItem = useCart((state) => state.removeItem);

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <div>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Cart" }]} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          Your Bag
        </h1>
      </div>

      {isLoading ? (
        <p className="text-text-secondary">Loading your bag...</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your bag is empty"
          description="Explore our catalog and add something you love."
          actionLabel="Shop Products"
          onAction={() => {
            window.location.href = ROUTES.products;
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-4 lg:col-span-2">
            {items.map((item) => (
              <Card key={item.id} className="flex-row items-center gap-4 p-4">
                <Link href={`/products/${item.slug}`} className="size-24 shrink-0">
                  <AspectImage src={item.image} alt={item.name} ratio="square" rounded="rounded-lg" />
                </Link>

                <div className="flex flex-1 flex-col gap-1.5">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-heading text-base font-semibold text-text-primary hover:text-blush-hover"
                  >
                    {item.name}
                  </Link>
                  <p className="text-sm font-semibold text-text-primary">
                    {formatCurrency(item.price)}
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      aria-label="Decrease quantity"
                    >
                      <Minus />
                    </Button>
                    <span className="w-7 text-center text-sm text-text-primary">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="Increase quantity"
                      disabled={item.quantity >= item.stock}
                    >
                      <Plus />
                    </Button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label="Remove item"
                  className="flex size-10 shrink-0 items-center justify-center self-start rounded-full text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                >
                  <X className="size-5" />
                </button>
              </Card>
            ))}
          </div>

          <Card className="h-fit p-6">
            <h2 className="mb-4 font-heading text-lg font-semibold text-text-primary">
              Order Summary
            </h2>
            <div className="flex items-center justify-between border-b border-divider pb-4 text-sm text-text-secondary">
              <span>Subtotal</span>
              <span className="font-semibold text-text-primary">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between py-4 font-heading text-base font-semibold text-text-primary">
              <span>Total</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <Button size="lg" className="w-full" disabled title="Checkout is coming soon">
              Checkout — Coming Soon
            </Button>
          </Card>
        </div>
      )}
    </Container>
  );
}
