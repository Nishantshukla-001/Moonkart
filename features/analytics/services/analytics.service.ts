import "server-only";

import { UserRole } from "@/constants/roles";
import { getOrderCountsByStatus } from "@/features/orders/services/order.service";
import { getDashboardProductStats, getTopRatedProducts } from "@/features/products/services/product.service";
import { getReviewsPendingModerationCount } from "@/features/reviews/services/review.service";
import { getCategories } from "@/features/categories/services/category.service";
import { prisma } from "@/lib/prisma";

const NOT_CANCELLED = { not: "CANCELLED" as const };

export async function getRevenueOverview() {
  const [orderAgg, totalCustomers] = await Promise.all([
    prisma.order.aggregate({
      where: { status: NOT_CANCELLED },
      _count: true,
      _sum: { totalAmount: true },
    }),
    prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
  ]);

  const totalRevenue = orderAgg._sum.totalAmount ?? 0;
  const totalOrders = orderAgg._count;

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    averageOrderValue: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
  };
}

/** Bucketed in JS rather than a raw SQL date-trunc — order volume for a single-vendor store is small enough that this stays simple and portable. */
export async function getMonthlySalesTrend(months = 6) {
  const start = new Date();
  start.setMonth(start.getMonth() - (months - 1), 1);
  start.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: { status: NOT_CANCELLED, createdAt: { gte: start } },
    select: { createdAt: true, totalAmount: true },
  });

  const buckets = new Map<string, { label: string; revenue: number; orders: number }>();
  for (let i = 0; i < months; i++) {
    const date = new Date(start);
    date.setMonth(date.getMonth() + i);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    buckets.set(key, { label: date.toLocaleDateString("en-IN", { month: "short" }), revenue: 0, orders: 0 });
  }

  for (const order of orders) {
    const key = `${order.createdAt.getFullYear()}-${order.createdAt.getMonth()}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.revenue += order.totalAmount;
    bucket.orders += 1;
  }

  return [...buckets.values()];
}

export function getOrderStatusDistribution() {
  return getOrderCountsByStatus();
}

export async function getCategoryDistribution() {
  const categories = await getCategories();
  return categories
    .map((category) => ({ name: category.name, productCount: category._count.products }))
    .filter((category) => category.productCount > 0)
    .sort((a, b) => b.productCount - a.productCount);
}

export async function getTopCustomers(limit = 5) {
  const grouped = await prisma.order.groupBy({
    by: ["userId"],
    where: { status: NOT_CANCELLED },
    _sum: { totalAmount: true },
    _count: true,
    orderBy: { _sum: { totalAmount: "desc" } },
    take: limit,
  });

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((row) => row.userId) } },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  const userById = new Map(users.map((user) => [user.id, user]));

  return grouped.map((row) => ({
    user: userById.get(row.userId) ?? null,
    totalSpent: row._sum.totalAmount ?? 0,
    orderCount: row._count,
  }));
}

export async function getBestSellingProducts(limit = 5) {
  const grouped = await prisma.orderItem.groupBy({
    by: ["productId"],
    where: { productId: { not: null }, order: { status: NOT_CANCELLED } },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit,
  });

  const productIds = grouped.map((row) => row.productId).filter((id): id is string => id !== null);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, slug: true, thumbnail: true },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  return grouped
    .map((row) => ({
      product: row.productId ? (productById.get(row.productId) ?? null) : null,
      unitsSold: row._sum.quantity ?? 0,
    }))
    .filter((row) => row.product !== null);
}

export async function getAdminAnalyticsOverview() {
  const [
    revenue,
    monthlySales,
    orderStatusDistribution,
    categoryDistribution,
    topCustomers,
    bestSellers,
    topRated,
    inventoryStats,
    reviewsPendingModeration,
  ] = await Promise.all([
    getRevenueOverview(),
    getMonthlySalesTrend(6),
    getOrderStatusDistribution(),
    getCategoryDistribution(),
    getTopCustomers(5),
    getBestSellingProducts(5),
    getTopRatedProducts(5),
    getDashboardProductStats(),
    getReviewsPendingModerationCount(),
  ]);

  return {
    revenue,
    monthlySales,
    orderStatusDistribution,
    categoryDistribution,
    topCustomers,
    bestSellers,
    topRated,
    inventoryStats,
    reviewsPendingModeration,
  };
}
