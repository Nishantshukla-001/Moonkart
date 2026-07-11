"use client";

import { useState } from "react";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { AspectImage } from "@/components/shared/AspectImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { LOW_STOCK_THRESHOLD } from "@/features/admin/validation/adminProductQuery.schema";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { formatCurrency } from "@/utils/formatCurrency";

function StockNotice({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <Badge variant="outline" className="border-transparent bg-danger/15 text-danger">
        Out of Stock
      </Badge>
    );
  }
  if (stock <= LOW_STOCK_THRESHOLD) {
    return (
      <Badge variant="outline" className="border-transparent bg-warning/20 text-warning">
        Only {stock} left
      </Badge>
    );
  }
  return null;
}

export default function WishlistPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const items = useWishlist((state) => state.items);
  const isLoading = useWishlist((state) => state.isLoading);
  const toggleWishlist = useWishlist((state) => state.toggle);
  const clearAll = useWishlist((state) => state.clearAll);
  const addItem = useCart((state) => state.addItem);
  const [isClearing, setIsClearing] = useState(false);

  async function handleMoveToCart(
    productId: string,
    name: string,
    slug: string,
    image: string,
    price: number,
    stock: number
  ) {
    if (stock <= 0) return;
    await addItem({ productId, name, slug, image, price, stock });
    await toggleWishlist(productId);
    toast.success(`${name} moved to cart`);
  }

  async function handleClearAll() {
    setIsClearing(true);
    const result = await clearAll();
    setIsClearing(false);

    if (!result.success) {
      toast.error(result.message);
      return;
    }
    toast.success(result.message);
  }

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
            Your Wishlist
          </h1>
          {items.length > 0 && (
            <p className="mt-1 text-sm text-text-muted">
              {items.length} item{items.length === 1 ? "" : "s"} saved
            </p>
          )}
        </div>
        {items.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-danger hover:text-danger"
            disabled={isClearing}
            onClick={handleClearAll}
          >
            <Trash2 className="size-3.5" /> {isClearing ? "Removing..." : "Remove All"}
          </Button>
        )}
      </div>

      {!authLoading && !profile ? (
        <EmptyState
          icon={Heart}
          title="Log in to view your wishlist"
          description="Save your favourite pieces by logging into your MoonKart account."
          actionLabel="Login"
          onAction={() => {
            window.location.href = ROUTES.login;
          }}
        />
      ) : isLoading ? (
        <p className="text-text-secondary">Loading your wishlist...</p>
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          description="Tap the heart icon on any product to save it here."
          actionLabel="Shop Products"
          onAction={() => {
            window.location.href = ROUTES.products;
          }}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const image = item.product.images[0]?.imageUrl ?? item.product.thumbnail;
            const price = item.product.salePrice ?? item.product.price;
            const stock = item.product.stock;
            const outOfStock = stock <= 0;

            return (
              <Card key={item.id} className="flex-row items-center gap-4 p-4">
                <Link href={`/products/${item.product.slug}`} className="size-20 shrink-0">
                  <AspectImage src={image} alt={item.product.name} ratio="square" rounded="rounded-lg" />
                </Link>
                <div className="flex flex-1 flex-col gap-1.5">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="font-heading text-sm font-semibold text-text-primary hover:text-blush-hover"
                  >
                    {item.product.name}
                  </Link>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-text-primary">{formatCurrency(price)}</p>
                    {item.product.salePrice && (
                      <p className="text-xs text-text-muted line-through">{formatCurrency(item.product.price)}</p>
                    )}
                    <StockNotice stock={stock} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      disabled={outOfStock}
                      onClick={() =>
                        handleMoveToCart(item.product.id, item.product.name, item.product.slug, image, price, stock)
                      }
                    >
                      <ShoppingBag className="size-3.5" /> {outOfStock ? "Out of Stock" : "Move to Cart"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(item.product.id)}
                      className="rounded-lg px-2.5 py-2.5 text-xs font-medium text-text-muted transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </Container>
  );
}
