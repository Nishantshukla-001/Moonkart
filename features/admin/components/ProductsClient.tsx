"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Copy, MoreHorizontal, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";

import { PublishedBadge, StockBadge } from "@/components/admin/AdminBadges";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/shared/Pagination";
import { ROUTES } from "@/constants/routes";
import { adminProductService } from "@/features/admin/services/adminProduct.service";
import type { AdminProductQuery } from "@/features/admin/validation/adminProductQuery.schema";
import { debounce } from "@/utils/debounce";
import { formatCurrency } from "@/utils/formatCurrency";
import type { IAdminProductListResult } from "@/types/admin";
import type { IBrand, ICategory } from "@/types/product";

interface ProductsClientProps {
  result: IAdminProductListResult;
  categories: ICategory[];
  brands: IBrand[];
  query: AdminProductQuery;
}

export function ProductsClient({ result, categories, brands, query }: ProductsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(query.search ?? "");
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<{ id: string; name: string } | null>(null);

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`${ROUTES.adminProducts}?${params.toString()}`);
  }

  const debouncedSearch = useMemo(
    () => debounce((value: string) => updateParams({ search: value || undefined }), 400),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable across renders; searchParams read fresh inside updateParams via closure isn't needed since router.push always reads current URL via useSearchParams above
    []
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  function handlePageChange(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`${ROUTES.adminProducts}?${params.toString()}`);
  }

  async function handleDuplicate(id: string) {
    setDuplicatingId(id);
    const duplicateResult = await adminProductService.duplicate(id);
    setDuplicatingId(null);

    if (!duplicateResult.success) {
      toast.error(duplicateResult.message || "Could not duplicate product.");
      return;
    }
    toast.success("Product duplicated as an unpublished draft.");
    router.refresh();
  }

  async function handleDelete() {
    if (!deleting) return;
    const deleteResponse = await adminProductService.remove(deleting.id);
    if (!deleteResponse.success) {
      toast.error(deleteResponse.message || "Could not delete product.");
      return;
    }
    toast.success("Product deleted.");
    setDeleting(null);
    router.refresh();
  }

  return (
    <>
      <AdminPageHeader
        title="Products"
        description={`${result.total} product${result.total === 1 ? "" : "s"} in your catalog.`}
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Products" }]}
        actions={
          <Button render={<Link href={ROUTES.adminProductNew} />}>
            <Plus /> Add Product
          </Button>
        }
      />

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-divider p-4 lg:flex-row lg:items-center lg:flex-wrap">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search by name or SKU…"
              className="pl-9"
            />
          </div>

          <Select value={query.categoryId || "all"} onValueChange={(value) => updateParams({ categoryId: value ?? undefined })}>
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={query.brandId || "all"} onValueChange={(value) => updateParams({ brandId: value ?? undefined })}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={query.status} onValueChange={(value) => updateParams({ status: value ?? undefined })}>
            <SelectTrigger className="w-full lg:w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>

          <Select value={query.stock} onValueChange={(value) => updateParams({ stock: value ?? undefined })}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="in-stock">In Stock</SelectItem>
              <SelectItem value="low-stock">Low Stock</SelectItem>
              <SelectItem value="out-of-stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>

          <Select value={query.sort} onValueChange={(value) => updateParams({ sort: value ?? undefined })}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="name">Name (A–Z)</SelectItem>
              <SelectItem value="price-asc">Price (Low–High)</SelectItem>
              <SelectItem value="price-desc">Price (High–Low)</SelectItem>
              <SelectItem value="stock-asc">Stock (Low–High)</SelectItem>
              <SelectItem value="stock-desc">Stock (High–Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {result.items.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={Package}
              title="No products found"
              description="Try adjusting your search or filters, or add a new product."
              action={
                <Button size="sm" render={<Link href={ROUTES.adminProductNew} />}>
                  Add Product
                </Button>
              }
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link
                      href={ROUTES.adminProductEdit(product.id)}
                      className="flex items-center gap-3 font-medium text-text-primary hover:text-blush-hover"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- admin-entered arbitrary URL */}
                      <img src={product.thumbnail} alt="" className="size-10 shrink-0 rounded-lg object-cover" />
                      <span className="line-clamp-2 max-w-56">{product.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell className="text-text-muted">{product.category.name}</TableCell>
                  <TableCell className="text-text-muted">{product.brand?.name ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-text-primary">
                        {formatCurrency(product.salePrice ?? product.price)}
                      </span>
                      {product.salePrice && (
                        <span className="text-xs text-text-muted line-through">
                          {formatCurrency(product.price)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StockBadge stock={product.stock} />
                  </TableCell>
                  <TableCell>
                    <PublishedBadge isPublished={product.isPublished} />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={ROUTES.adminProductEdit(product.id)} />}>
                          <Pencil /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={duplicatingId === product.id}
                          onClick={() => handleDuplicate(product.id)}
                        >
                          <Copy /> {duplicatingId === product.id ? "Duplicating…" : "Duplicate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting({ id: product.id, name: product.name })}
                        >
                          <Trash2 /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {result.totalPages > 1 && (
          <div className="border-t border-divider p-4">
            <Pagination currentPage={result.page} totalPages={result.totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Delete product?"
        description={`This will permanently delete "${deleting?.name}" and all of its images and variants. This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </>
  );
}
