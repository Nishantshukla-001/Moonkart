"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminOrderService } from "@/features/admin/services/adminOrder.service";
import type { OrderStatusValue } from "@/features/orders/validation/order.schema";

const STATUS_OPTIONS: OrderStatusValue[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export function AdminOrderStatusControl({ orderId, status }: { orderId: string; status: OrderStatusValue }) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  async function handleChange(next: OrderStatusValue) {
    setIsUpdating(true);
    const response = await adminOrderService.updateStatus(orderId, next);
    setIsUpdating(false);

    if (!response.success) {
      toast.error(response.message || "Could not update order status.");
      return;
    }
    toast.success("Order status updated.");
    router.refresh();
  }

  return (
    <Select value={status} onValueChange={(value) => handleChange(value as OrderStatusValue)} disabled={isUpdating}>
      <SelectTrigger className="w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option} value={option}>
            {option.charAt(0) + option.slice(1).toLowerCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
