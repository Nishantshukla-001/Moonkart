import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { OrderItemsList } from "@/features/orders/components/OrderItemsList";
import { OrderTotalsSummary } from "@/features/orders/components/OrderTotalsSummary";
import { ShippingAddressSummary } from "@/features/orders/components/ShippingAddressSummary";
import { getOrderByNumber } from "@/features/orders/services/order.service";
import { ROUTES } from "@/constants/routes";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/utils/formatDate";

export const metadata: Metadata = { title: "Order Confirmed" };

interface OrderSuccessPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderSuccessPage({ params }: OrderSuccessPageProps) {
  const user = await requireUser();
  const { orderNumber } = await params;

  const order = await getOrderByNumber(user.id, orderNumber);
  if (!order) notFound();

  const estimatedDelivery = new Date(order.createdAt);
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 7);

  return (
    <Container className="flex flex-col gap-8 py-10 sm:py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-text-primary sm:text-[32px]">
          Order Placed Successfully!
        </h1>
        <p className="text-base text-text-secondary">
          Thank you for shopping with MoonKart. Your order{" "}
          <span className="font-semibold text-text-primary">{order.orderNumber}</span> has been confirmed.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="flex flex-col gap-4 p-6 lg:col-span-2">
          <h2 className="font-heading text-lg font-semibold text-text-primary">Order Summary</h2>
          <OrderItemsList items={order.items} />
          <div className="border-t border-divider pt-4">
            <OrderTotalsSummary order={order} />
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          <Card className="p-6">
            <h2 className="mb-3 font-heading text-sm font-semibold text-text-primary">Shipping Address</h2>
            <ShippingAddressSummary order={order} />
          </Card>

          <Card className="p-6">
            <h2 className="mb-1 font-heading text-sm font-semibold text-text-primary">Estimated Delivery</h2>
            <p className="text-sm text-text-secondary">{formatDate(estimatedDelivery)}</p>
          </Card>

          <div className="flex flex-col gap-3">
            <Button size="lg" className="w-full" render={<Link href={ROUTES.products} />}>
              Continue Shopping
            </Button>
            <Button size="lg" variant="outline" className="w-full" render={<Link href={ROUTES.orders} />}>
              View Orders
            </Button>
          </div>
        </div>
      </div>
    </Container>
  );
}
