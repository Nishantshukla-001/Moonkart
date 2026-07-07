import "server-only";

import { prisma } from "@/lib/prisma";
import type { MergeCartInput } from "@/features/cart/validation/cart.schema";

const cartInclude = {
  items: {
    include: {
      product: {
        include: { images: { orderBy: { displayOrder: "asc" as const }, take: 1 } },
      },
      variant: true,
    },
    orderBy: { createdAt: "asc" as const },
  },
};

export async function getOrCreateCart(userId: string) {
  const existing = await prisma.cart.findUnique({ where: { userId }, include: cartInclude });
  if (existing) return existing;

  return prisma.cart.create({ data: { userId }, include: cartInclude });
}

async function resolveUnitPrice(productId: string, variantId: string | null | undefined) {
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({ where: { id: variantId } });
    if (!variant || variant.productId !== productId) return null;
    return { unitPrice: variant.salePrice ?? variant.price ?? 0, stock: variant.stock };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return null;
  return { unitPrice: product.salePrice ?? product.price, stock: product.stock };
}

export async function addCartItem(
  userId: string,
  { productId, variantId, quantity }: { productId: string; variantId?: string; quantity: number }
): Promise<
  { success: true; cart: Awaited<ReturnType<typeof getOrCreateCart>> } | { success: false; error: string }
> {
  // Independent of each other — resolving the product/variant price and
  // ensuring the cart row exists don't depend on one another, so run them
  // concurrently instead of paying two sequential round trips.
  const [resolved, cart] = await Promise.all([
    resolveUnitPrice(productId, variantId),
    prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} }),
  ]);
  if (!resolved) return { success: false, error: "Product not found." };

  // Prisma's compound-unique lookup rejects `null` for one of the key
  // fields (SQL NULL is never equal to itself, so it can't back a unique
  // index probe), so the single-upsert shortcut only works when a variant
  // is present. Products without a variant (the common case) still need
  // the findFirst + create/update pair.
  if (variantId) {
    await prisma.cartItem.upsert({
      where: { cartId_productId_variantId: { cartId: cart.id, productId, variantId } },
      create: { cartId: cart.id, productId, variantId, quantity, price: resolved.unitPrice },
      update: { quantity: { increment: quantity }, price: resolved.unitPrice },
    });
  } else {
    const existing = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: null },
    });

    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity, price: resolved.unitPrice },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId, variantId: null, quantity, price: resolved.unitPrice },
      });
    }
  }

  return { success: true, cart: await getOrCreateCart(userId) };
}

/**
 * Looks up a cart item by id, scoped to `userId`. Returns null both when the
 * item genuinely doesn't exist AND when `itemId` isn't a well-formed UUID —
 * the latter would otherwise make Prisma throw a `PrismaClientValidationError`
 * that crashes the route instead of returning a clean 404.
 */
async function findOwnedCartItem(userId: string, itemId: string) {
  try {
    const item = await prisma.cartItem.findUnique({ where: { id: itemId }, include: { cart: true } });
    if (!item || item.cart.userId !== userId) return null;
    return item;
  } catch {
    return null;
  }
}

export async function updateCartItemQuantity(userId: string, itemId: string, quantity: number) {
  const item = await findOwnedCartItem(userId, itemId);
  if (!item) return null;

  await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  return getOrCreateCart(userId);
}

export async function removeCartItem(userId: string, itemId: string) {
  const item = await findOwnedCartItem(userId, itemId);
  if (!item) return null;

  await prisma.cartItem.delete({ where: { id: itemId } });
  return getOrCreateCart(userId);
}

export async function clearCart(userId: string) {
  const cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) return;
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
}

/** Merges a guest (localStorage) cart into the user's DB cart on login. */
export async function mergeGuestCart(userId: string, { items }: MergeCartInput) {
  for (const item of items) {
    await addCartItem(userId, item);
  }
  return getOrCreateCart(userId);
}

export function calculateCartTotals(cart: { items: { price: number; quantity: number }[] }) {
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return { itemCount, subtotal };
}
