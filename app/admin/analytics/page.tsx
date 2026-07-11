import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BadgeIndianRupee, MessageSquareWarning, PackageX, ShoppingCart, Users } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { CategoryDistributionChart } from "@/features/analytics/components/CategoryDistributionChart";
import { OrderStatusPieChart } from "@/features/analytics/components/OrderStatusPieChart";
import { OrdersTrendChart } from "@/features/analytics/components/OrdersTrendChart";
import { SalesTrendChart } from "@/features/analytics/components/SalesTrendChart";
import { getAdminAnalyticsOverview } from "@/features/analytics/services/analytics.service";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/utils/formatCurrency";

export const metadata: Metadata = { title: "Analytics" };

export default async function AdminAnalyticsPage() {
  await requireAdmin();
  const stats = await getAdminAnalyticsOverview();

  return (
    <>
      <AdminPageHeader
        title="Analytics"
        description="Revenue, orders, and store performance at a glance."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Analytics" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AdminStatCard label="Total Revenue" value={formatCurrency(stats.revenue.totalRevenue)} icon={BadgeIndianRupee} />
        <AdminStatCard label="Total Orders" value={String(stats.revenue.totalOrders)} icon={ShoppingCart} href={ROUTES.adminOrders} />
        <AdminStatCard label="Total Customers" value={String(stats.revenue.totalCustomers)} icon={Users} href={ROUTES.adminCustomers} />
        <AdminStatCard label="Avg. Order Value" value={formatCurrency(stats.revenue.averageOrderValue)} icon={BadgeIndianRupee} />
        <AdminStatCard
          label="Reviews to Moderate"
          value={String(stats.reviewsPendingModeration)}
          icon={MessageSquareWarning}
          href={ROUTES.adminReviews}
          tone={stats.reviewsPendingModeration > 0 ? "warning" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AdminStatCard
          label="Low Stock Products"
          value={String(stats.inventoryStats.lowStockCount)}
          icon={AlertTriangle}
          href={ROUTES.adminProducts}
          tone={stats.inventoryStats.lowStockCount > 0 ? "warning" : "default"}
        />
        <AdminStatCard
          label="Out of Stock Products"
          value={String(stats.inventoryStats.outOfStockCount)}
          icon={PackageX}
          href={ROUTES.adminProducts}
          tone={stats.inventoryStats.outOfStockCount > 0 ? "danger" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-text-primary">Monthly Revenue</h2>
          <SalesTrendChart data={stats.monthlySales} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-text-primary">Monthly Orders</h2>
          <OrdersTrendChart data={stats.monthlySales} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-text-primary">Order Status Distribution</h2>
          <OrderStatusPieChart data={stats.orderStatusDistribution} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-heading text-base font-semibold text-text-primary">Products by Category</h2>
          <CategoryDistributionChart data={stats.categoryDistribution} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-0 lg:col-span-2">
          <div className="border-b border-divider p-5">
            <h2 className="font-heading text-base font-semibold text-text-primary">Best Selling Products</h2>
          </div>
          {stats.bestSellers.length === 0 ? (
            <p className="p-5 text-sm text-text-muted">No sales yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Units Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.bestSellers.map((row) => (
                  <TableRow key={row.product!.id}>
                    <TableCell>
                      <Link
                        href={ROUTES.adminProductEdit(row.product!.id)}
                        className="flex items-center gap-3 font-medium text-text-primary hover:text-blush-hover"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URLs, not registered in next/image remotePatterns */}
                        <img src={row.product!.thumbnail} alt="" className="size-9 rounded-lg object-cover" />
                        <span className="line-clamp-1">{row.product!.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>{row.unitsSold}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="p-0">
          <div className="border-b border-divider p-5">
            <h2 className="font-heading text-base font-semibold text-text-primary">Highest Rated</h2>
          </div>
          {stats.topRated.length === 0 ? (
            <p className="p-5 text-sm text-text-muted">No reviews yet.</p>
          ) : (
            <ul className="divide-y divide-divider">
              {stats.topRated.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 p-4">
                  <Link
                    href={ROUTES.adminProductEdit(product.id)}
                    className="line-clamp-1 text-sm font-medium text-text-primary hover:text-blush-hover"
                  >
                    {product.name}
                  </Link>
                  <span className="shrink-0 text-sm font-semibold text-text-primary">
                    {product.averageRating.toFixed(1)} ★
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="p-0">
        <div className="border-b border-divider p-5">
          <h2 className="font-heading text-base font-semibold text-text-primary">Top Customers</h2>
        </div>
        {stats.topCustomers.length === 0 ? (
          <p className="p-5 text-sm text-text-muted">No customers with orders yet.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Total Spent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.topCustomers.map((row, index) => (
                <TableRow key={row.user?.id ?? index}>
                  <TableCell>
                    {row.user ? (
                      <div>
                        <p className="font-medium text-text-primary">
                          {row.user.firstName} {row.user.lastName}
                        </p>
                        <p className="text-xs text-text-muted">{row.user.email}</p>
                      </div>
                    ) : (
                      <span className="text-text-muted">Deleted user</span>
                    )}
                  </TableCell>
                  <TableCell>{row.orderCount}</TableCell>
                  <TableCell>{formatCurrency(row.totalSpent)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </>
  );
}
