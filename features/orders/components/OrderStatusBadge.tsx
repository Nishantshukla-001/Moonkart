import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatusValue } from "@/features/orders/validation/order.schema";

const statusStyles: Record<OrderStatusValue, string> = {
  PENDING: "bg-warning/20 text-warning",
  CONFIRMED: "bg-blush-light text-blush-hover",
  PROCESSING: "bg-blush-light text-blush-hover",
  PACKED: "bg-sage-light text-sage-hover",
  SHIPPED: "bg-sage-light text-sage-hover",
  OUT_FOR_DELIVERY: "bg-sage-light text-sage-hover",
  DELIVERED: "bg-success/15 text-success",
  CANCELLED: "bg-danger/15 text-danger",
  REFUNDED: "bg-text-muted/15 text-text-secondary",
};

export const ORDER_STATUS_LABELS: Record<OrderStatusValue, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

export function OrderStatusBadge({ status }: { status: OrderStatusValue }) {
  return (
    <Badge variant="outline" className={cn("border-transparent", statusStyles[status])}>
      {ORDER_STATUS_LABELS[status]}
    </Badge>
  );
}
