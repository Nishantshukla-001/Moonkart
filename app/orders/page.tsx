import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { ProductsPagination } from "@/features/products/components/ProductsPagination";
import { getOrdersForUser } from "@/features/orders/services/order.service";
import { ROUTES } from "@/constants/routes";
import { requireUser } from "@/lib/auth";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

export const metadata: Metadata = { title: "My Orders" };

interface OrdersPageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const user = await requireUser();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const result = await getOrdersForUser(user.id, page, 10);

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <div>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "My Account", href: ROUTES.account }, { label: "Orders" }]} />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">My Orders</h1>
      </div>

      {result.items.length === 0 ? (
        <div className="flex flex-col items-center gap-4">
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="When you place an order, it will show up here."
          />
          <Button render={<Link href={ROUTES.products} />}>Shop Products</Button>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {result.items.map((order) => (
              <Link key={order.id} href={ROUTES.order(order.id)}>
                <Card className="flex flex-col gap-4 p-5 transition-all duration-[250ms] hover:-translate-y-0.5 hover:shadow-soft-lg sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-heading text-sm font-semibold text-text-primary">
                        {order.orderNumber}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-text-muted">
                      Placed on {formatDate(order.createdAt)} · {order.items.length} item
                      {order.items.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <p className="font-heading text-base font-semibold text-text-primary">
                    {formatCurrency(order.totalAmount)}
                  </p>
                </Card>
              </Link>
            ))}
          </div>

          {result.totalPages > 1 && (
            <ProductsPagination basePath={ROUTES.orders} currentPage={result.page} totalPages={result.totalPages} />
          )}
        </>
      )}
    </Container>
  );
}
