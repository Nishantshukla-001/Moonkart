import type { Metadata } from "next";

import { OrdersClient } from "@/features/admin/components/OrdersClient";
import { getOrdersAdmin } from "@/features/orders/services/order.service";
import { adminOrderQuerySchema } from "@/features/orders/validation/order.schema";

export const metadata: Metadata = { title: "Orders" };

interface AdminOrdersPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const rawParams = await searchParams;
  const query = adminOrderQuerySchema.parse(rawParams);

  const result = await getOrdersAdmin(query);

  return <OrdersClient result={result} query={query} />;
}
