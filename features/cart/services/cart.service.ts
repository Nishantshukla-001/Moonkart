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
  // upsert (not findUnique-then-create) so two concurrent calls for a
  // brand-new user (e.g. a page-load hydrate racing a hydrate-and-add-item
  // request) can't both see "no cart" and both try to create one — the
  // second `create` would fail on the unique `userId` constraint.
  return prisma.cart.upsert({
    where: { userId },
    create: { userId },
    update: {},
    include: cartInclude,
  });
}

/**
 * Resolves the authoritative price/stock/availability for a product or
 * variant directly from the database — the server is the sole source of
 * truth here, never the client. `kind` distinguishes *why* a line can't be
 * priced, so callers can return the right HTTP status and message instead
 * of a generic failure.
 */
async function resolveUnitPrice(
  productId: string,
  variantId: string | null | undefined
): Promise<
  | { kind: "not_found" }
  | { kind: "unavailable" }
  | { kind: "ok"; unitPrice: number; stock: number }
> {
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { select: { isPublished: true } } },
    });
    if (!variant || variant.productId !== productId) return { kind: "not_found" };
    if (!variant.product.isPublished) return { kind: "unavailable" };
    return { kind: "ok", unitPrice: variant.salePrice ?? variant.price ?? 0, stock: variant.stock };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { kind: "not_found" };
  if (!product.isPublished) return { kind: "unavailable" };
  return { kind: "ok", unitPrice: product.salePrice ?? product.price, stock: product.stock };
}

/** Shared wording for every "can't fit this quantity" case, below. */
function stockErrorMessage(stock: number, alreadyInCart: number): string {
  if (stock <= 0) return "This product is out of stock.";
  const remaining = Math.max(stock - alreadyInCart, 0);
  if (remaining <= 0) {
    return `You already have the maximum available quantity (${stock}) of this item in your cart.`;
  }
  return `Only ${stock} in stock. You can add up to ${remaining} more.`;
}

export type CartMutationResult =
  | { success: true; cart: Awaited<ReturnType<typeof getOrCreateCart>> }
  | { success: false; error: string; status: 404 | 409 };

export async function addCartItem(
  userId: string,
  { productId, variantId, quantity }: { productId: string; variantId?: string; quantity: number }
): Promise<CartMutationResult> {
  // Stock/availability is read once, outside the transaction — this cart-
  // level check is intentionally a best-effort guard rail, not a reservation
  // (see the atomic `stock: { gte }` decrement in order.service.ts for the
  // real, authoritative enforcement at checkout). What *does* need to be
  // atomic is the cart mutation itself, below.
  const resolved = await resolveUnitPrice(productId, variantId);
  if (resolved.kind === "not_found") return { success: false, error: "Product not found.", status: 404 };
  if (resolved.kind === "unavailable") {
    return { success: false, error: "This product is currently unavailable.", status: 409 };
  }

  const outcome = await prisma.$transaction(async (tx) => {
    const cart = await tx.cart.upsert({ where: { userId }, create: { userId }, update: {} });

    // Row-level lock on the cart itself — the exact same pattern
    // placeOrder()/placeOrderFromRazorpayPayment() use in order.service.ts.
    // A genuine UPDATE (not a plain SELECT) takes a row lock for the rest of
    // this transaction under Postgres's default READ COMMITTED isolation,
    // so a second concurrent addCartItem/updateCartItemQuantity call for
    // this same cart blocks here until this transaction commits or rolls
    // back — it then sees this write's committed result instead of racing
    // against a stale read. Other users' carts are untouched and proceed in
    // full parallel; only concurrent writers to this one cart ever wait.
    await tx.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

    const existing = await tx.cartItem.findFirst({
      where: { cartId: cart.id, productId, variantId: variantId ?? null },
    });

    const requestedTotal = (existing?.quantity ?? 0) + quantity;
    if (requestedTotal > resolved.stock) {
      return { kind: "stock" as const, error: stockErrorMessage(resolved.stock, existing?.quantity ?? 0) };
    }

    if (existing) {
      await tx.cartItem.update({
        where: { id: existing.id },
        data: { quantity: requestedTotal, price: resolved.unitPrice },
      });
    } else {
      await tx.cartItem.create({
        data: { cartId: cart.id, productId, variantId: variantId ?? null, quantity, price: resolved.unitPrice },
      });
    }

    return { kind: "ok" as const };
  });

  if (outcome.kind === "stock") {
    return { success: false, error: outcome.error, status: 409 };
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

export async function updateCartItemQuantity(
  userId: string,
  itemId: string,
  quantity: number,
  expectedQuantity: number
): Promise<CartMutationResult> {
  const item = await findOwnedCartItem(userId, itemId);
  if (!item) return { success: false, error: "Cart item not found.", status: 404 };

  // Re-validate against the live product/variant on every quantity change —
  // not just at add-to-cart time — so raising the quantity stepper on the
  // cart page can't exceed stock either.
  const resolved = await resolveUnitPrice(item.productId, item.variantId ?? undefined);
  if (resolved.kind === "not_found") return { success: false, error: "Product not found.", status: 404 };
  if (resolved.kind === "unavailable") {
    return { success: false, error: "This product is currently unavailable.", status: 409 };
  }
  if (quantity > resolved.stock) {
    return { success: false, error: stockErrorMessage(resolved.stock, 0), status: 409 };
  }

  const outcome = await prisma.$transaction(async (tx) => {
    // Same cart-row lock as addCartItem — without it, a concurrent
    // addCartItem for this same line (e.g. a second tab) could read its
    // pre-update quantity and overwrite this write right after it commits.
    await tx.cart.update({ where: { id: item.cartId }, data: { updatedAt: new Date() } });

    // Compare-and-swap: only write if the row still holds the quantity the
    // client last saw. The lock above only serializes concurrent writers —
    // it doesn't make a later-committing transaction "lose" to an
    // earlier-issued one, since this is a blind SET rather than a
    // read-then-increment. Two overlapping quantity changes for the same
    // line would otherwise let whichever transaction happens to commit last
    // silently overwrite the other, even if it was the client's older
    // request. `updateMany` (not `update`) lets a zero-row match fail
    // cleanly via `count`, instead of `update` throwing P2025.
    const { count } = await tx.cartItem.updateMany({
      where: { id: itemId, cartId: item.cartId, quantity: expectedQuantity },
      data: { quantity, price: resolved.unitPrice },
    });

    return count > 0 ? ("ok" as const) : ("stale" as const);
  });

  if (outcome === "stale") {
    return {
      success: false,
      error: "This item's quantity changed. Please refresh and try again.",
      status: 409,
    };
  }

  return { success: true, cart: await getOrCreateCart(userId) };
}

export async function removeCartItem(userId: string, itemId: string) {
  const item = await findOwnedCartItem(userId, itemId);
  if (!item) return null;

  const outcome = await prisma.$transaction(async (tx) => {
    // Same cart-row lock as every other mutation here. Without it, a
    // concurrent updateCartItemQuantity for this same line could still be
    // mid-transaction when this delete lands, or two overlapping removes
    // could race each other directly.
    await tx.cart.update({ where: { id: item.cartId }, data: { updatedAt: new Date() } });

    // `deleteMany` (not `delete`) so "already gone" — removed by a
    // concurrent request that won the lock first — resolves as a plain
    // zero-row count instead of `delete` throwing P2025.
    const { count } = await tx.cartItem.deleteMany({
      where: { id: itemId, cartId: item.cartId },
    });

    return count > 0 ? ("ok" as const) : ("already_removed" as const);
  });

  if (outcome === "already_removed") return null;

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
