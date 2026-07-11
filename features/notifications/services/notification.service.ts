import "server-only";

import type { NotificationType } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  return prisma.notification.create({ data: { userId, type, title, message, link } });
}

/** Bulk variant for fan-out cases (restock alerts, admin announcements) — one query instead of N. */
export async function createNotificationsForUsers(
  userIds: string[],
  type: NotificationType,
  title: string,
  message: string,
  link?: string
) {
  if (userIds.length === 0) return { count: 0 };
  return prisma.notification.createMany({
    data: userIds.map((userId) => ({ userId, type, title, message, link })),
  });
}

/** Admin broadcast — every active customer gets the same announcement. */
export async function createAnnouncementForAllUsers(title: string, message: string, link?: string) {
  const users = await prisma.user.findMany({ where: { isActive: true }, select: { id: true } });
  return createNotificationsForUsers(
    users.map((u) => u.id),
    "ANNOUNCEMENT",
    title,
    message,
    link
  );
}

/** Notifies every customer who has `productId` wishlisted that it's back in stock. Called when a product's stock transitions from 0 to positive. */
export async function notifyWishlistersOfRestock(productId: string, productName: string, productSlug: string) {
  const wishlisters = await prisma.wishlistItem.findMany({
    where: { productId },
    select: { wishlist: { select: { userId: true } } },
  });
  const userIds = [...new Set(wishlisters.map((w) => w.wishlist.userId))];
  return createNotificationsForUsers(
    userIds,
    "WISHLIST_STOCK",
    "Back in stock!",
    `${productName} is back in stock — grab it before it sells out again.`,
    `/products/${productSlug}`
  );
}

/** Prompts a customer to review each product in a just-delivered order, skipping anything they've already reviewed. Called when an admin marks an order DELIVERED. */
export async function createReviewRemindersForOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { select: { productId: true, productName: true, productSlug: true } } },
  });
  if (!order) return { count: 0 };

  const productIds = [...new Set(order.items.map((i) => i.productId).filter((id): id is string => !!id))];
  if (productIds.length === 0) return { count: 0 };

  const alreadyReviewed = await prisma.review.findMany({
    where: { userId: order.userId, productId: { in: productIds } },
    select: { productId: true },
  });
  const reviewedIds = new Set(alreadyReviewed.map((r) => r.productId));

  const toRemind = order.items.filter((item) => item.productId && !reviewedIds.has(item.productId));
  if (toRemind.length === 0) return { count: 0 };

  return prisma.notification.createMany({
    data: toRemind.map((item) => ({
      userId: order.userId,
      type: "REVIEW_REMINDER" as const,
      title: "How was your purchase?",
      message: `Share your thoughts on ${item.productName} — your review helps other shoppers.`,
      link: `/products/${item.productSlug}`,
    })),
  });
}

export async function getNotificationsForUser(userId: string, page = 1, pageSize = 20) {
  const [items, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return { items, total, unreadCount, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

/** Scoped to `userId` so one customer can never mark another's notification read. */
export async function markNotificationRead(userId: string, id: string) {
  const result = await prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
  return result.count > 0;
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
}
