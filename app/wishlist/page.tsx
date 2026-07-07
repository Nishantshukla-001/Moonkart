"use client";

import { Heart, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { AspectImage } from "@/components/shared/AspectImage";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { formatCurrency } from "@/utils/formatCurrency";

export default function WishlistPage() {
  const { profile, isLoading: authLoading } = useAuth();
  const items = useWishlist((state) => state.items);
  const isLoading = useWishlist((state) => state.isLoading);
  const toggleWishlist = useWishlist((state) => state.toggle);
  const addItem = useCart((state) => state.addItem);

  async function handleMoveToCart(
    productId: string,
    name: string,
    slug: string,
    image: string,
    price: number
  ) {
    await addItem({ productId, name, slug, image, price, stock: 1 });
    await toggleWishlist(productId);
    toast.success(`${name} moved to cart`);
  }

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <div>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Wishlist" }]} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          Your Wishlist
        </h1>
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
                  <p className="text-sm font-semibold text-text-primary">{formatCurrency(price)}</p>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={() =>
                        handleMoveToCart(item.product.id, item.product.name, item.product.slug, image, price)
                      }
                    >
                      <ShoppingBag className="size-3.5" /> Move to Cart
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
