"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Search, ShoppingCart } from "lucide-react";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination } from "@/components/shared/Pagination";
import { ORDER_STATUS_LABELS, OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { ROUTES } from "@/constants/routes";
import { adminOrderService } from "@/features/admin/services/adminOrder.service";
import { orderStatusSchema, type AdminOrderQuery, type OrderStatusValue } from "@/features/orders/validation/order.schema";
import { debounce } from "@/utils/debounce";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import type { IPaginatedOrders } from "@/types/order";

const STATUS_OPTIONS = orderStatusSchema.options;

interface OrdersClientProps {
  result: IPaginatedOrders;
  query: AdminOrderQuery;
}

export function OrdersClient({ result, query }: OrdersClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(query.search ?? "");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all") params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`${ROUTES.adminOrders}?${params.toString()}`);
  }

  const debouncedSearch = useMemo(
    () => debounce((value: string) => updateParams({ search: value || undefined }), 400),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- stable across renders; mirrors ProductsClient's identical pattern
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
    router.push(`${ROUTES.adminOrders}?${params.toString()}`);
  }

  async function handleStatusChange(orderId: string, status: OrderStatusValue) {
    setUpdatingId(orderId);
    const response = await adminOrderService.updateStatus(orderId, status);
    setUpdatingId(null);

    if (!response.success) {
      toast.error(response.message || "Could not update order status.");
      return;
    }
    toast.success("Order status updated.");
    router.refresh();
  }

  return (
    <>
      <AdminPageHeader
        title="Orders"
        description={`${result.total} order${result.total === 1 ? "" : "s"} placed.`}
        breadcrumbs={[{ label: "Dashboard", href: "/admin/dashboard" }, { label: "Orders" }]}
      />

      <Card className="p-0">
        <div className="flex flex-col gap-3 border-b border-divider p-4 lg:flex-row lg:items-center lg:flex-wrap">
          <div className="relative w-full lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-text-muted" />
            <Input
              value={searchValue}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search by order #, name, or email…"
              className="pl-9"
            />
          </div>

          <Select value={query.status} onValueChange={(value) => updateParams({ status: value ?? undefined })}>
            <SelectTrigger className="w-full lg:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {ORDER_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={query.sort} onValueChange={(value) => updateParams({ sort: value ?? undefined })}>
            <SelectTrigger className="w-full lg:w-40">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="total-desc">Total (High–Low)</SelectItem>
              <SelectItem value="total-asc">Total (Low–High)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {result.items.length === 0 ? (
          <div className="p-6">
            <AdminEmptyState
              icon={ShoppingCart}
              title="No orders found"
              description="Try adjusting your search or filters."
            />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Update Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={ROUTES.adminOrders + `/${order.id}`}
                      className="font-medium text-text-primary hover:text-blush-hover"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-text-primary">{order.customerName}</span>
                      <span className="text-xs text-text-muted">{order.customerEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-text-muted">{formatDate(order.createdAt)}</TableCell>
                  <TableCell className="text-text-muted">{order.items.length}</TableCell>
                  <TableCell className="font-medium text-text-primary">
                    {formatCurrency(order.totalAmount)}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={order.status}
                      onValueChange={(value) => handleStatusChange(order.id, value as OrderStatusValue)}
                      disabled={updatingId === order.id}
                    >
                      <SelectTrigger className="ml-auto w-40" size="sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={status}>
                            {ORDER_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
    </>
  );
}
