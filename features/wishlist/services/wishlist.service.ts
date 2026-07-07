import "server-only";

import { prisma } from "@/lib/prisma";

const wishlistInclude = {
  items: {
    include: {
      product: {
        include: { images: { orderBy: { displayOrder: "asc" as const }, take: 1 } },
      },
      variant: true,
    },
    orderBy: { createdAt: "desc" as const },
  },
};

export async function getOrCreateWishlist(userId: string) {
  const existing = await prisma.wishlist.findUnique({ where: { userId }, include: wishlistInclude });
  if (existing) return existing;

  return prisma.wishlist.create({ data: { userId }, include: wishlistInclude });
}

export async function addWishlistItem(
  userId: string,
  { productId, variantId }: { productId: string; variantId?: string }
): Promise<
  | { success: true; wishlist: Awaited<ReturnType<typeof getOrCreateWishlist>> }
  | { success: false; error: string }
> {
  // A malformed (non-UUID) productId would otherwise make Prisma throw
  // instead of returning null, crashing the route before it can respond.
  const product = await prisma.product.findUnique({ where: { id: productId } }).catch(() => null);
  if (!product) return { success: false, error: "Product not found." };

  const wishlist = await prisma.wishlist.upsert({
    where: { userId },
    create: { userId },
    update: {},
  });

  const existing = await prisma.wishlistItem.findFirst({
    where: { wishlistId: wishlist.id, productId, variantId: variantId ?? null },
  });

  if (!existing) {
    await prisma.wishlistItem.create({
      data: { wishlistId: wishlist.id, productId, variantId: variantId ?? null },
    });
  }

  return { success: true, wishlist: await getOrCreateWishlist(userId) };
}

export async function removeWishlistItemByProduct(userId: string, productId: string) {
  const wishlist = await prisma.wishlist.findUnique({ where: { userId } });
  if (!wishlist) return null;

  try {
    await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } });
  } catch {
    return null;
  }

  return getOrCreateWishlist(userId);
}
