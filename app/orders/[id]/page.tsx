import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumb } from "@/components/shared/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { Card } from "@/components/ui/card";
import { OrderItemsList } from "@/features/orders/components/OrderItemsList";
import { OrderStatusBadge } from "@/features/orders/components/OrderStatusBadge";
import { OrderTimeline } from "@/features/orders/components/OrderTimeline";
import { OrderTotalsSummary } from "@/features/orders/components/OrderTotalsSummary";
import { ShippingAddressSummary } from "@/features/orders/components/ShippingAddressSummary";
import { getOrderById } from "@/features/orders/services/order.service";
import { ROUTES } from "@/constants/routes";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/utils/formatDate";

export const metadata: Metadata = { title: "Order Details" };

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const order = await getOrderById(user.id, id);
  if (!order) notFound();

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <div>
        <Breadcrumb
          items={[
            { label: "Home", href: "/" },
            { label: "My Account", href: ROUTES.account },
            { label: "My Orders", href: ROUTES.orders },
            { label: order.orderNumber },
          ]}
        />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
            {order.orderNumber}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-1 text-sm text-text-secondary">Placed on {formatDate(order.createdAt)}</p>
      </div>

      <Card className="p-6">
        <OrderTimeline status={order.status} />
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-6 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            Products ({order.items.length})
          </h2>
          <OrderItemsList items={order.items} />
          <div className="border-t border-divider pt-4">
            <OrderTotalsSummary order={order} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-3 font-heading text-sm font-semibold text-text-primary">Shipping Address</h2>
          <ShippingAddressSummary order={order} />
        </Card>
      </div>
    </Container>
  );
}
