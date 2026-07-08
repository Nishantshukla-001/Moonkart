import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import type { AdminOrderQuery, OrderStatusValue } from "@/features/orders/validation/order.schema";

const orderInclude = {
  items: { orderBy: { createdAt: "asc" as const } },
  address: true,
};

/** A validation failure that should roll back the transaction and be shown to the shopper as-is (not a 500). */
class CheckoutError extends Error {}

function pad(value: number, length: number) {
  return String(value).padStart(length, "0");
}

/**
 * Atomic per-calendar-month sequence. The `upsert` with `increment` is a
 * single row-level UPDATE (or INSERT on first use each month), so concurrent
 * transactions racing for the same month serialize on Postgres's row lock
 * instead of both reading-then-writing the same stale count.
 */
async function nextOrderNumber(tx: Prisma.TransactionClient) {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${pad(now.getMonth() + 1, 2)}`;
  const sequence = await tx.orderSequence.upsert({
    where: { yearMonth },
    create: { yearMonth, count: 1 },
    update: { count: { increment: 1 } },
  });
  return `MK${yearMonth}${pad(sequence.count, 6)}`;
}

function resolveUnitPrice(
  product: { price: number; salePrice: number | null },
  variant: { price: number | null; salePrice: number | null } | null
) {
  if (variant) return variant.salePrice ?? variant.price ?? (product.salePrice ?? product.price);
  return product.salePrice ?? product.price;
}

function variantLabel(variant: { size: string | null; color: string | null } | null) {
  if (!variant) return null;
  return [variant.size, variant.color].filter(Boolean).join(" / ") || null;
}

export type PlaceOrderResult =
  | { success: true; order: NonNullable<Awaited<ReturnType<typeof getOrderById>>> }
  | { success: false; error: string };

/**
 * Validates and places an order from the user's server-side cart in a single
 * transaction: re-checks every line's existence/publish-state/stock against
 * the database (never trusting client-submitted cart data), atomically
 * decrements inventory with a `stock >= quantity` guard so concurrent orders
 * can never oversell, creates the Order + OrderItem snapshot rows, and clears
 * the cart — all inside one `$transaction`, so a failure at any step rolls
 * back everything (no partial orders, no partial stock decrements).
 */
export async function placeOrder(userId: string, addressId: string): Promise<PlaceOrderResult> {
  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) return { success: false, error: "Selected address not found." };

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true, variant: true } } },
  });
  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return { success: false, error: "User not found." };

  try {
    const orderId = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const itemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

      for (const line of cart.items) {
        // Re-fetch fresh inside the transaction so the stock check below is
        // consistent with the decrement, not the (possibly stale) row read
        // moments earlier outside the transaction.
        const product = await tx.product.findUnique({ where: { id: line.productId } });
        if (!product || !product.isPublished) {
          throw new CheckoutError(`"${line.product.name}" is no longer available.`);
        }

        let variant: Prisma.ProductVariantGetPayload<object> | null = null;
        if (line.variantId) {
          variant = await tx.productVariant.findFirst({
            where: { id: line.variantId, productId: product.id },
          });
          if (!variant) {
            throw new CheckoutError(`A selected option for "${product.name}" is no longer available.`);
          }
        }

        const availableStock = variant ? variant.stock : product.stock;
        if (availableStock < line.quantity) {
          throw new CheckoutError(
            availableStock > 0
              ? `Only ${availableStock} left of "${product.name}" — reduce the quantity to continue.`
              : `"${product.name}" is out of stock.`
          );
        }

        // Atomic, race-safe decrement — the `gte` guard means a concurrent
        // order for the same item can never push stock negative. If another
        // transaction already consumed it between the read above and this
        // write, this affects 0 rows and we roll back with a clear message
        // instead of silently overselling.
        if (variant) {
          const updated = await tx.productVariant.updateMany({
            where: { id: variant.id, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          });
          if (updated.count === 0) {
            throw new CheckoutError(`"${product.name}" just sold out — please remove it from your cart.`);
          }
        } else {
          const updated = await tx.product.updateMany({
            where: { id: product.id, stock: { gte: line.quantity } },
            data: { stock: { decrement: line.quantity } },
          });
          if (updated.count === 0) {
            throw new CheckoutError(`"${product.name}" just sold out — please remove it from your cart.`);
          }
        }

        const unitPrice = resolveUnitPrice(product, variant);
        const lineTotal = unitPrice * line.quantity;
        subtotal += lineTotal;

        itemsData.push({
          productId: product.id,
          variantId: variant?.id ?? null,
          productName: product.name,
          productSlug: product.slug,
          productImage: variant?.image ?? product.thumbnail,
          sku: variant?.sku ?? product.sku ?? null,
          variantLabel: variantLabel(variant),
          unitPrice,
          quantity: line.quantity,
          lineTotal,
        });
      }

      // No coupon/tax/shipping-rate system yet (out of scope this phase) —
      // these are computed as 0 but kept as real stored/returned fields so
      // the checkout UI and Order model are ready for them later.
      const discount = 0;
      const shippingCharge = 0;
      const tax = 0;
      const totalAmount = subtotal - discount + shippingCharge + tax;

      const orderNumber = await nextOrderNumber(tx);

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PENDING",
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          customerName: `${user.firstName} ${user.lastName}`.trim(),
          customerEmail: user.email,
          customerPhone: user.phone ?? address.phone,
          addressId: address.id,
          shippingFullName: address.fullName,
          shippingPhone: address.phone,
          shippingEmail: address.email,
          shippingAddressLine1: address.addressLine1,
          shippingAddressLine2: address.addressLine2,
          shippingCity: address.city,
          shippingState: address.state,
          shippingCountry: address.country,
          shippingPostalCode: address.postalCode,
          shippingAddressType: address.addressType,
          subtotal,
          discount,
          shippingCharge,
          tax,
          totalAmount,
          items: { createMany: { data: itemsData } },
        },
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return created.id;
    });

    const order = await getOrderById(userId, orderId);
    return { success: true, order: order! };
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}

/** Scoped to `userId` so one customer can never read another's order. */
export function getOrderById(userId: string, id: string) {
  return prisma.order.findFirst({ where: { id, userId }, include: orderInclude });
}

export function getOrderByNumber(userId: string, orderNumber: string) {
  return prisma.order.findFirst({ where: { orderNumber, userId }, include: orderInclude });
}

export async function getOrdersForUser(userId: string, page = 1, pageSize = 10) {
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: orderInclude,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

// --- Admin -------------------------------------------------------------

function adminSortToOrderBy(sort: AdminOrderQuery["sort"]): Prisma.OrderOrderByWithRelationInput {
  switch (sort) {
    case "oldest":
      return { createdAt: "asc" };
    case "total-asc":
      return { totalAmount: "asc" };
    case "total-desc":
      return { totalAmount: "desc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

export async function getOrdersAdmin(query: AdminOrderQuery) {
  const where: Prisma.OrderWhereInput = {
    ...(query.status !== "all" && { status: query.status }),
    ...(query.search && {
      OR: [
        { orderNumber: { contains: query.search, mode: "insensitive" } },
        { customerName: { contains: query.search, mode: "insensitive" } },
        { customerEmail: { contains: query.search, mode: "insensitive" } },
      ],
    }),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: orderInclude,
      orderBy: adminSortToOrderBy(query.sort),
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
  };
}

export function getOrderByIdAdmin(id: string) {
  return prisma.order.findUnique({ where: { id }, include: orderInclude });
}

export function updateOrderStatus(id: string, status: OrderStatusValue) {
  return prisma.order.update({ where: { id }, data: { status }, include: orderInclude });
}

export function getOrderCountsByStatus() {
  return prisma.order.groupBy({ by: ["status"], _count: true });
}
