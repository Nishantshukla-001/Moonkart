import "server-only";

import { prisma } from "@/lib/prisma";
import { getWishlistCount } from "@/features/wishlist/services/wishlist.service";

export interface IAccountStats {
  totalOrders: number;
  totalSpent: number;
  wishlistCount: number;
  favouriteCategory: string | null;
  memberSince: Date;
  lastLogin: Date | null;
}

/**
 * Aggregates a customer's own order history into dashboard-ready stats.
 * Favourite category is derived in-memory from the user's own (typically
 * small) order-item set rather than a Prisma groupBy, since it needs to
 * join through to `Category.name` which groupBy cannot express directly.
 */
export async function getAccountStats(userId: string): Promise<IAccountStats> {
  const [orderAgg, orders, wishlistCount, user] = await Promise.all([
    prisma.order.aggregate({
      where: { userId, status: { not: "CANCELLED" } },
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.order.findMany({
      where: { userId, status: { not: "CANCELLED" } },
      select: { items: { select: { quantity: true, product: { select: { category: { select: { name: true } } } } } } },
    }),
    getWishlistCount(userId),
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { createdAt: true, lastLogin: true } }),
  ]);

  const categoryCounts = new Map<string, number>();
  for (const order of orders) {
    for (const item of order.items) {
      const name = item.product?.category.name;
      if (!name) continue;
      categoryCounts.set(name, (categoryCounts.get(name) ?? 0) + item.quantity);
    }
  }
  const favouriteCategory =
    [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return {
    totalOrders: orderAgg._count,
    totalSpent: orderAgg._sum.totalAmount ?? 0,
    wishlistCount,
    favouriteCategory,
    memberSince: user.createdAt,
    lastLogin: user.lastLogin,
  };
}
