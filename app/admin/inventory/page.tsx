import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, Boxes, CheckCircle2, PackageX } from "lucide-react";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { StockBadge } from "@/components/admin/AdminBadges";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/constants/routes";
import { getDashboardProductStats, getProductsAdmin } from "@/features/products/services/product.service";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Inventory" };

function InventoryTable({
  title,
  icon: Icon,
  products,
  emptyMessage,
}: {
  title: string;
  icon: typeof AlertTriangle;
  products: Awaited<ReturnType<typeof getProductsAdmin>>["items"];
  emptyMessage: string;
}) {
  return (
    <Card className="p-0">
      <div className="flex items-center gap-2 border-b border-divider p-5">
        <Icon className="size-4 text-text-muted" aria-hidden="true" />
        <h2 className="font-heading text-base font-semibold text-text-primary">{title}</h2>
        <span className="text-sm text-text-muted">({products.length})</span>
      </div>
      {products.length === 0 ? (
        <div className="p-5">
          <AdminEmptyState icon={CheckCircle2} title="All clear" description={emptyMessage} />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
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
                <TableCell>
                  <StockBadge stock={product.stock} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}

export default async function AdminInventoryPage() {
  await requireAdmin();

  const [stats, lowStock, outOfStock] = await Promise.all([
    getDashboardProductStats(),
    getProductsAdmin({ stock: "low-stock", pageSize: 100, sort: "stock-asc" }),
    getProductsAdmin({ stock: "out-of-stock", pageSize: 100, sort: "stock-asc" }),
  ]);

  const inStockCount = stats.totalProducts - stats.lowStockCount - stats.outOfStockCount;

  return (
    <>
      <AdminPageHeader
        title="Inventory"
        description="Stock health across your entire catalog."
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Inventory" }]}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label="Total Products" value={String(stats.totalProducts)} icon={Boxes} href={ROUTES.adminProducts} />
        <AdminStatCard label="In Stock" value={String(inStockCount)} icon={CheckCircle2} />
        <AdminStatCard
          label="Low Stock"
          value={String(stats.lowStockCount)}
          icon={AlertTriangle}
          tone={stats.lowStockCount > 0 ? "warning" : "default"}
        />
        <AdminStatCard
          label="Out of Stock"
          value={String(stats.outOfStockCount)}
          icon={PackageX}
          tone={stats.outOfStockCount > 0 ? "danger" : "default"}
        />
      </div>

      <InventoryTable
        title="Out of Stock"
        icon={PackageX}
        products={outOfStock.items}
        emptyMessage="No products are currently out of stock."
      />

      <InventoryTable
        title="Low Stock"
        icon={AlertTriangle}
        products={lowStock.items}
        emptyMessage="No products are running low."
      />
    </>
  );
}
