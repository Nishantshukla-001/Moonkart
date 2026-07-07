import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, BadgeIndianRupee, LayoutGrid, Package, PackageX, ShoppingCart, Tags } from "lucide-react";

import { PublishedBadge, StockBadge } from "@/components/admin/AdminBadges";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { getDashboardStats } from "@/features/admin/services/dashboard.service";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency } from "@/utils/formatCurrency";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboardPage() {
  const [user, stats] = await Promise.all([requireAdmin(), getDashboardStats()]);

  return (
    <>
      <AdminPageHeader
        title={`Welcome back, ${user.firstName}`}
        description="Here's what's happening in your store today."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <AdminStatCard
          label="Total Products"
          value={String(stats.totalProducts)}
          icon={Package}
          href={ROUTES.adminProducts}
        />
        <AdminStatCard
          label="Categories"
          value={String(stats.totalCategories)}
          icon={LayoutGrid}
          href={ROUTES.adminCategories}
        />
        <AdminStatCard label="Brands" value={String(stats.totalBrands)} icon={Tags} href={ROUTES.adminBrands} />
        <AdminStatCard label="Orders" value="—" icon={ShoppingCart} comingSoon />
        <AdminStatCard label="Revenue" value="—" icon={BadgeIndianRupee} comingSoon />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-divider p-5">
            <h2 className="font-heading text-base font-semibold text-text-primary">Recent Products</h2>
            <Link
              href={ROUTES.adminProducts}
              className="text-sm font-semibold text-blush-hover hover:text-text-primary"
            >
              View all →
            </Link>
          </div>
          {stats.recentProducts.length === 0 ? (
            <div className="p-5">
              <AdminEmptyState
                icon={Package}
                title="No products yet"
                description="Add your first product to get started."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link
                        href={ROUTES.adminProductEdit(product.id)}
                        className="flex items-center gap-3 font-medium text-text-primary hover:text-blush-hover"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URLs, not registered in next/image remotePatterns */}
                        <img src={product.thumbnail} alt="" className="size-9 rounded-lg object-cover" />
                        <span className="line-clamp-1">{product.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>{product.category.name}</TableCell>
                    <TableCell>{formatCurrency(product.salePrice ?? product.price)}</TableCell>
                    <TableCell>
                      <PublishedBadge isPublished={product.isPublished} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="p-0">
          <div className="flex items-center justify-between border-b border-divider p-5">
            <h2 className="font-heading text-base font-semibold text-text-primary">Low Stock</h2>
            <AlertTriangle className="size-4 text-warning" aria-hidden="true" />
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <div className="p-5">
              <AdminEmptyState
                icon={PackageX}
                title="All stocked up"
                description="No products are low or out of stock."
              />
            </div>
          ) : (
            <ul className="divide-y divide-divider">
              {stats.lowStockProducts.map((product) => (
                <li key={product.id} className="flex items-center justify-between gap-3 p-4">
                  <Link
                    href={ROUTES.adminProductEdit(product.id)}
                    className="line-clamp-1 text-sm font-medium text-text-primary hover:text-blush-hover"
                  >
                    {product.name}
                  </Link>
                  <StockBadge stock={product.stock} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="flex flex-col gap-4 p-5">
        <h2 className="font-heading text-base font-semibold text-text-primary">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button render={<Link href={ROUTES.adminProductNew} />}>Add Product</Button>
          <Button variant="outline" render={<Link href={ROUTES.adminCategories} />}>
            Add Category
          </Button>
          <Button variant="outline" render={<Link href={ROUTES.adminBrands} />}>
            Add Brand
          </Button>
          <Button variant="outline" render={<Link href={ROUTES.adminSubCategories} />}>
            Add Subcategory
          </Button>
        </div>
      </Card>
    </>
  );
}
