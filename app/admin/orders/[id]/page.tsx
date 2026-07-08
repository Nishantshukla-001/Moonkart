import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminOrderStatusControl } from "@/features/admin/components/AdminOrderStatusControl";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/card";
import { OrderItemsList } from "@/features/orders/components/OrderItemsList";
import { OrderTimeline } from "@/features/orders/components/OrderTimeline";
import { OrderTotalsSummary } from "@/features/orders/components/OrderTotalsSummary";
import { ShippingAddressSummary } from "@/features/orders/components/ShippingAddressSummary";
import { getOrderByIdAdmin } from "@/features/orders/services/order.service";
import { formatDate } from "@/utils/formatDate";

export const metadata: Metadata = { title: "Order Details" };

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: AdminOrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderByIdAdmin(id);
  if (!order) notFound();

  return (
    <>
      <AdminPageHeader
        title={order.orderNumber}
        description={`Placed on ${formatDate(order.createdAt)} · Payment: ${order.paymentMethod} (${order.paymentStatus.toLowerCase()})`}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Orders", href: "/admin/orders" },
          { label: order.orderNumber },
        ]}
        actions={<AdminOrderStatusControl orderId={order.id} status={order.status} />}
      />

      <Card className="p-6">
        <OrderTimeline status={order.status} />
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-6 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold text-text-primary">
            Products ({order.items.length})
          </h2>
          <OrderItemsList items={order.items} />
          <div className="border-t border-divider pt-4">
            <OrderTotalsSummary order={order} />
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="mb-3 font-heading text-sm font-semibold text-text-primary">Customer</h2>
            <div className="flex flex-col gap-0.5 text-sm text-text-secondary">
              <p className="font-medium text-text-primary">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="mb-3 font-heading text-sm font-semibold text-text-primary">Shipping Address</h2>
            <ShippingAddressSummary order={order} />
          </Card>
        </div>
      </div>
    </>
  );
}
