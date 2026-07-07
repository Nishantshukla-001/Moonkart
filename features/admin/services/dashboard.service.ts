import "server-only";

import { prisma } from "@/lib/prisma";
import { getDashboardProductStats } from "@/features/products/services/product.service";
import type { IAdminDashboardStats } from "@/types/admin";

export async function getDashboardStats(): Promise<IAdminDashboardStats> {
  const [productStats, totalCategories, totalBrands] = await Promise.all([
    getDashboardProductStats(),
    prisma.category.count(),
    prisma.brand.count(),
  ]);

  return {
    totalProducts: productStats.totalProducts,
    totalCategories,
    totalBrands,
    lowStockCount: productStats.lowStockCount,
    outOfStockCount: productStats.outOfStockCount,
    recentProducts: productStats.recentProducts,
    lowStockProducts: productStats.lowStockProducts,
  };
}
