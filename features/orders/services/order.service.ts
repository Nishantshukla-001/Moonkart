import "server-only";

import { Prisma } from "@prisma/client";
import { after } from "next/server";

import {
  createNotification,
  createReviewRemindersForOrder,
} from "@/features/notifications/services/notification.service";
import { prisma } from "@/lib/prisma";
import { sendAdminNewOrderEmail, sendOrderConfirmationEmail, sendOrderStatusEmail } from "@/lib/email/sendOrderEmails";
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
  // These three reads are independent of one another — running them
  // concurrently instead of one-after-another removes two round trips'
  // worth of latency from the common (all-valid) checkout path. Error
  // precedence below is unchanged: address is still checked before cart,
  // which is still checked before user.
  const [address, cart, user] = await Promise.all([
    prisma.address.findFirst({ where: { id: addressId, userId } }),
    prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (!address) return { success: false, error: "Selected address not found." };
  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }
  if (!user) return { success: false, error: "User not found." };

  try {
    const orderId = await prisma.$transaction(async (tx) => {
      // Acquire a row-level lock on the cart itself before touching its
      // items. A genuine UPDATE (unlike a plain SELECT under Postgres's
      // default READ COMMITTED isolation) blocks a concurrent duplicate
      // checkout — e.g. a double-clicked "Place Order" firing two requests
      // — until this transaction commits or rolls back. Without this, both
      // requests would independently read the same not-yet-deleted cart
      // items and each successfully place its own order for them.
      await tx.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

      const freshCartItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
        include: { product: true, variant: true },
      });
      if (freshCartItems.length === 0) {
        throw new CheckoutError("Your cart is empty.");
      }

      let subtotal = 0;
      const itemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

      for (const line of freshCartItems) {
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

    // Deferred via `after()` — not on the response's critical path, since the
    // order has already succeeded and the customer is waiting to be
    // redirected. Still runs to completion (unlike a bare detached promise,
    // which a serverless platform could kill mid-write); best-effort in that
    // a notification failure must never surface as a checkout failure.
    after(() =>
      createNotification(
        userId,
        "ORDER_STATUS",
        "Order placed!",
        `Your order ${order!.orderNumber} has been placed and is being processed.`,
        `/orders/${order!.id}`
      ).catch(() => null)
    );

    // Same reasoning as the notification above — deferred so a slow or
    // failing Resend call can never delay or fail an already-successful
    // order. Each email is caught independently so one failing never blocks
    // the other, and the order itself is never affected either way.
    after(() =>
      sendOrderConfirmationEmail(order!).catch((error) =>
        console.error("Failed to send order confirmation email:", { orderId: order!.id, error })
      )
    );
    after(() =>
      sendAdminNewOrderEmail(order!).catch((error) =>
        console.error("Failed to send admin new-order email:", { orderId: order!.id, error })
      )
    );

    return { success: true, order: order! };
  } catch (error) {
    if (error instanceof CheckoutError) {
      return { success: false, error: error.message };
    }
    throw error;
  }
}

export type PlaceOrderFromRazorpayResult =
  | { success: true; order: NonNullable<Awaited<ReturnType<typeof getOrderById>>>; alreadyExisted: boolean }
  | { success: false; error: string };

interface PlaceOrderFromRazorpayPaymentParams {
  userId: string;
  addressId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
}

/**
 * Finalizes an Order after a Razorpay payment has already been verified
 * (signature checked by the caller). Deliberately mirrors `placeOrder`'s
 * transaction rather than sharing it — this path starts from money already
 * captured by Razorpay, so it is kept as a self-contained flow instead of
 * risking a shared-helper change touching the live COD checkout path.
 *
 * Idempotent on `razorpayPaymentId`: a matching Order is looked up before
 * touching the cart, and the column also carries a DB-level unique
 * constraint, so a retried request, a refreshed success page, or a genuine
 * concurrent race can never produce two Orders for one Razorpay payment —
 * the loser of the race is caught below and returns the winner's Order
 * instead of erroring.
 */
export async function placeOrderFromRazorpayPayment({
  userId,
  addressId,
  razorpayOrderId,
  razorpayPaymentId,
}: PlaceOrderFromRazorpayPaymentParams): Promise<PlaceOrderFromRazorpayResult> {
  // These four reads are independent of one another — running them
  // concurrently instead of one-after-another removes several round trips'
  // worth of latency from the common (first-attempt, non-duplicate)
  // checkout path. In the rare duplicate-payment case, address/cart/user
  // end up fetched needlessly, but that's a cheap trade for a real speedup
  // on the normal path. Precedence below (existing → address → cart → user)
  // is unchanged from before.
  const [existing, address, cart, user] = await Promise.all([
    prisma.order.findUnique({ where: { razorpayPaymentId } }),
    prisma.address.findFirst({ where: { id: addressId, userId } }),
    prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true, variant: true } } },
    }),
    prisma.user.findUnique({ where: { id: userId } }),
  ]);

  if (existing) {
    const order = await getOrderById(userId, existing.id);
    if (!order) return { success: false, error: "Order not found." };
    return { success: true, order, alreadyExisted: true };
  }

  if (!address) return { success: false, error: "Selected address not found." };
  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Your cart is empty." };
  }
  if (!user) return { success: false, error: "User not found." };

  try {
    const orderId = await prisma.$transaction(async (tx) => {
      // Re-check idempotency inside the transaction to close the race
      // window between the pre-check above and this transaction starting.
      const dupe = await tx.order.findUnique({ where: { razorpayPaymentId } });
      if (dupe) return dupe.id;

      await tx.cart.update({ where: { id: cart.id }, data: { updatedAt: new Date() } });

      const freshCartItems = await tx.cartItem.findMany({
        where: { cartId: cart.id },
        include: { product: true, variant: true },
      });
      if (freshCartItems.length === 0) {
        throw new CheckoutError("Your cart is empty.");
      }

      let subtotal = 0;
      const itemsData: Prisma.OrderItemCreateManyOrderInput[] = [];

      for (const line of freshCartItems) {
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

      const discount = 0;
      const shippingCharge = 0;
      const tax = 0;
      const totalAmount = subtotal - discount + shippingCharge + tax;

      const orderNumber = await nextOrderNumber(tx);

      const created = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: "PROCESSING",
          paymentMethod: "RAZORPAY",
          paymentStatus: "PAID",
          razorpayOrderId,
          razorpayPaymentId,
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
    if (!order) return { success: false, error: "Order not found after creation." };

    // Deferred via `after()` — this is the exact response the client is
    // waiting on to redirect to the success page after a successful
    // payment, so a notification write must not sit on its critical path.
    // Still runs to completion (unlike a bare detached promise, which a
    // serverless platform could kill mid-write); best-effort in that a
    // notification failure must never surface as a checkout failure.
    after(() =>
      createNotification(
        userId,
        "ORDER_STATUS",
        "Order placed!",
        `Your order ${order.orderNumber} has been placed and is being processed.`,
        `/orders/${order.id}`
      ).catch(() => null)
    );

    // Same reasoning as the notification above — deferred so a slow or
    // failing Resend call can never delay the payment-success redirect or
    // fail an already-captured, already-recorded order. Only reached on a
    // genuinely new order (the `existing` early-return above already
    // handles retried/duplicate payment requests), so a retried request
    // can never trigger a second confirmation email.
    after(() =>
      sendOrderConfirmationEmail(order).catch((error) =>
        console.error("Failed to send order confirmation email:", { orderId: order.id, error })
      )
    );
    after(() =>
      sendAdminNewOrderEmail(order).catch((error) =>
        console.error("Failed to send admin new-order email:", { orderId: order.id, error })
      )
    );

    return { success: true, order, alreadyExisted: false };
  } catch (error) {
    if (error instanceof CheckoutError) {
      // The Razorpay payment has already succeeded at this point — losing
      // the Order row here would silently lose a real, captured payment, so
      // this is logged with everything needed to manually reconcile rather
      // than treated as an ordinary validation failure.
      console.error("Razorpay payment succeeded but order finalization failed:", {
        userId,
        razorpayOrderId,
        razorpayPaymentId,
        reason: error.message,
      });
      return { success: false, error: error.message };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      // Lost a race to a concurrent request finalizing the same payment —
      // that request's Order is the source of truth, not an error here.
      const winner = await prisma.order.findUnique({ where: { razorpayPaymentId } });
      if (winner) {
        const order = await getOrderById(userId, winner.id);
        if (order) return { success: true, order, alreadyExisted: true };
      }
    }

    console.error("Razorpay payment succeeded but order finalization failed unexpectedly:", {
      userId,
      razorpayOrderId,
      razorpayPaymentId,
      error,
    });
    return {
      success: false,
      error: "Payment received, but we couldn't finalize your order automatically. Please contact support.",
    };
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

const STATUS_MESSAGES: Record<OrderStatusValue, string> = {
  PENDING: "is pending confirmation.",
  CONFIRMED: "has been confirmed.",
  PROCESSING: "is being processed.",
  PACKED: "has been packed and is ready to ship.",
  SHIPPED: "has shipped!",
  OUT_FOR_DELIVERY: "is out for delivery!",
  DELIVERED: "has been delivered. We hope you love it!",
  CANCELLED: "has been cancelled.",
  REFUNDED: "has been refunded.",
};

export async function updateOrderStatus(id: string, status: OrderStatusValue) {
  const order = await prisma.order.update({ where: { id }, data: { status }, include: orderInclude });

  // Best-effort — a notification/reminder failure should never fail the status update itself.
  await createNotification(
    order.userId,
    "ORDER_STATUS",
    `Order ${order.orderNumber} update`,
    `Your order ${order.orderNumber} ${STATUS_MESSAGES[status]}`,
    `/orders/${order.id}`
  ).catch(() => null);

  if (status === "DELIVERED") {
    await createReviewRemindersForOrder(order.id).catch(() => null);
  }

  // Deferred via `after()` so a slow/failing Resend call can never delay
  // the admin's status-update response. `sendOrderStatusEmail` itself is a
  // no-op for statuses this feature doesn't cover (see orderStatusEmail.ts).
  after(() =>
    sendOrderStatusEmail(order, status).catch((error) =>
      console.error("Failed to send order status email:", { orderId: order.id, status, error })
    )
  );

  return order;
}

export function getOrderCountsByStatus() {
  return prisma.order.groupBy({ by: ["status"], _count: true });
}
