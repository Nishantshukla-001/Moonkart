import type { Prisma } from "@prisma/client";

/**
 * The order shape every email template needs — a subset of what
 * `getOrderById`/`updateOrderStatus` (features/orders/services/order.service.ts)
 * already return, so the exact same `order` object those functions produce
 * can be passed straight into the send functions with no reshaping.
 */
export type OrderForEmail = Prisma.OrderGetPayload<{ include: { items: true } }>;
