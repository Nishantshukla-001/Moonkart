"use client";

import { adminApi } from "@/features/admin/services/adminApi";
import type { AdminOrderQuery, OrderStatusValue } from "@/features/orders/validation/order.schema";
import type { IOrderWithItems, IPaginatedOrders } from "@/types/order";

function buildQueryString(query: Partial<AdminOrderQuery>) {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") params.set(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const adminOrderService = {
  list: (query: Partial<AdminOrderQuery> = {}) =>
    adminApi.get<IPaginatedOrders>(`/api/admin/orders${buildQueryString(query)}`),
  getById: (id: string) => adminApi.get<IOrderWithItems>(`/api/admin/orders/${id}`),
  updateStatus: (id: string, status: OrderStatusValue) =>
    adminApi.put<IOrderWithItems>(`/api/admin/orders/${id}`, { status }),
};
